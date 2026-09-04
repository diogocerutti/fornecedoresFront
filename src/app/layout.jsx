import "./globals.css";

export const metadata = {
  title: "Login | Portal de Fornecedores",
  description: "Acesse o Portal de Fornecedores.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
