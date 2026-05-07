import type { ComponentProps, ReactNode } from 'react';
import type { TableCell } from '@mui/material';
import type { MUIDataTableCellValue, MUIDataTableMeta } from './data';
import type { MUIDataTableFilterList } from './options';

export type MUIDataTableColumnDisplay = 'true' | 'false' | 'excluded' | 'always' | true | false;

export type MUIDataTableFilterType = 'dropdown' | 'checkbox' | 'multiselect' | 'textField' | 'custom';

export type MUIDataTableSortDirection = 'asc' | 'desc' | 'none';

export interface MUIDataTableSortOrder {
  name: string;
  direction: 'asc' | 'desc';
}

export interface MUIDataTableColumnState {
  name: string;
  label: string;
  display: MUIDataTableColumnDisplay;
  empty: boolean;
  filter: boolean;
  sort: boolean;
  print: boolean;
  searchable: boolean;
  download: boolean;
  viewColumns: boolean;
  draggable?: boolean;
  sortDirection?: MUIDataTableSortDirection;
  filterList?: string[];
  filterOptions?: readonly string[] | MUIDataTableColumnFilterOptions;
  filterType?: MUIDataTableFilterType;
  sortCompare?: (order: 'asc' | 'desc') => (a: { data: string | number | null | undefined } | null | undefined, b: { data: string | number | null | undefined } | null | undefined) => number;
  customBodyRender?: MUIDataTableColumnOptions['customBodyRender'];
  customBodyRenderLite?: MUIDataTableColumnOptions['customBodyRenderLite'];
  customHeadRender?: MUIDataTableColumnOptions['customHeadRender'];
  customHeadLabelRender?: MUIDataTableColumnOptions['customHeadLabelRender'];
  customFilterListOptions?: MUIDataTableCustomFilterListOptions;
  customFilterListRender?: MUIDataTableColumnOptions['customFilterListRender'];
  setCellProps?: MUIDataTableColumnOptions['setCellProps'];
  setCellHeaderProps?: MUIDataTableColumnOptions['setCellHeaderProps'];
  sortThirdClickReset?: boolean;
  sortDescFirst?: boolean;
}

export interface MUIDataTableColumnDef<TValue = MUIDataTableCellValue> {
  name: string;
  label?: string;
  options?: MUIDataTableColumnOptions<TValue>;
}

export type MUIDataTableColumn<TValue = MUIDataTableCellValue> = string | MUIDataTableColumnDef<TValue>;

export interface MUIDataTableColumnOptions<TValue = MUIDataTableCellValue> {
  display?: MUIDataTableColumnDisplay;
  empty?: boolean;
  filter?: boolean;
  sort?: boolean;
  print?: boolean;
  searchable?: boolean;
  download?: boolean;
  viewColumns?: boolean;
  draggable?: boolean;
  filterList?: string[];
  filterOptions?: readonly string[] | MUIDataTableColumnFilterOptions<TValue>;
  filterType?: MUIDataTableFilterType;
  customHeadRender?: (columnMeta: MUIDataTableColumnState, updateDirection: (columnIndex: number) => void, sortOrder: MUIDataTableSortOrder) => ReactNode;
  customBodyRender?: (value: TValue, tableMeta: MUIDataTableMeta<TValue>, updateValue: (value: TValue) => void) => ReactNode;
  customBodyRenderLite?: (dataIndex: number, rowIndex: number) => ReactNode;
  customHeadLabelRender?: (columnMeta: MUIDataTableColumnState) => ReactNode;
  customFilterListOptions?: MUIDataTableCustomFilterListOptions;
  customFilterListRender?: (value: string) => ReactNode;
  setCellProps?: (cellValue: TValue, rowIndex: number, columnIndex: number) => ComponentProps<typeof TableCell>;
  setCellHeaderProps?: (columnMeta: MUIDataTableColumnState) => ComponentProps<typeof TableCell>;
  sortThirdClickReset?: boolean;
  sortDescFirst?: boolean;
  sortCompare?: (order: 'asc' | 'desc') => (a: { data: string | number | null | undefined } | null | undefined, b: { data: string | number | null | undefined } | null | undefined) => number;
  sortDirection?: MUIDataTableSortDirection | null;
}

export interface MUIDataTableColumnFilterOptions<TValue = MUIDataTableCellValue> {
  names?: readonly string[];
  logic?: (value: TValue, filters: string[], row?: MUIDataTableCellValue[]) => boolean;
  renderValue?: (value: MUIDataTableCellValue) => ReactNode;
  fullWidth?: boolean;
  display?: (
    filterList: MUIDataTableFilterList,
    onChange: (value: string | string[], index: number, column: string | MUIDataTableColumnState) => void,
    index: number,
    column: MUIDataTableColumnState,
    filterData?: MUIDataTableCellValue[],
  ) => ReactNode;
}

export interface MUIDataTableCustomFilterListOptions {
  render?: (value: string) => ReactNode;
  update?: (filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList;
}
