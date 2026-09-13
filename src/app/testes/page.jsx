"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export default function TestesPage() {
  const [measures, setMeasures] = useState([]);

  useEffect(() => {
    async function loadMeasures() {
      try {
        const response = await fetch(`${API_URL}/api/measures`);

        /*if (!response.ok) {
          throw new Error("Não foi possível carregar as unidades de medida.");
        }*/

        console.log(response);
        setMeasures(response);
      } catch (requestError) {
        if (
          requestError instanceof Error &&
          requestError.name === "AbortError"
        ) {
          return;
        }
      } finally {
      }
    }

    void loadMeasures();
  }, []);

  return <div>oi</div>;
}
