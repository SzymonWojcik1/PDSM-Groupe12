'use client';

import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

type ImportExcelProps = {
  fromCol?: number; // Index of first column (0 is default)
  toCol?: number; // Index of the last column (6th is default)
  dateFields?: string[]; // Array of fields to convert to 'yyyy-mm-dd' format
  onPreview?: (rows: Record<string, unknown>[]) => void; // Callback to send extracted rows
};

// ForwardRef component so we can trigger file input
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

        // Read the workbook from the file
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        // Read the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the worksheet into a raw 2D array (rows and columns)
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (rawRows.length <= 3) {
          console.warn(t('not_enough_rows'));
          return;
        }

        // Use the first row as header, only taking the desired columns
        const headerRow = (rawRows[0] as unknown[]).slice(fromCol, toCol) as string[];

        // Skip the first 3 rows (i.e. start from row index 3)
        const dataRows = rawRows.slice(3);

        const formatted: Record<string, unknown>[] = [];

        for (const row of dataRows) {
          const rowArray = row as unknown[];
          const sliced = rowArray.slice(fromCol, toCol);

          // Stop if the row is completely empty
          const isEmpty = sliced.every(
            (cell) => cell === undefined || cell === null || cell === ''
          );
          if (isEmpty) break;

          // Check required columns (1,2,3,4,5,6,8,9,13) are not empty
          const requiredIndexes = [0, 1, 2, 3, 4, 5, 7, 8, 12];
          const hasEmptyRequired = requiredIndexes.some(
            (i) => sliced[i] === undefined || sliced[i] === null || sliced[i] === ''
          );

          if (hasEmptyRequired) {
            console.error(' Missing required fields on row:', sliced);
            continue;
          }

          // Validate first two columns and last : allowed chars and max length
          const col1 = sliced[0];
          const col2 = sliced[1];
          const col12 = sliced[12];
          const nameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;

          const isInvalid = (value: unknown) =>
            typeof value !== 'string' ||
            value.length > 50 ||
            !nameRegex.test(value);

          if (isInvalid(col1) || isInvalid(col2) || isInvalid(col12)) {
            console.error(`Invalid column 1 or 2 or 12 (char set or length > 50) on row:`, sliced);
            continue; // skip this row
          }
          // Conditional "other" field logic for cols 6, 9, 11
          const otherConditions: [number, number][] = [
            [5, 6], // if col 6 === 'other', then col 7 must be valid
            [8, 9], // if col 9 === 'other', then col 10 must be valid
            [10, 11], // if col 11 === 'other', then col 12 must be valid
          ];

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
                console.error(
                  ` Missing or invalid 'other' field at column ${otherIdx + 1} (following 'other' at column ${fieldIdx + 1}):`,
                  sliced
                );
                continue;
              }
            }
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

            // Format date fields
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

        console.log(t('imported_data') + ':', formatted);
        onPreview?.(formatted);
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