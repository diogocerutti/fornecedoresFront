import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Login | Portal de Fornecedores",
  description: "Acesse o Portal de Fornecedores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
