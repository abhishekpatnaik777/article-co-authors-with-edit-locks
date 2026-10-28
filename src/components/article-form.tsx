"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { articleSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";

type ArticleFormValues = z.input<typeof articleSchema>;

type ArticleFormProps = {
  mode: "create" | "edit";
  articleId?: string;
  defaultValues: ArticleFormValues;
  users: Array<{ id: string; name: string }>;
  lockState?: {
    locked: boolean;
    error: string | null;
    clientId?: string;
  };
  onSaved?: () => void;
};

export function ArticleForm({ mode, articleId, defaultValues, users, lockState, onSaved }: ArticleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(lockState?.error ?? null);
  const [saving, setSaving] = useState(false);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues,
  });

  useEffect(() => {
    setError(lockState?.error ?? null);
  }, [lockState?.error]);

  const options = useMemo(
    () => users.map((user) => ({ label: user.name, value: user.id })),
    [users],
  );

  const locked = mode === "edit" && !lockState?.locked;
  const displayError = error ?? lockState?.error ?? null;

  return (
    <form
      className="card article-form"
      onSubmit={form.handleSubmit(async (values) => {
        setSaving(true);
        setError(null);

        let payload: { error?: string; articleId?: string };

        try {
          const response = await fetch(mode === "create" ? "/api/articles" : `/api/articles/${articleId}`, {
            method: mode === "create" ? "POST" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...values,
              clientId: lockState?.clientId,
            }),
          });

          payload = (await response.json().catch(() => ({}))) as { error?: string; articleId?: string };

          if (!response.ok) {
            setError(payload.error ?? "Unable to save article.");
            setSaving(false);
            return;
          }
        } catch {
          setError(
            mode === "edit"
              ? "You lost the edit lock. Please refresh to continue."
              : "Unable to save article.",
          );
          setSaving(false);
          return;
        }

        onSaved?.();
        router.push(`/articles/${payload.articleId ?? articleId}`);
        router.refresh();
      })}
    >
      <div className="field">
        <label htmlFor="title">Title</label>
        <Input id="title" disabled={locked || saving} {...form.register("title")} />
        {form.formState.errors.title ? <p className="error-text">{form.formState.errors.title.message}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="body">Body</label>
        <Textarea id="body" rows={10} disabled={locked || saving} {...form.register("body")} />
        {form.formState.errors.body ? <p className="error-text">{form.formState.errors.body.message}</p> : null}
      </div>
      <div className="field">
        <label>Co-Authors</label>
        <Controller
          control={form.control}
          name="coAuthorIds"
          render={({ field }) => (
            <MultiSelect
              options={options}
              value={field.value ?? []}
              onChange={field.onChange}
              disabled={locked || saving}
            />
          )}
        />
      </div>
      {displayError ? <p className="error-banner">{displayError}</p> : null}
      <div className="form-actions">
        <Button type="submit" disabled={locked || saving}>
          {saving ? "Saving..." : "Save article"}
        </Button>
      </div>
    </form>
  );
}