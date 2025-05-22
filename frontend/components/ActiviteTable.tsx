'use client';

import { useRouter } from 'next/navigation';

export type Activite = {
  act_id: number;
  act_nom: string;
  act_dateDebut: string;
  act_dateFin: string;
  partenaire: { part_nom: string; part_id: number };
  projet: { pro_nom: string; pro_id: number };
};

interface ActiviteTableProps {
  activites: Activite[];
  onDelete: (id: number) => void;
}

export default function ActiviteTable({ activites, onDelete }: ActiviteTableProps) {
  const router = useRouter();

  if (activites.length === 0) {
    return <p className="text-gray-600">Aucune activité trouvée.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border border-gray-200 text-sm text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Nom</th>
            <th className="px-4 py-2 min-w-[120px]">Début</th>
            <th className="px-4 py-2 min-w-[120px]">Fin</th>
            <th className="px-4 py-2">Partenaire</th>
            <th className="px-4 py-2">Projet</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activites.map((a) => (
            <tr key={a.act_id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-800">{a.act_nom}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{a.act_dateDebut}</td>
              <td className="px-4 py-2 whitespace-nowrap text-gray-800">{a.act_dateFin}</td>
              <td className="px-4 py-2 text-gray-800">{a.partenaire?.part_nom}</td>
              <td className="px-4 py-2 text-gray-800">{a.projet?.pro_nom}</td>
              <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                <button
                  onClick={() => router.push(`/activites/${a.act_id}/ajouter-beneficiaire`)}
                  className="text-sm text-[#9F0F3A] hover:underline"
                >
                  Bénéficiaires
                </button>
                <button
                  onClick={() => router.push(`/activites/${a.act_id}/update`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(a.act_id)}
                  className="text-sm text-gray-500 hover:text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
