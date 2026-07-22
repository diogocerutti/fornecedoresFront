"use client";

import { FormEvent, useState } from "react";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((visible) => !visible)}
            aria-controls="password"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <label className={styles.remember}>
        <input type="checkbox" name="remember" />
        <span>Lembrar de mim neste dispositivo</span>
      </label>

      <button className={styles.submitButton} type="submit">
        Entrar
      </button>

      <p className={styles.securityNote}>
        Seus dados são protegidos e usados somente para acessar o portal.
      </p>
    </form>
  );
}
