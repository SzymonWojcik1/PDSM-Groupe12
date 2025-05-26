'use client';

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type ImportExcelProps = {
  fromCol?: number;
  toCol?: number;
  dateFields?: string[];
  onPreview?: (rows: Record<string, unknown>[]) => void;
  extraValidation?: (row: Record<string, unknown>) => string | null; // ✅ nouveau
};

const ImportExcelActivite = forwardRef<HTMLInputElement, ImportExcelProps>(
  ({ fromCol = 0, toCol = 5, dateFields = ['Date de début', 'Date de fin'], onPreview, extraValidation }, ref) => {
    const { t } = useTranslation();

    const handleExcelFile = (file: File) => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (!data || !(data instanceof ArrayBuffer)) return;

        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawRows.length <= 3) {
          console.warn(t('not_enough_rows'));
          return;
        }

        const headerRow = (rawRows[0] as unknown[]).slice(fromCol, toCol) as string[];
        const dataRows = rawRows.slice(3);

        const formatted: Record<string, unknown>[] = [];
        const errors: string[][] = [];

        for (const row of dataRows) {
          try {
            const rowArray = row as unknown[];
            const sliced = rowArray.slice(fromCol, toCol);

            const isEmpty = sliced.every((cell) => cell === undefined || cell === null || cell === '');
            if (isEmpty) continue;

            if (sliced.length < toCol - fromCol) {
              errors.push([...sliced.map(val => String(val)), 'Row has fewer columns than expected']);
              continue;
            }

            const requiredIndexes = [0, 1, 2, 3, 4];
            const hasEmptyRequired = requiredIndexes.some(
              (i) => sliced[i] === undefined || sliced[i] === null || sliced[i] === ''
            );
            if (hasEmptyRequired) {
              errors.push([...sliced.map(val => String(val)), 'Missing required fields']);
              continue;
            }

            const rowObj: Record<string, unknown> = {};

            for (let i = fromCol; i < toCol; i++) {
              const key = headerRow[i - fromCol];
              let value = rowArray[i];

              if (dateFields.includes(key)) {
                if (typeof value === 'number') {
                  const jsDate = XLSX.SSF.parse_date_code(value);
                  if (jsDate && jsDate.y && jsDate.m && jsDate.d) {
                    const yyyy = jsDate.y.toString().padStart(4, '0');
                    const mm = jsDate.m.toString().padStart(2, '0');
                    const dd = jsDate.d.toString().padStart(2, '0');
                    value = `${yyyy}-${mm}-${dd}`;
                  }
                } else if (value instanceof Date) {
                  const yyyy = value.getFullYear().toString().padStart(4, '0');
                  const mm = (value.getMonth() + 1).toString().padStart(2, '0');
                  const dd = value.getDate().toString().padStart(2, '0');
                  value = `${yyyy}-${mm}-${dd}`;
                }
              }

              rowObj[key] = value;
            }

            // ✅ Ajout de validation personnalisée
            if (extraValidation) {
              const errorMsg = extraValidation(rowObj);
              if (errorMsg) {
                errors.push([...Object.values(rowObj).map(val => String(val)), errorMsg]);
                continue;
              }
            }

            formatted.push(rowObj);
          } catch (err) {
            errors.push(['Unknown error in row', (err as Error).message]);
          }
        }

        if (errors.length > 0) {
          const csvHeader = [...headerRow, 'error'].join(',') + '\n';
          const csvRows = errors.map(row => row.map(val => `"${val ?? ''}"`).join(',')).join('\n');
          const csvContent = csvHeader + csvRows;
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          saveAs(blob, 'import_errors.csv');
        }

        if (formatted.length > 0) {
          console.log(t('imported_data') + ':', formatted);
          onPreview?.(formatted);

          if (errors.length > 0) {
            alert('Certaines lignes sont invalides. Un fichier CSV a été téléchargé avec les erreurs.');
          } else {
            alert('Importation réussie sans erreur.');
          }
        } else {
          alert('Aucune ligne valide. Toutes les lignes ont été ignorées.');
        }
      };

      reader.readAsArrayBuffer(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleExcelFile(file);
    };

    return (
      <input
        ref={ref}
        type="file"
        accept=".xlsx, .xls"
        onChange={handleChange}
        className="hidden"
        title={t('import_excel')}
      />
    );
  }
);

ImportExcelActivite.displayName = 'ImportExcelActivite';
export default ImportExcelActivite;