"use client";

import { useEffect, useRef, useState } from "react";

import { HEARTBEAT_INTERVAL_MS } from "@/lib/config";
import { ArticleForm } from "@/components/article-form";

type EditShellProps = {
  articleId: string;
  defaultValues: {
    title: string;
    body: string;
    coAuthorIds: string[];
  };
  users: Array<{ id: string; name: string }>;
  initialError: string | null;
};

function buildClientId() {
  return crypto.randomUUID();
}

const LOST_LOCK_MESSAGE = "You lost the edit lock. Please refresh to continue.";

export function EditArticleShell({ articleId, defaultValues, users, initialError }: EditShellProps) {
  const [error, setError] = useState<string | null>(initialError);
  const [locked, setLocked] = useState(false);
  const [clientId, setClientId] = useState(() => buildClientId());
  const savedRef = useRef(false);

  useEffect(() => {
    const sessionClientId = buildClientId();
    setClientId(sessionClientId);
    savedRef.current = false;

    let active = true;
    let heartbeatTimer: number | undefined;
    let acquired = false;
    const abortController = new AbortController();

    async function releaseLock() {
      if (savedRef.current) {
        return;
      }

      try {
        await fetch(`/api/articles/${articleId}/lock`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: sessionClientId }),
          keepalive: true,
        });
      } catch {
        // Best-effort release on navigate / unload.
      }
    }

    async function acquireLock() {
      try {
        const response = await fetch(`/api/articles/${articleId}/lock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: sessionClientId }),
          signal: abortController.signal,
        });

        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!active) {
          if (response.ok) {
            await releaseLock();
          }
          return;
        }

        if (!response.ok) {
          setError(payload.error ?? "This article is locked.");
          setLocked(false);
          return;
        }

        acquired = true;
        setLocked(true);
        setError(null);

        heartbeatTimer = window.setInterval(async () => {
          try {
            const heartbeatResponse = await fetch(`/api/articles/${articleId}/heartbeat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clientId: sessionClientId }),
              signal: abortController.signal,
            });

            if (!active) {
              return;
            }

            if (heartbeatResponse.ok) {
              return;
            }

            const heartbeatPayload = (await heartbeatResponse.json().catch(() => ({}))) as { error?: string };
            setError(heartbeatPayload.error ?? LOST_LOCK_MESSAGE);
            setLocked(false);
            acquired = false;
            if (heartbeatTimer) {
              window.clearInterval(heartbeatTimer);
            }
          } catch (error) {
            if (!active || (error instanceof DOMException && error.name === "AbortError")) {
              return;
            }

            setError(LOST_LOCK_MESSAGE);
            setLocked(false);
            acquired = false;
            if (heartbeatTimer) {
              window.clearInterval(heartbeatTimer);
            }
          }
        }, HEARTBEAT_INTERVAL_MS);
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }

        setError(LOST_LOCK_MESSAGE);
        setLocked(false);
      }
    }

    void acquireLock();

    const handleBeforeUnload = () => {
      void releaseLock();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      active = false;
      abortController.abort();
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
      }
      if (acquired) {
        void releaseLock();
      }
    };
  }, [articleId]);

  return (
    <ArticleForm
      mode="edit"
      articleId={articleId}
      defaultValues={defaultValues}
      users={users}
      lockState={{ locked, error, clientId }}
      onSaved={() => {
        savedRef.current = true;
      }}
    />
  );
}
