import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import DashboardShell from "./dashboard/_components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login?error=admin");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
