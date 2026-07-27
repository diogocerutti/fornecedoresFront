"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type Measure = {
  id: string;
  name: string;
  abbreviation: string;
};

export default function MeasurePage() {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMeasures() {
      try {
        const response = await fetch(`${API_URL}/api/measures`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as unidades de medida.");
        }

        const data = (await response.json()) as { measures: Measure[] };
        setMeasures(data.measures);
      } catch (requestError) {
        if (
          requestError instanceof Error &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as unidades de medida.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadMeasures();
    return () => controller.abort();
  }, []);

  const filteredMeasures = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedSearch) return measures;

    return measures.filter((measure) =>
      measure.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );
  }, [measures, search]);

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Produtos</span>
          <h1>Unidades de medida</h1>
          <p>Consulte as unidades utilizadas no cadastro dos produtos.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <span className={styles.srOnly}>
              Pesquisar unidade de medida pelo nome
            </span>
            <span className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar por nome..."
            />
          </label>

          <button className={styles.createButton} type="button">
            <span aria-hidden="true">+</span>
            Cadastrar unidade de medida
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nome</th>
                <th scope="col">Abreviação</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className={styles.tableMessage} colSpan={3}>
                    Carregando unidades de medida...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className={`${styles.tableMessage} ${styles.error}`} colSpan={3}>
                    {error}
                  </td>
                </tr>
              ) : filteredMeasures.length === 0 ? (
                <tr>
                  <td className={styles.tableMessage} colSpan={3}>
                    {search
                      ? "Nenhuma unidade encontrada para esta pesquisa."
                      : "Nenhuma unidade de medida cadastrada."}
                  </td>
                </tr>
              ) : (
                filteredMeasures.map((measure) => (
                  <tr key={measure.id}>
                    <td className={styles.idCell}>{measure.id}</td>
                    <td className={styles.nameCell}>{measure.name}</td>
                    <td>
                      <span className={styles.abbreviation}>
                        {measure.abbreviation}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error ? (
          <div className={styles.tableFooter}>
            {filteredMeasures.length}{" "}
            {filteredMeasures.length === 1
              ? "unidade encontrada"
              : "unidades encontradas"}
          </div>
        ) : null}
      </div>
    </section>
  );
}
