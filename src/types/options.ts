import type { ComponentProps, MouseEvent, ReactElement, ReactNode } from 'react';
import type { Table, TableRow } from '@mui/material';
import type { MUIDataTableColumnState, MUIDataTableFilterType, MUIDataTableSortDirection, MUIDataTableSortOrder } from './columns';
import type { MUIDataTableCellValue, MUIDataTableDisplayRow } from './data';
import type { MUIDataTableTextLabels } from './text-labels';

export type MUIDataTableFilterList = string[][];

export type MUIDataTableResponsive =
  | 'standard'
  | 'vertical'
  | 'verticalAlways'
  | 'simple'
  | 'stacked'
  | 'stackedFullWidth'
  | 'scrollMaxHeight'
  | 'scrollFullHeight'
  | 'scrollFullHeightFullWidth';

export type MUIDataTableFeatureFlag = boolean | 'true' | 'false' | 'disabled';

export type MUIDataTableSelectableRows = boolean | 'none' | 'single' | 'multiple';

export type MUIDataTableSelectToolbarPlacement = 'replace' | 'above' | 'none' | 'always';

export type MUIDataTableTableAction =
  | 'changePage'
  | 'changeRowsPerPage'
  | 'sort'
  | 'filterChange'
  | 'search'
  | 'viewColumnsChange'
  | 'rowSelectionChange'
  | 'rowExpansionChange'
  | 'columnOrderChange'
  | 'propsUpdate'
  | 'tableInit';

export interface MUIDataTableDownloadOptions {
  filename?: string;
  separator?: string;
  filterOptions?: {
    useDisplayedColumnsOnly?: boolean;
    useDisplayedRowsOnly?: boolean;
  };
}

export interface MUIDataTableDraggableColumns {
  enabled?: boolean;
  transitionTime?: number;
}

export interface MUIDataTableResizableColumns {
  enabled?: boolean;
  roundWidthPercentages?: boolean;
}

export interface MUIDataTableRowMeta {
  dataIndex: number;
  rowIndex: number;
}

export interface MUIDataTableCellMeta extends MUIDataTableRowMeta {
  colIndex: number;
  event: MouseEvent<HTMLElement>;
}

export interface MUIDataTableSelectedRow {
  index: number;
  dataIndex: number;
}

export interface MUIDataTableSelectedRows {
  data: MUIDataTableSelectedRow[];
  lookup: Record<number, boolean>;
}

export type MUIDataTableExpandedRows = MUIDataTableSelectedRows;

export interface MUIDataTableState {
  activeColumn: number | null;
  announceText: string | null;
  count: number;
  columns: MUIDataTableColumnState[];
  columnOrder: number[];
  data: MUIDataTableDisplayRow[];
  displayData: MUIDataTableDisplayRow[];
  expandedRows: MUIDataTableExpandedRows;
  filterData: string[][];
  filterList: MUIDataTableFilterList;
  page: number;
  previousSelectedRow: number | null;
  rowsPerPage: number;
  searchText: string | null;
  selectedRows: MUIDataTableSelectedRows;
  showResponsive: boolean;
  sortOrder: MUIDataTableSortOrder;
}

export type BuildCsvHead = (columns: MUIDataTableColumnState[]) => string;

export type BuildCsvBody = (data: MUIDataTableDisplayRow[]) => string;

