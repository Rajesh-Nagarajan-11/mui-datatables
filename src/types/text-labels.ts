import type { ReactNode } from 'react';

export interface MUIDataTableTextLabels {
  body: {
    noMatch: ReactNode;
    toolTip: string;
    columnHeaderTooltip?: (column: { label: string }) => string;
  };
  pagination: {
    next: string;
    previous: string;
    rowsPerPage: string;
    displayRows: string;
    jumpToPage?: string;
  };
  toolbar: {
    search: string;
    downloadCsv: string;
    print: string;
    viewColumns: string;
    filterTable: string;
  };
  filter: {
    all: string;
    title: string;
    reset: string;
  };
  viewColumns: {
    title: string;
    titleAria: string;
  };
  selectedRows: {
    text: string;
    delete: string;
    deleteAria: string;
  };
}
