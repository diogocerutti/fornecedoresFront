import { LoginForm } from "@/components/auth/LoginForm";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-label="Portal de fornecedores">
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            F
          </span>
          <span>Fornecedores</span>
        </div>

        <div className={styles.introduction}>
          <span className={styles.eyebrow}>Portal de parceiros</span>
          <h1>Mais agilidade para cuidar do que importa.</h1>
          <p>
            Acesse sua conta para acompanhar solicitações, documentos e todas
            as informações da sua parceria em um só lugar.
          </p>
        </div>

        <p className={styles.supportText}>
          Precisa de ajuda? <a href="mailto:suporte@fornecedores.com.br">Fale com o suporte</a>
        </p>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.mobileBrand} aria-hidden="true">
          <span className={styles.brandMark}>F</span>
          <span>Fornecedores</span>
        </div>

        <div className={styles.formWrapper}>
          <div className={styles.formHeading}>
            <span className={styles.eyebrow}>Bem-vindo de volta</span>
            <h2>Acesse sua conta</h2>
            <p>Informe seus dados para continuar.</p>
          </div>

          <LoginForm />
        </div>

        <p className={styles.footer}>© 2026 Portal de Fornecedores</p>
      </section>
    </main>
  );
}
