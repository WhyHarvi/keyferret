import type { ReactNode } from "react";
import Footer from "@/components/Footer";

type LegalPageProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 py-28 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-text-muted">Legal</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-text-muted">Last updated {updated}</p>
          <div className="mt-10 flex flex-col gap-8">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
