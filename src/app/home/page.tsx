"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        <Link className={styles.brand} href="/home" aria-label="Fornecedores - Início">
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
        <Link
          className={`${styles.navItem} ${styles.navItemActive}`}
          href="/home"
          aria-current="page"
          aria-label="Início"
        >
          <span className={styles.homeIcon} aria-hidden="true">
            <span />
          </span>
          <span>Início</span>
        </Link>
      </aside>

      <main className={styles.content} aria-label="Conteúdo principal" />
    </div>
  );
}
