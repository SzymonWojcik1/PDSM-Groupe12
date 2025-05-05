"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CreerIndicateurOutcomePage() {
  const router = useRouter();
  const params = useParams();
  const cadId = params?.id;
  const objId = params?.objId;
  const outId = params?.outId;

  const [indCode, setIndCode] = useState("");
  const [indNom, setIndNom] = useState("");
  const [indValeurCible, setIndValeurCible] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!indCode || !indNom || !indValeurCible) {
      setError("Tous les champs sont obligatoires.");
      setLoading(false);
      return;
    }
    if (!outId) {
      setError("L'outcome sélectionné est introuvable (outId manquant).");
      setLoading(false);
      return;
    }
    const payload = {
      ind_code: indCode,
      ind_nom: indNom,
      ind_valeurCible: Number(indValeurCible),
      out_id: Number(outId),
      opu_id: null,
    };
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur lors de la création");
      router.push(`/cadre-logique/${cadId}/objectif-general/${objId}/outcome`);
    } catch (err) {
      setError("Erreur lors de la création de l'indicateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Créer un indicateur pour l'outcome</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
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
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800" disabled={loading}>
            {loading ? "Création..." : "Créer"}
          </button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => router.back()}>
            Annuler
          </button>
        </div>
      </form>
    </main>
  );
} 