import { Header } from "@/components/header";

export const instant = false;

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-shell">{children}</main>
    </div>
  );
}