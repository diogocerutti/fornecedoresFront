import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produtos | Portal de Fornecedores",
};

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
