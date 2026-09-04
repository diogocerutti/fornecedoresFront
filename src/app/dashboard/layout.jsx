import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard | Portal de Fornecedores",
};

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
