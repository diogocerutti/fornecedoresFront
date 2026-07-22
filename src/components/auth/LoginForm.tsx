"use client";

import { FormEvent, useState } from "react";
import styles from "./LoginForm.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
};

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          remember: formData.get("remember") === "on",
        }),
      });

      const data = (await response.json()) as LoginResponse | { message?: string };

      if (!response.ok) {
        throw new Error(
          "message" in data && data.message
            ? data.message
            : "Não foi possível entrar. Tente novamente.",
        );
      }

      const login = data as LoginResponse;
      setMessage({
        type: "success",
        text: `Login realizado com sucesso. Bem-vindo, ${login.user.name}!`,
      });
      form.reset();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível conectar ao servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seuemail@empresa.com.br"
          autoComplete="email"
          inputMode="email"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="password">Senha</label>
          <a href="#">Esqueci minha senha</a>
        </div>

        <div className={styles.passwordField}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            minLength={6}
            disabled={isSubmitting}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((visible) => !visible)}
            disabled={isSubmitting}
            aria-controls="password"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <label className={styles.remember}>
        <input type="checkbox" name="remember" disabled={isSubmitting} />
        <span>Lembrar de mim neste dispositivo</span>
      </label>

      {message ? (
        <p
          className={`${styles.statusMessage} ${styles[message.type]}`}
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {message.text}
        </p>
      ) : null}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      <p className={styles.securityNote}>
        Seus dados são protegidos e usados somente para acessar o portal.
      </p>
    </form>
  );
}
