"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import styles from "./DashboardShell.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isProductsSection = pathname.startsWith("/dashboard/products");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(isProductsSection);

  useEffect(() => {
    const controller = new AbortController();

    async function validateSession() {
      try {
        const response = await fetch(`${API_URL}/api/auth/session`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          router.replace("/");
          return;
        }

        const data = (await response.json()) as { user: SessionUser };
        setUser(data.user);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        router.replace("/");
      }
    }

    void validateSession();
    return () => controller.abort();
  }, [router]);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.replace("/");
    }
  }

  if (!user) {
    return (
      <main className={styles.loadingPage} aria-busy="true">
        <span className={styles.loadingMark} aria-hidden="true">
          F
        </span>
        <span className={styles.srOnly}>Validando sua sessão...</span>
      </main>
    );
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link
          className={styles.brand}
          href="/dashboard"
          aria-label="Fornecedores - Dashboard"
        >
          <span className={styles.brandMark} aria-hidden="true">
            F
          </span>
          <span className={styles.brandName}>Fornecedores</span>
        </Link>

        <div className={styles.headerActions}>
          <span className={styles.userName}>{user.name}</span>
          <button
            className={styles.logoutButton}
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </header>

      <aside className={styles.sidebar} aria-label="Navegação principal">
        <nav className={styles.navigation}>
          <Link
            className={`${styles.navItem} ${
              pathname === "/dashboard" ? styles.navItemActive : ""
            }`}
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
          >
            <span className={styles.homeIcon} aria-hidden="true">
              <span />
            </span>
            <span>Dashboard</span>
          </Link>

          <div className={styles.dropdown}>
            <button
              className={`${styles.navItem} ${styles.dropdownButton} ${
                isProductsSection ? styles.navItemActive : ""
              }`}
              type="button"
              onClick={() => setIsProductsOpen((open) => !open)}
              aria-expanded={isProductsOpen}
              aria-controls="products-menu"
            >
              <span className={styles.productIcon} aria-hidden="true" />
              <span>Produtos</span>
              <span
                className={`${styles.chevron} ${
                  isProductsOpen ? styles.chevronOpen : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {isProductsOpen ? (
              <div className={styles.submenu} id="products-menu">
                <Link
                  className={`${styles.submenuItem} ${
                    pathname === "/dashboard/products"
                      ? styles.submenuItemActive
                      : ""
                  }`}
                  href="/dashboard/products"
                  aria-current={
                    pathname === "/dashboard/products" ? "page" : undefined
                  }
                >
                  Lista
                </Link>
                <Link
                  className={`${styles.submenuItem} ${
                    pathname === "/dashboard/products/measure"
                      ? styles.submenuItemActive
                      : ""
                  }`}
                  href="/dashboard/products/measure"
                  aria-current={
                    pathname === "/dashboard/products/measure"
                      ? "page"
                      : undefined
                  }
                >
                  Unidade de Medida
                </Link>
              </div>
            ) : null}
          </div>
        </nav>
      </aside>

      <main className={styles.content} aria-label="Conteúdo principal">
        {children}
      </main>
    </div>
  );
}
