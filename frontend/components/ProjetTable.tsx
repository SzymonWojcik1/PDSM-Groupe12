'use client';

import { useRouter } from 'next/navigation';

export type Projet = {
  pro_id: number;
  pro_nom: string;
  pro_dateDebut: string;
  pro_dateFin: string;
  partenaire: { part_nom: string };
};

interface ProjetTableProps {
  projets: Projet[];
  onDelete: (id: number) => void;
}

export default function ProjetTable({ projets, onDelete }: ProjetTableProps) {
  const router = useRouter();

  if (projets.length === 0) {
    return <p className="text-gray-600">Aucun projet trouvé.</p>;
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
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projets.map((p) => (
            <tr key={p.pro_id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-800">{p.pro_nom}</td>
              <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{p.pro_dateDebut}</td>
              <td className="px-4 py-2 text-gray-800 whitespace-nowrap">{p.pro_dateFin}</td>
              <td className="px-4 py-2 text-gray-800">{p.partenaire?.part_nom}</td>
              <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                <button
                  onClick={() => router.push(`/projets/${p.pro_id}/update`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(p.pro_id)}
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
