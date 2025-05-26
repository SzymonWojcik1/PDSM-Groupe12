'use client';

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Props accepted by the ImportExcel component
type ImportExcelProps = {
  fromCol?: number; // Index of first column (0 is default)
  toCol?: number; // Index of the last column (6th is default)
  dateFields?: string[]; // Array of fields to convert to 'yyyy-mm-dd' format
  onPreview?: (rows: Record<string, unknown>[]) => void; // Callback to send extracted rows
};

// ForwardRef component so we can trigger file input externally
const ImportExcel = forwardRef<HTMLInputElement, ImportExcelProps>(
  ({ fromCol = 0, toCol = 6, dateFields = [], onPreview }, ref) => {
    const { t } = useTranslation();

    // Called when a file is selected
    const handleExcelFile = (file: File) => {
      const reader = new FileReader();

      // Once the file is read
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

            const isEmpty = sliced.every(
              (cell) => cell === undefined || cell === null || cell === ''
            );
            if (isEmpty) continue;

            if (rowArray.length < toCol) {
              errors.push([...sliced.map(val => String(val)), 'Row has fewer columns than expected']);
              continue;
            }

            const requiredIndexes = [0, 1, 2, 3, 4, 5, 7, 8, 12];
            const hasEmptyRequired = requiredIndexes.some(
              (i) => sliced[i] === undefined || sliced[i] === null || sliced[i] === ''
            );

            if (hasEmptyRequired) {
              errors.push([...sliced.map(val => String(val)), 'Missing required fields']);
              continue;
            }

            const col1 = sliced[0];
            const col2 = sliced[1];
            const col12 = sliced[12];
            const nameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;

            const isInvalid = (value: unknown) =>
              typeof value !== 'string' ||
              value.length > 50 ||
              !nameRegex.test(value);

            if (isInvalid(col1) || isInvalid(col2) || isInvalid(col12)) {
              errors.push([...sliced.map(val => String(val)), 'Invalid name fields (1, 2 or 13)']);
              continue;
            }

            const otherConditions: [number, number][] = [
              [5, 6],
              [8, 9],
              [10, 11],
            ];

            let otherErrorMessage: string | null = null;

            for (const [fieldIdx, otherIdx] of otherConditions) {
              const baseValue = sliced[fieldIdx];
              const otherValue = sliced[otherIdx];

              if (
                typeof baseValue === 'string' &&
                baseValue.trim().toLowerCase() === 'other'
              ) {
                if (
                  typeof otherValue !== 'string' ||
                  otherValue.length > 50 ||
                  !nameRegex.test(otherValue)
                ) {
                  otherErrorMessage = `Missing or invalid 'other' field for column ${fieldIdx + 1}`;
                  break;
                }
              }
            }

            if (otherErrorMessage) {
              errors.push([...sliced.map(val => String(val)), String(otherErrorMessage)]);
              continue;
            }

            const rowObj: Record<string, unknown> = {};

            for (let i = fromCol; i < toCol; i++) {
              const key = headerRow[i - fromCol];
              let value = rowArray[i];

              if (i - fromCol === 0 || i - fromCol === 1) {
                if (typeof value === 'string') {
                  value = value.toLowerCase();
                }
              }

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
            alert('Some lines were invalid. A CSV file with errors has been downloaded.');
          } else {
            alert('No error while importing.');
          }
        } else {
          alert('No lines are valid. All rows were invalid and skipped.');
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

ImportExcel.displayName = 'ImportExcel';
export default ImportExcel;