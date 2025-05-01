'use client';

import { enumsShow } from '@/lib/enumsShow';

export type Beneficiaire = {
  ben_id: string;
  ben_prenom: string;
  ben_nom: string;
  ben_date_naissance: string;
  ben_region: string;
  ben_pays: string;
  ben_type: string;
  ben_type_autre: string | null;
  ben_zone: string;
  ben_sexe: string;
  ben_sexe_autre: string | null;
  ben_genre: string | null;
  ben_genre_autre: string | null;
  ben_ethnicite: string;
};

export type EnumMap = Record<string, { value: string; label: string }[]>;

interface BeneficiairesTableProps {
  beneficiaires: Beneficiaire[];
  enums: EnumMap;
  selectable?: boolean;
  selectedIds?: string[];
  toggleSelection?: (id: string) => void;
  selectedCount?: number;
  onUpdate?: (id: string) => void;
  onDelete?: (id: string) => void;
  renderExtraColumn?: (b: Beneficiaire) => React.ReactNode;
}

export default function BeneficiaireTable({
  beneficiaires,
  enums,
  selectable = false,
  selectedIds = [],
  toggleSelection,
  onUpdate,
  onDelete,
  renderExtraColumn,
}: BeneficiairesTableProps) {
  const hasActions = onUpdate || onDelete || renderExtraColumn;

  return (
    <div className="overflow-auto">
      {/* Compteur */}
      {selectable && selectedIds.length > 0 && (
        <div className="mb-2 text-sm text-gray-700">
          {selectedIds.length} bénéficiaire sélectionné
        </div>
      )}

      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {selectable && <th className="border px-2 py-1 text-center">X</th>}
            <th className="border px-2 py-1">Prénom</th>
            <th className="border px-2 py-1">Nom</th>
            <th className="border px-2 py-1">Naissance</th>
            <th className="border px-2 py-1">Région</th>
            <th className="border px-2 py-1">Pays</th>
            <th className="border px-2 py-1">Type</th>
            <th className="border px-2 py-1">Zone</th>
            <th className="border px-2 py-1">Sexe</th>
            <th className="border px-2 py-1">Genre</th>
            <th className="border px-2 py-1">Ethnicité</th>
            {hasActions && <th className="border px-2 py-1 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {beneficiaires.map((b) => (
            <tr key={b.ben_id}>
              {selectable && (
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(b.ben_id)}
                    onChange={() => toggleSelection?.(b.ben_id)}
                  />
                </td>
              )}
              <td className="border px-2 py-1">{b.ben_prenom}</td>
              <td className="border px-2 py-1">{b.ben_nom}</td>
              <td className="border px-2 py-1">{b.ben_date_naissance}</td>
              <td className="border px-2 py-1">{b.ben_region}</td>
              <td className="border px-2 py-1">{b.ben_pays}</td>
              <td className="border px-2 py-1">
                {b.ben_type === 'other'
                  ? b.ben_type_autre || '-'
                  : enumsShow(enums, 'type', b.ben_type)}
              </td>
              <td className="border px-2 py-1">{enumsShow(enums, 'zone', b.ben_zone)}</td>
              <td className="border px-2 py-1">
                {b.ben_sexe === 'other'
                  ? b.ben_sexe_autre || '-'
                  : enumsShow(enums, 'sexe', b.ben_sexe)}
              </td>
              <td className="border px-2 py-1">
                {b.ben_genre === 'other'
                  ? b.ben_genre_autre || '-'
                  : enumsShow(enums, 'genre', b.ben_genre || '')}
              </td>
              <td className="border px-2 py-1">{b.ben_ethnicite}</td>
              {hasActions && (
                <td className="border px-2 py-1 text-center space-x-2">
                  {onUpdate && (
                    <button
                      onClick={() => onUpdate(b.ben_id)}
                      className="text-blue-600 hover:underline"
                    >
                      Modifier
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer ${b.ben_prenom} ${b.ben_nom} ?`);
                        if (confirmed) onDelete(b.ben_id);
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  )}
                  {renderExtraColumn && renderExtraColumn(b)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}