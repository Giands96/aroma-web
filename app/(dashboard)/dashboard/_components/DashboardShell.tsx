import { ReactNode } from "react";
import DashboardHeader from "./DashboardHeader";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-svh bg-zinc-50/70">
      <DashboardHeader />
      <main className="pb-20 md:pl-64 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
