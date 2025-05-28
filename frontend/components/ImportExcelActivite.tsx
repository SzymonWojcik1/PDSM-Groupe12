'use client';

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
//import { saveAs } from 'file-saver';

// Props for the ImportExcelActivite component
type ImportExcelProps = {
  fromCol?: number; // Index of first column (default 0)
  toCol?: number;   // Index of last column (default 5)
  dateFields?: string[]; // Array of column names to treat as dates
  onPreview?: (rows: Record<string, unknown>[]) => void; // Callback with parsed rows
};

/**
 * ImportExcelActivite component
 * - Allows importing and parsing Excel files for activities.
 * - Converts date fields to 'yyyy-mm-dd' format.
 * - Calls onPreview with valid rows.
 */
const ImportExcelActivite = forwardRef<HTMLInputElement, ImportExcelProps>(
  ({ fromCol = 0, toCol = 5, dateFields = ['Date de début', 'Date de fin'], onPreview }, ref) => {
    const { t } = useTranslation();

    /**
     * Handles reading and processing the selected Excel file.
     */
    const handleExcelFile = (file: File) => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (!data || !(data instanceof ArrayBuffer)) return;

        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
        });

        // Skip if not enough rows
        if (rawRows.length <= 3) {
          console.warn(t('not_enough_rows'));
          return;
        }

        // Extract header and data rows
        const headerRow = (rawRows[0] as unknown[]).slice(fromCol, toCol) as string[];
        const dataRows = rawRows.slice(3);

        const formatted: Record<string, unknown>[] = [];

        // Process each data row
        for (const row of dataRows) {
          const rowArray = row as unknown[];
          const sliced = rowArray.slice(fromCol, toCol);

          // Skip totally empty rows
          const isTotallyEmpty = sliced.every(
            (cell) => cell === undefined || cell === null || String(cell).trim() === ''
          );
          if (isTotallyEmpty) continue;

          const rowObj: Record<string, unknown> = {};

          // Map each column to its header, format dates if needed
          for (let i = fromCol; i < toCol; i++) {
            const key = headerRow[i - fromCol];
            let value = rowArray[i];

            // Format date fields to yyyy-mm-dd
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

          formatted.push(rowObj);
        }

        // If there are valid rows, call onPreview and show alert
        if (formatted.length > 0) {
          console.log(t('imported_data') + ':', formatted);
          onPreview?.(formatted);
          alert(`Importation terminée. ${formatted.length} ligne(s) chargée(s).`);
        } else {
          alert('Aucune ligne valide trouvée (tout est vide).');
        }
      };

      reader.readAsArrayBuffer(file);
    };

    /**
     * Handles file input change event.
     */
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