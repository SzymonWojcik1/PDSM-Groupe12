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

          const rowObj: Record<string, unknown> = {};
          for (let i = fromCol; i < toCol; i++) {
            const key = headerRow[i - fromCol];
            let value = rowArray[i];

            // Format the value if it's a date field
            if (dateFields.includes(key)) {
              if (typeof value === 'number') {
                // Convert Excel serial number to yyyy-mm-dd
                const jsDate = XLSX.SSF.parse_date_code(value);
                if (jsDate && jsDate.y && jsDate.m && jsDate.d) {
                  const yyyy = jsDate.y.toString().padStart(4, '0');
                  const mm = jsDate.m.toString().padStart(2, '0');
                  const dd = jsDate.d.toString().padStart(2, '0');
                  value = `${yyyy}-${mm}-${dd}`;
                }
              } else if (value instanceof Date) {
                // Convert JS Date to yyyy-mm-dd
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