"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function UpdateIndicateurOutputPage() {
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const objId = params?.objId;
  const outId = params?.outId;
  const opuId = params?.opuId;
  const indId = params?.indId;

  const [indCode, setIndCode] = useState("");
  const [indNom, setIndNom] = useState("");
  const [indValeurCible, setIndValeurCible] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (indId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs/${indId}`)
        .then((response) => response.json())
        .then((data) => {
          setIndCode(data.ind_code);
          setIndNom(data.ind_nom);
          setIndValeurCible(data.ind_valeurCible);
        });
    }
  }, [indId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!indCode || !indNom || !indValeurCible) {
      setError("Tous les champs sont obligatoires.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs/${indId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ind_code: indCode,
          ind_nom: indNom,
          ind_valeurCible: Number(indValeurCible),
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la modification");
      router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome/${outId}/output`);
    } catch (err) {
      setError("Erreur lors de la modification de l'indicateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Modifier l'indicateur</h1>
      <form onSubmit={handleUpdate} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block mb-1 font-semibold">Code</label>
          <input type="text" value={indCode} onChange={e => setIndCode(e.target.value)} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Nom</label>
          <input type="text" value={indNom} onChange={e => setIndNom(e.target.value)} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Valeur cible</label>
          <input type="number" value={indValeurCible} onChange={e => setIndValeurCible(e.target.value)} className="w-full border px-2 py-1 rounded" required />
        </div>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800" disabled={loading}>
            {loading ? "Modification..." : "Mettre à jour"}
          </button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => router.back()}>
            Annuler
          </button>
        </div>
      </form>
    </main>
  );
} 