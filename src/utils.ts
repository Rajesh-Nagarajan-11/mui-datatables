import type { MUIDataTableColumnState } from './types/columns';
import type { MUIDataTableCellValue, MUIDataTableDisplayRow } from './types/data';
import type { BuildCsvBody, BuildCsvHead } from './types/options';

interface MapRow {
  dataIndex?: number;
}

interface LegacyNavigator extends Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}

interface LegacyWindow extends Window {
  webkitURL?: typeof URL;
}

interface CsvDownloadOptions {
  downloadOptions: {
    filename: string;
    separator: string;
  };
  onDownload?: (
    buildHead: BuildCsvHead,
    buildBody: BuildCsvBody,
    columns: MUIDataTableColumnState[],
    data: MUIDataTableDisplayRow[],
  ) => string | false;
}

interface SortableData {
  data: string | number | null | undefined;
}

function buildMap(rows?: readonly MapRow[] | null): Record<number, boolean> {
  if (!rows || !Array.isArray(rows)) return {};
  return rows.reduce<Record<number, boolean>>((accum, row) => {
    if (row != null && row.dataIndex !== undefined) {
      accum[row.dataIndex] = true;
    }
    return accum;
  }, {});
}

function escapeDangerousCSVCharacters<T>(data: T): T | string {
  if (typeof data === 'string') {
    return data.replace(/^\+|^\-|^\=|^\@/g, "'$&");
  }

  return data;
}

function warnDeprecated(warning: string, consoleWarnings: boolean | ((message: string) => void) = true): void {
  const consoleWarn = typeof consoleWarnings === 'function' ? consoleWarnings : console.warn;
  if (consoleWarnings) {
    consoleWarn(`Deprecation Notice:  ${warning}`);
  }
}

function warnInfo(warning: string, consoleWarnings: boolean | ((message: string) => void) = true): void {
  const consoleWarn = typeof consoleWarnings === 'function' ? consoleWarnings : console.warn;
  if (consoleWarnings) {
    consoleWarn(`${warning}`);
  }
}

function getPageValue(count: number, rowsPerPage: number, page: number): number {
  const totalPages = count <= rowsPerPage ? 1 : Math.ceil(count / rowsPerPage);

  return page >= totalPages ? totalPages - 1 : page;
}

function getCollatorComparator(): Intl.Collator['compare'] | ((a: string, b: string) => number) {
  if (typeof Intl !== 'undefined') {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    return collator.compare;
  }

  const fallbackComparator = (a: string, b: string) => a.localeCompare(b);
  return fallbackComparator;
}

function sortCompare(order: 'asc' | 'desc'): (a: SortableData | null | undefined, b: SortableData | null | undefined) => number {
  return (a, b) => {
    if (a == null || b == null) return 0;
    const aData = a.data === null || typeof a.data === 'undefined' ? '' : a.data;
    const bData = b.data === null || typeof b.data === 'undefined' ? '' : b.data;
    const compared =
      typeof aData === 'string' && typeof aData.localeCompare === 'function'
        ? aData.localeCompare(String(bData))
        : Number(aData) - Number(bData);

    return compared * (order === 'asc' ? 1 : -1);
  };
}

function buildCSV(columns: MUIDataTableColumnState[], data: MUIDataTableDisplayRow[], options: CsvDownloadOptions): string | false {
  const replaceDoubleQuoteInString = (columnData: MUIDataTableCellValue) =>
    typeof columnData === 'string' ? columnData.replace(/\"/g, '""') : columnData;

  const buildHead: BuildCsvHead = (headColumns) => {
    return (
      headColumns
        .reduce(
          (soFar, column) =>
            column.download
              ? soFar +
                '"' +
                escapeDangerousCSVCharacters(replaceDoubleQuoteInString(column.label || column.name)) +
                '"' +
                options.downloadOptions.separator
              : soFar,
          '',
        )
        .slice(0, -1) + '\r\n'
    );
  };
  const CSVHead = buildHead(columns);

  const buildBody: BuildCsvBody = (bodyData) => {
    if (!bodyData.length) return '';
    return bodyData
      .reduce(
        (soFar, row) =>
          soFar +
          '"' +
          row.data
            .filter((_, index) => columns[index].download)
            .map((columnData) => escapeDangerousCSVCharacters(replaceDoubleQuoteInString(columnData)))
            .join('"' + options.downloadOptions.separator + '"') +
          '"\r\n',
        '',
      )
      .trim();
  };
  const CSVBody = buildBody(data);

  const csv = options.onDownload ? options.onDownload(buildHead, buildBody, columns, data) : `${CSVHead}${CSVBody}`.trim();

  return csv;
}

function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv' });
  const legacyNavigator = navigator as LegacyNavigator;

  if (legacyNavigator && legacyNavigator.msSaveOrOpenBlob) {
    legacyNavigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const dataURI = `data:text/csv;charset=utf-8,${csv}`;

    const windowWithLegacyUrl = window as LegacyWindow;
    const URLImpl = window.URL || windowWithLegacyUrl.webkitURL;
    let downloadURI = dataURI;
    if (URLImpl && typeof URLImpl.createObjectURL === 'function') {
      try {
        downloadURI = URLImpl.createObjectURL(blob);
      } catch {
        downloadURI = dataURI;
      }
    }

    const link = document.createElement('a');
    link.setAttribute('href', downloadURI);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function createCSVDownload(
  columns: MUIDataTableColumnState[],
  data: MUIDataTableDisplayRow[],
  options: CsvDownloadOptions,
  downloadCSVFn: (csv: string, filename: string) => void,
): void {
  const csv = buildCSV(columns, data, options);

  if (csv === false) {
    return;
  }

  downloadCSVFn(csv, options.downloadOptions.filename);
}

export {
  buildMap,
  getPageValue,
  getCollatorComparator,
  sortCompare,
  createCSVDownload,
  buildCSV,
  downloadCSV,
  warnDeprecated,
  warnInfo,
  escapeDangerousCSVCharacters,
};
