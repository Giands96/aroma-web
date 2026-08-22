import { redirect } from "next/navigation";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import DashboardShell from "./dashboard/_components/DashboardShell";
import { ROUTES } from "@/app/shared/routes/routes";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect(ROUTES.LOGIN_ERROR("admin"));
  }

  return <DashboardShell>{children}</DashboardShell>;
}
