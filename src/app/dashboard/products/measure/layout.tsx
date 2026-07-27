import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unidade de Medida | Portal de Fornecedores",
};

export default function MeasureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
