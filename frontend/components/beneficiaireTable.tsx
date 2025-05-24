'use client'

import { useTranslation } from 'react-i18next'
import { enumsShow } from '@/lib/enumsShow'

export type Beneficiaire = {
  ben_id: string
  ben_prenom: string
  ben_nom: string
  ben_date_naissance: string
  ben_region: string
  ben_pays: string
  ben_type: string
  ben_type_autre: string | null
  ben_zone: string
  ben_sexe: string
  ben_sexe_autre: string | null
  ben_genre: string | null
  ben_genre_autre: string | null
  ben_ethnicite: string
}

export type EnumMap = Record<string, { value: string; label: string }[]>

interface BeneficiairesTableProps {
  beneficiaires: Beneficiaire[]
  enums: EnumMap
  selectable?: boolean
  selectedIds?: string[]
  toggleSelection?: (id: string) => void
  onUpdate?: (id: string) => void
  onDelete?: (id: string) => void
  renderExtraColumn?: (b: Beneficiaire) => React.ReactNode
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
  const { t } = useTranslation()
  const hasActions = onUpdate || onDelete || renderExtraColumn

  return (
    <div className="overflow-x-auto">
      {selectable && selectedIds.length > 0 && (
        <div className="mb-3 text-sm text-gray-600">
          {t('beneficiaries_selected', { count: selectedIds.length })}
        </div>
      )}

      <table className="min-w-full text-sm bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-[#F3F4F6] text-gray-700">
          <tr>
            {selectable && <th className="px-3 py-2 text-left">{t('selection')}</th>}
            <th className="px-3 py-2 text-left">{t('firstname')}</th>
            <th className="px-3 py-2 text-left">{t('lastname')}</th>
            <th className="px-3 py-2 text-left min-w-[140px]">{t('birth')}</th>
            <th className="px-3 py-2 text-left">{t('region')}</th>
            <th className="px-3 py-2 text-left">{t('country')}</th>
            <th className="px-3 py-2 text-left">{t('type')}</th>
            <th className="px-3 py-2 text-left">{t('zone')}</th>
            <th className="px-3 py-2 text-left">{t('sex')}</th>
            <th className="px-3 py-2 text-left">{t('gender')}</th>
            <th className="px-3 py-2 text-left">{t('ethnicity')}</th>
            {hasActions && <th className="px-3 py-2 text-center">{t('actions')}</th>}
          </tr>
        </thead>
        <tbody>
          {beneficiaires.map((b, idx) => (
            <tr
              key={b.ben_id}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition'}
            >
              {selectable && (
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds?.includes(b.ben_id) ?? false}
                    onChange={() => toggleSelection?.(b.ben_id)}
                    className="h-4 w-4"
                  />
                </td>
              )}
              <td className="px-3 py-2 text-gray-800">{b.ben_prenom}</td>
              <td className="px-3 py-2 text-gray-800">{b.ben_nom}</td>
              <td className="px-3 py-2 text-gray-800 min-w-[140px]">{b.ben_date_naissance}</td>
              <td className="px-3 py-2 text-gray-800">{b.ben_region}</td>
              <td className="px-3 py-2 text-gray-800">{b.ben_pays}</td>
              <td className="px-3 py-2 text-gray-800">
                {b.ben_type === 'other'
                  ? b.ben_type_autre || '-'
                  : enumsShow(enums, 'type', b.ben_type)}
              </td>
              <td className="px-3 py-2 text-gray-800">{enumsShow(enums, 'zone', b.ben_zone)}</td>
              <td className="px-3 py-2 text-gray-800">
                {b.ben_sexe === 'other'
                  ? b.ben_sexe_autre || '-'
                  : enumsShow(enums, 'sexe', b.ben_sexe)}
              </td>
              <td className="px-3 py-2 text-gray-800">
                {b.ben_genre === 'other'
                  ? b.ben_genre_autre || '-'
                  : enumsShow(enums, 'genre', b.ben_genre || '')}
              </td>
              <td className="px-3 py-2 text-gray-800">{b.ben_ethnicite}</td>
              {hasActions && (
                <td className="px-3 py-2 text-center space-x-2 whitespace-nowrap">
                  {onUpdate && (
                    <button
                      onClick={() => onUpdate(b.ben_id)}
                      className="text-[#9F0F3A] hover:underline"
                    >
                      {t('modify')}
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        const confirmed = confirm(t('confirm_delete_beneficiary', {
                          firstname: b.ben_prenom,
                          lastname: b.ben_nom
                        }))
                        if (confirmed) onDelete(b.ben_id)
                      }}
                      className="text-gray-500 hover:text-red-600 hover:underline"
                    >
                      {t('delete')}
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
  )
}
