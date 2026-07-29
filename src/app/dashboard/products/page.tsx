"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type Measure = {
  id: string;
  name: string;
  abbreviation: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  measure: Measure;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [productsResponse, measuresResponse] = await Promise.all([
          fetch(`${API_URL}/api/products`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`${API_URL}/api/measures`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!productsResponse.ok || !measuresResponse.ok) {
          throw new Error("Não foi possível carregar os produtos.");
        }

        const productsData = (await productsResponse.json()) as {
          products: Product[];
        };
        const measuresData = (await measuresResponse.json()) as {
          measures: Measure[];
        };

        setProducts(productsData.products);
        setMeasures(measuresData.measures);
      } catch (requestError) {
        if (
          requestError instanceof Error &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setLoadError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os produtos.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        setIsModalOpen(false);
        setFormError(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isSubmitting]);

  useEffect(() => {
    if (!feedback) return;

    const timeout = window.setTimeout(() => setFeedback(null), 3_500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedSearch) return products;

    return products.filter((product) =>
      product.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );
  }, [products, search]);

  function closeModal() {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setFormError(null);
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          measureId: formData.get("measureId"),
          description: formData.get("description"),
        }),
      });

      const data = (await response.json()) as {
        product?: Product;
        message?: string;
      };

      if (!response.ok || !data.product) {
        throw new Error(data.message ?? "Não foi possível cadastrar o produto.");
      }

      setProducts((currentProducts) =>
        [...currentProducts, data.product as Product].sort((first, second) =>
          first.name.localeCompare(second.name, "pt-BR"),
        ),
      );
      form.reset();
      setIsModalOpen(false);
      setFeedback({
        type: "success",
        message: "Produto cadastrado com sucesso.",
      });
    } catch (requestError) {
      setFormError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível cadastrar o produto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o produto "${product.name}"?`,
    );

    if (!confirmed) return;

    setDeletingProductId(product.id);
    setFeedback(null);

    try {
      const response = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Não foi possível excluir o produto.");
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) => currentProduct.id !== product.id,
        ),
      );
      setFeedback({
        type: "success",
        message: data.message ?? "Produto excluído com sucesso.",
      });
    } catch (requestError) {
      setFeedback({
        type: "error",
        message:
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível excluir o produto.",
      });
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <section className={styles.page}>
      {feedback ? (
        <div
          className={`${styles.toast} ${
            feedback.type === "success"
              ? styles.toastSuccess
              : styles.toastError
          }`}
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live={feedback.type === "error" ? "assertive" : "polite"}
        >
          <span className={styles.toastIcon} aria-hidden="true">
            {feedback.type === "success" ? "✓" : "!"}
          </span>
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Produtos</span>
          <h1>Lista de produtos</h1>
          <p>Consulte e gerencie os produtos cadastrados.</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <span className={styles.srOnly}>Pesquisar produto pelo nome</span>
            <span className={styles.searchIcon} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar produto por nome..."
            />
          </label>

          <button
            className={styles.createButton}
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            <span aria-hidden="true">+</span>
            Cadastrar produto
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Nome</th>
                <th scope="col">Unidade de medida</th>
                <th scope="col">Descrição</th>
                <th className={styles.actionsHeader} scope="col">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className={styles.tableMessage} colSpan={5}>
                    Carregando produtos...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td
                    className={`${styles.tableMessage} ${styles.error}`}
                    colSpan={5}
                  >
                    {loadError}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td className={styles.tableMessage} colSpan={5}>
                    {search
                      ? "Nenhum produto encontrado para esta pesquisa."
                      : "Nenhum produto cadastrado."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.idCell}>{product.id}</td>
                    <td className={styles.nameCell}>{product.name}</td>
                    <td>
                      <span className={styles.measure}>
                        {product.measure.name}
                        <small>{product.measure.abbreviation}</small>
                      </span>
                    </td>
                    <td className={styles.descriptionCell}>
                      {product.description || "—"}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          type="button"
                          title="A edição será implementada na próxima etapa"
                        >
                          Editar Produto
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          type="button"
                          onClick={() => void handleDeleteProduct(product)}
                          disabled={deletingProductId === product.id}
                        >
                          {deletingProductId === product.id
                            ? "Excluindo..."
                            : "Deletar Produto"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !loadError ? (
          <div className={styles.tableFooter}>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "produto encontrado"
              : "produtos encontrados"}
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-product-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.eyebrow}>Novo cadastro</span>
                <h2 id="create-product-title">Cadastrar produto</h2>
              </div>
              <button
                className={styles.closeButton}
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={handleCreateProduct}>
              <label className={styles.field}>
                <span>Nome</span>
                <input
                  name="name"
                  type="text"
                  maxLength={160}
                  placeholder="Ex.: Café torrado"
                  disabled={isSubmitting}
                  autoFocus
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Unidade de medida</span>
                <select name="measureId" disabled={isSubmitting} required>
                  <option value="">Selecione uma unidade</option>
                  {measures.map((measure) => (
                    <option key={measure.id} value={measure.id}>
                      {measure.name} ({measure.abbreviation})
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>
                  Descrição <small>Opcional</small>
                </span>
                <textarea
                  name="description"
                  maxLength={5_000}
                  rows={4}
                  placeholder="Inclua informações complementares sobre o produto."
                  disabled={isSubmitting}
                />
              </label>

              {formError ? (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              ) : null}

              <div className={styles.formActions}>
                <button
                  className={styles.cancelButton}
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  className={styles.saveButton}
                  type="submit"
                  disabled={isSubmitting || measures.length === 0}
                >
                  {isSubmitting ? "Salvando..." : "Cadastrar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
