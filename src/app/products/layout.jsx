import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Produtos | Portal de Fornecedores",
};

export default function ProductsLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