export interface MUIDataTableOptions {
  caseSensitive?: boolean;
  columnOrder?: number[];
  count?: number;
  confirmFilters?: boolean;
  consoleWarnings?: boolean | ((message: string) => void);
  customTableBodyFooterRender?: (meta: {
    data: MUIDataTableDisplayRow[];
    count: number;
    columns: MUIDataTableColumnState[];
    filterList: MUIDataTableFilterList;
    rowSelected: MUIDataTableSelectedRows;
    selectedRows: MUIDataTableSelectedRows;
    rowsPerPage: number;
    page: number;
    sortOrder: MUIDataTableSortOrder;
    searchText: string | null;
    selectableRows: MUIDataTableSelectableRows;
  }) => ReactNode;
  customFilterDialogFooter?: (currentFilterList: MUIDataTableFilterList, applyFilters: () => void) => ReactNode;
  customFooter?:
    | ReactElement
    | ((
        count: number,
        page: number,
        rowsPerPage: number,
        changeRowsPerPage: (rowsPerPage: number) => void,
        changePage: (page: number) => void,
        textLabels: MUIDataTableTextLabels,
      ) => ReactNode);
  customRowRender?: (data: MUIDataTableCellValue[], dataIndex: number, rowIndex: number) => ReactNode;
  customSearch?: (searchQuery: string, currentRow: MUIDataTableCellValue[], columns: MUIDataTableColumnState[]) => boolean;
  customSearchRender?:
    | ReactElement
    | ((
        searchText: string,
        handleSearch: (text: string) => void,
        hideSearch: () => void,
        options: MUIDataTableOptions,
      ) => ReactNode);
  customSort?: (data: MUIDataTableDisplayRow[], colIndex: number, order: 'asc' | 'desc') => MUIDataTableDisplayRow[];
  customToolbar?: ReactElement | ((meta: { displayData: MUIDataTableDisplayRow[] }) => ReactNode);
  customToolbarSelect?:
    | ReactElement
    | ((
        selectedRows: MUIDataTableSelectedRows,
        displayData: MUIDataTableDisplayRow[],
        setSelectedRows: (rows: number[]) => void,
      ) => ReactNode);
  draggableColumns?: false | MUIDataTableDraggableColumns;
  elevation?: number;
  enableNestedDataAccess?: string;
  expandableRows?: boolean;
  expandableRowsHeader?: boolean;
  expandableRowsOnClick?: boolean;
  disableToolbarSelect?: boolean;
  download?: MUIDataTableFeatureFlag;
  downloadOptions?: MUIDataTableDownloadOptions;
  filter?: MUIDataTableFeatureFlag;
  filterArrayFullMatch?: boolean;
  filterOptions?: {
    display?: (
      filterList: MUIDataTableFilterList,
      onChange: (value: string | string[], index: number, column: string | MUIDataTableColumnState) => void,
      index: number,
      column: MUIDataTableColumnState,
      filterData: MUIDataTableCellValue[],
    ) => ReactNode;
  };
  filterType?: MUIDataTableFilterType;
  fixedHeaderOptions?: {
    xAxis?: boolean;
    yAxis?: boolean;
  };
  fixedHeader?: boolean;
  fixedSelectColumn?: boolean;
  getTextLabels?: () => MUIDataTableTextLabels;
  isRowExpandable?: (dataIndex: number, expandedRows: MUIDataTableExpandedRows) => boolean;
  isRowSelectable?: (dataIndex: number, selectedRows: MUIDataTableSelectedRows) => boolean;
  jumpToPage?: boolean;
  onCellClick?: (cellData: MUIDataTableCellValue | ReactNode, cellMeta: MUIDataTableCellMeta) => void;
  onDownload?: (
    buildHead: BuildCsvHead,
    buildBody: BuildCsvBody,
    columns: MUIDataTableColumnState[],
    data: MUIDataTableDisplayRow[],
  ) => string | false;
  onFilterChange?: (
    changedColumn: string | null,
    filterList: MUIDataTableFilterList,
    type: string,
    changedColumnIndex?: number,
    displayData?: MUIDataTableDisplayRow[],
  ) => void;
  onFilterChipClose?: (index: number, removedFilter: string, filterList: MUIDataTableFilterList) => void;
  onFilterConfirm?: (filterList: MUIDataTableFilterList) => void;
  onFilterDialogOpen?: () => void;
  onFilterDialogClose?: () => void;
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (rowsPerPage: number) => void;
  onColumnOrderChange?: (columnOrder: number[], columnIndex: number, newPosition: number) => void;
  onColumnSortChange?: (changedColumn: string, direction: MUIDataTableSortDirection) => void;
  onColumnViewChange?: (changedColumn: string | null, action: 'add' | 'remove' | 'update', columns?: MUIDataTableColumnState[]) => void;
  onViewColumnsChange?: (changedColumn: string | null, action: 'add' | 'remove' | 'update', columns?: MUIDataTableColumnState[]) => void;
  onRowClick?: (rowData: MUIDataTableCellValue[], rowMeta: MUIDataTableRowMeta, event?: MouseEvent<HTMLElement>) => void;
  onRowsExpand?: (currentRowsExpanded: MUIDataTableExpandedRows, allRowsExpanded: MUIDataTableExpandedRows) => void;
  onRowExpansionChange?: (
    currentRowsExpanded: MUIDataTableExpandedRows,
    allRowsExpanded: MUIDataTableExpandedRows,
    rowsExpanded: number[],
  ) => void;
  onRowsDelete?: (rowsDeleted: MUIDataTableSelectedRows, newTableData: MUIDataTableCellValue[][]) => boolean | void;
  onRowsSelect?: (currentRowsSelected: MUIDataTableSelectedRows, allRowsSelected: MUIDataTableSelectedRows) => void;
  onRowSelectionChange?: (
    currentRowsSelected: MUIDataTableSelectedRows,
    allRowsSelected: MUIDataTableSelectedRows,
    rowsSelected: number[],
  ) => void;
  onSearchChange?: (searchText: string | null) => void;
  onSearchClose?: () => void;
  onSearchOpen?: () => void;
  onTableChange?: (action: MUIDataTableTableAction, tableState: MUIDataTableState) => void;
  onTableInit?: (action: 'tableInit', tableState: MUIDataTableState) => void;
  page?: number;
  pagination?: boolean;
  print?: MUIDataTableFeatureFlag;
  renderExpandableRow?: (rowData: MUIDataTableCellValue[], rowMeta: MUIDataTableRowMeta) => ReactNode;
  resizableColumns?: boolean | MUIDataTableResizableColumns;
  responsive?: MUIDataTableResponsive;
  rowHover?: boolean;
  rowsExpanded?: number[];
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  rowsSelected?: number[];
  search?: MUIDataTableFeatureFlag;
  searchAlwaysOpen?: boolean;
  searchOpen?: boolean;
  searchPlaceholder?: string;
  searchProps?: Record<string, unknown>;
  searchText?: string;
  selectableRows?: MUIDataTableSelectableRows;
  selectableRowsHeader?: boolean;
  selectableRowsHideCheckboxes?: boolean;
  selectableRowsOnClick?: boolean;
  selectToolbarPlacement?: MUIDataTableSelectToolbarPlacement;
  serverSide?: boolean;
  serverSideFilterList?: MUIDataTableFilterList;
  setFilterChipProps?: (columnIndex: number, columnName: string, filterValue: string) => Record<string, unknown>;
  setRowProps?: (row: MUIDataTableCellValue[], dataIndex: number, rowIndex: number) => ComponentProps<typeof TableRow>;
  setTableProps?: () => ComponentProps<typeof Table>;
  sort?: boolean;
  sortDescFirst?: boolean;
  sortFilterList?: boolean;
  sortOrder?: MUIDataTableSortOrder;
  storageKey?: string;
  tableBodyHeight?: string;
  tableBodyMaxHeight?: string | null;
  tableId?: string;
  textLabels?: Partial<MUIDataTableTextLabels>;
  viewColumns?: MUIDataTableFeatureFlag;
}
