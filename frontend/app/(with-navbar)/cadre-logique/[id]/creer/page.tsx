'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Indicateur = {
  ind_id: number;
  ind_nom: string;
  ind_code: string;
  ind_valeurCible: number;
  valeurReelle?: number;
};

type Output = {
  opu_id: number;
  opu_nom: string;
  opu_code: string;
  indicateurs: Indicateur[];
};

type Outcome = {
  out_id: number;
  out_nom: string;
  out_code: string;
  outputs: Output[];
};

type Objectif = {
  obj_id: number;
  obj_nom: string;
  outcomes: Outcome[];
};

export default function CadreLogiqueDetailPage() {
  const { id } = useParams();
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [nouveauObjectif, setNouveauObjectif] = useState('');
  const [error, setError] = useState('');

  const fetchObjectifs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/objectifs-generaux?cad_id=${id}`);
      const data: Objectif[] = await res.json();

      for (const obj of data) {
        const outRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outcomes?obj_id=${obj.obj_id}`);
        const outcomes: Outcome[] = await outRes.json();

        for (const outcome of outcomes) {
          const opRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outputs?out_id=${outcome.out_id}`);
          const outputs: Output[] = await opRes.json();

          for (const output of outputs) {
            const indRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs?opu_id=${output.opu_id}`);
            const indicateurs: Indicateur[] = await indRes.json();

            for (const ind of indicateurs) {
              try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateur/${ind.ind_id}/beneficiaires-count`);
                const countData = await res.json();
                ind.valeurReelle = countData.count || 0;
              } catch (err) {
                ind.valeurReelle = 0;
              }
            }

            output.indicateurs = indicateurs;
          }

          outcome.outputs = outputs;
        }

        obj.outcomes = outcomes;
      }

      setObjectifs(data);
    } catch (err) {
      console.error('Erreur chargement hiérarchie :', err);
    }
  };

  useEffect(() => {
    fetchObjectifs();
  }, [id]);

  const ajouterObjectif = async () => {
    if (!nouveauObjectif.trim()) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/objectifs-generaux`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obj_nom: nouveauObjectif, cad_id: id }),
    });

    if (res.ok) {
      setNouveauObjectif('');
      setError('');
      fetchObjectifs();
    } else {
      const data = await res.json();
      setError(data.message || 'Erreur lors de l’ajout');
    }
  };

  const ajouterOutcome = async (objId: number, count: number) => {
    const nom = prompt('Nom du nouvel outcome');
    if (!nom) return;
    const out_code = `${count + 1}`;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outcomes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ out_nom: nom, out_code, obj_id: objId }),
    });

    fetchObjectifs();
  };

  const ajouterOutput = async (outId: number, outputCount: number, outcomeIndex: number) => {
    const nom = prompt('Nom du nouvel output');
    if (!nom) return;
    const code = `${outcomeIndex + 1}.${outputCount + 1}`;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outputs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opu_nom: nom, opu_code: code, out_id: outId }),
    });

    fetchObjectifs();
  };

  const ajouterIndicateur = async (outId: number, opuId: number, indicateurCount: number, outcomeIndex: number, outputIndex: number) => {
    const nom = prompt('Nom de l’indicateur');
    const val = prompt('Valeur cible');
    if (!nom || !val || isNaN(parseInt(val))) return;

    const code = `${outcomeIndex + 1}.${outputIndex + 1}.${indicateurCount + 1}`;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/indicateurs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ind_nom: nom,
        ind_code: code,
        ind_valeurCible: parseInt(val),
        opu_id: opuId,
        out_id: outId,
      }),
    });

    fetchObjectifs();
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#9F0F3A] mb-1">Remplir le cadre logique</h1>
              <div className="h-1 w-20 bg-[#9F0F3A] rounded mb-4"></div>
              <p className="text-gray-600">Ajoutez les outcomes, outputs et indicateurs pour chaque objectif.</p>
            </div>
            <Link
              href="/cadre-logique"
              className="text-sm text-[#9F0F3A] border border-[#9F0F3A] px-4 py-2 rounded hover:bg-[#f4e6ea] transition"
            >
              Retour à la liste
            </Link>
          </div>
        </header>

        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Ajouter un objectif général</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={nouveauObjectif}
              onChange={(e) => setNouveauObjectif(e.target.value)}
              placeholder="Nom de l’objectif"
              className="flex-1 border border-gray-300 rounded px-4 py-2"
            />
            <button
              onClick={ajouterObjectif}
              className="bg-[#9F0F3A] text-white px-4 py-2 rounded hover:bg-[#800d30]"
            >
              + Objectif
            </button>
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {objectifs.map((obj, i) => (
          <div key={obj.obj_id} className="bg-white p-6 rounded-xl shadow mb-10 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{obj.obj_nom}</h2>

            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 w-1/4 text-left">Outcomes</th>
                  <th className="border px-4 py-2 w-1/4 text-left">Outputs</th>
                  <th className="border px-4 py-2 w-1/4 text-left">Indicateurs</th>
                  <th className="border px-4 py-2 w-1/10 text-left">Valeur cible</th>
                  <th className="border px-4 py-2 w-1/8 text-left">Valeur réelle</th>
                </tr>
              </thead>
              <tbody>
                {obj.outcomes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="border px-4 py-2 italic text-gray-400">Aucun indicateur</td>
                  </tr>
                )}
                {obj.outcomes.map((out, j) =>
                  out.outputs.length === 0 ? (
                    <tr key={out.out_id}>
                      <td className="border px-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{`Outcome ${j + 1}`}</div>
                            <div>{out.out_nom}</div>
                          </div>
                          <button
                            onClick={() => ajouterOutput(out.out_id, 0, j)}
                            className="text-[#9F0F3A] text-xs border border-[#9F0F3A] px-2 py-1 rounded hover:bg-[#f4e6ea]">
                            + Output
                          </button>
                        </div>
                      </td>
                      <td colSpan={3} className="border px-4 py-2 italic text-gray-400">Aucun output</td>
                    </tr>
                  ) : (
                    out.outputs.map((op, k) =>
                      op.indicateurs.length === 0 ? (
                        <tr key={op.opu_id}>
                          {k === 0 && (
                            <td rowSpan={out.outputs.length} className="border px-4 py-2 align-top">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-bold">{`Outcome ${j + 1}`}</div>
                                  <div>{out.out_nom}</div>
                                </div>
                                <button
                                  onClick={() => ajouterOutput(out.out_id, out.outputs.length, j)}
                                  className="text-[#9F0F3A] text-xs border border-[#9F0F3A] px-2 py-1 rounded hover:bg-[#f4e6ea]">
                                  + Output
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="border px-4 py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold">{`Output ${j + 1}.${k + 1}`}</div>
                                <div>{op.opu_nom}</div>
                              </div>
                              <button
                                onClick={() => ajouterIndicateur(out.out_id, op.opu_id, 0, j, k)}
                                className="text-[#9F0F3A] text-xs border border-[#9F0F3A] px-2 py-1 rounded hover:bg-[#f4e6ea]">
                                + Indicateur
                              </button>
                            </div>
                          </td>
                          <td className="border px-4 py-2 italic text-gray-400">–</td>
                          <td className="border px-4 py-2">–</td>
                        </tr>
                      ) : (
                        op.indicateurs.map((ind, l) => (
                          <tr key={ind.ind_id}>
                            {k === 0 && l === 0 && (
                              <td rowSpan={out.outputs.reduce((acc, o) => acc + (o.indicateurs.length || 1), 0)} className="border px-4 py-2 align-top">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold">{`Outcome ${j + 1}`}</div>
                                    <div>{out.out_nom}</div>
                                  </div>
                                  <button
                                    onClick={() => ajouterOutput(out.out_id, out.outputs.length, j)}
                                    className="text-[#9F0F3A] text-xs border border-[#9F0F3A] px-2 py-1 rounded hover:bg-[#f4e6ea]">
                                    + Output
                                  </button>
                                </div>
                              </td>
                            )}
                            {l === 0 && (
                              <td rowSpan={op.indicateurs.length || 1} className="border px-4 py-2 align-top">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold">{`Output ${j + 1}.${k + 1}`}</div>
                                    <div>{op.opu_nom}</div>
                                  </div>
                                  <button
                                    onClick={() => ajouterIndicateur(out.out_id, op.opu_id, op.indicateurs.length, j, k)}
                                    className="text-[#9F0F3A] text-xs border border-[#9F0F3A] px-2 py-1 rounded hover:bg-[#f4e6ea]">
                                    + Indicateur
                                  </button>
                                </div>
                              </td>
                            )}
                            <td className="border px-4 py-2">
                              <span className="font-bold">{`Indicateur ${j + 1}.${k + 1}.${l + 1}`}</span><br />
                              {ind.ind_nom}
                            </td>
                            <td className="border px-4 py-2">{ind.ind_valeurCible}</td>
                            <td className="border px-4 py-2 text-center">
                              {ind.valeurReelle !== undefined ? (
                                <span>{ind.valeurReelle}</span>
                              ) : (
                                <span className="text-gray-400">–</span>
                              )}
                              <br />
                              <Link
                                href={`/cadre-logique/${id}/lier-activites?ind=${ind.ind_id}`}
                                className="text-[#9F0F3A] text-xs border border-[#9F0F3A] px-2 py-1 rounded hover:bg-[#f4e6ea]"
                              >
                                + Lier activités
                              </Link>
                            </td>

                          </tr>
                        ))
                      )
                    )
                  )
                )}
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right">
                    <button
                      onClick={() => ajouterOutcome(obj.obj_id, obj.outcomes.length)}
                      className="text-[#9F0F3A] text-xs border border-[#9F0F3A] px-2 py-1 rounded hover:bg-[#f4e6ea]">
                      + Outcome
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </main>
  );
}
