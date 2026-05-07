import { makeStyles } from 'tss-react/mui';
import clsx from 'clsx';
import { TableHead as MuiTableHead } from '@mui/material';
import React, { useState } from 'react';
import TableHeadCell from './TableHeadCell';
import TableHeadRow from './TableHeadRow';
import TableSelectCell from './TableSelectCell';
import type {
  ColumnDropTimers,
  HeadCellRefs,
  MUIDataTableColumnState,
  MUIDataTableComponents,
  MUIDataTableDisplayRow,
  MUIDataTableExpandedRows,
  MUIDataTableOptions,
  MUIDataTableSelectedRows,
  MUIDataTableSortOrder,
} from '../types';

const useStyles = makeStyles({ name: 'MUIDataTableHead' })((theme) => ({
  main: {},
  responsiveStacked: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  responsiveStackedAlways: {
    display: 'none',
  },
  responsiveSimple: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

interface TableHeadProps {
  columnOrder?: number[] | null;
  columns: MUIDataTableColumnState[];
  components?: MUIDataTableComponents;
  count: number;
  data: MUIDataTableDisplayRow[];
  draggableHeadCellRefs: HeadCellRefs;
  expandedRows: MUIDataTableExpandedRows;
  options: MUIDataTableOptions;
  selectedRows: MUIDataTableSelectedRows;
  selectRowUpdate: (type: 'head', value: null) => void;
  setCellRef?: (rowIndex: number, columnIndex: number, element: HTMLTableCellElement | null) => void;
  sortOrder?: MUIDataTableSortOrder;
  tableRef?: () => HTMLElement | null;
  tableId?: string;
  timers: ColumnDropTimers;
  toggleAllExpandableRows: () => void;
  toggleSort: (index: number) => void;
  updateColumnOrder: (columnOrder: number[], sourceColumnIndex: number, targetColumnIndex: number) => void;
}

const TableHead = ({
  columnOrder = null,
  columns,
  components = {},
  count,
  data,
  draggableHeadCellRefs,
  expandedRows,
  options,
  selectedRows,
  selectRowUpdate,
  setCellRef,
  sortOrder = { name: '', direction: 'none' as any },
  tableRef,
  tableId,
  timers,
  toggleAllExpandableRows,
  toggleSort,
  updateColumnOrder,
}: TableHeadProps) => {
  const { classes } = useStyles();

  if (columnOrder === null) {
    columnOrder = columns ? columns.map((_item, idx) => idx) : [];
  }

  const [dragging, setDragging] = useState(false);

  const handleToggleColumn = (index: number) => {
    toggleSort(index);
  };

  const handleRowSelect = () => {
    selectRowUpdate('head', null);
  };

  const numSelected = (selectedRows && selectedRows.data.length) || 0;
  let isIndeterminate = numSelected > 0 && numSelected < count;
  let isChecked = numSelected > 0 && numSelected >= count;

  if (
    options.disableToolbarSelect === true ||
    options.selectToolbarPlacement === 'none' ||
    options.selectToolbarPlacement === 'above'
  ) {
    if (isChecked) {
      for (let ii = 0; ii < data.length; ii++) {
        if (!selectedRows.lookup[data[ii].dataIndex]) {
          isChecked = false;
          isIndeterminate = true;
          break;
        }
      }
    } else {
      if (numSelected > count) {
        isIndeterminate = true;
      }
    }
  }

  const orderedColumns = columnOrder.map((colIndex, idx) => {
    return {
      column: columns[colIndex],
      index: colIndex,
      colPos: idx,
    };
  });

  return (
    <MuiTableHead
      className={clsx({
        [classes.responsiveStacked]:
          options.responsive === 'vertical' ||
          options.responsive === 'stacked' ||
          options.responsive === 'stackedFullWidth',
        [classes.responsiveStackedAlways]: options.responsive === 'verticalAlways',
        [classes.responsiveSimple]: options.responsive === 'simple',
        [classes.main]: true,
      })}>
      <TableHeadRow>
        <TableSelectCell
          setHeadCellRef={setCellRef}
          onChange={handleRowSelect.bind(null)}
          indeterminate={isIndeterminate}
          checked={isChecked}
          isHeaderCell={true}
          expandedRows={expandedRows}
          expandableRowsHeader={options.expandableRowsHeader}
          expandableOn={options.expandableRows}
          selectableOn={options.selectableRows}
          fixedHeader={options.fixedHeader}
          fixedSelectColumn={options.fixedSelectColumn}
          selectableRowsHeader={options.selectableRowsHeader}
          selectableRowsHideCheckboxes={options.selectableRowsHideCheckboxes}
          onExpand={toggleAllExpandableRows}
          isRowSelectable={true}
          components={components as any}
        />
        {orderedColumns.map(
          ({ column, index, colPos }) =>
            column.display === 'true' &&
            (column.customHeadRender ? (
              column.customHeadRender({ index, ...column } as any, handleToggleColumn, sortOrder as any)
            ) : (
              <TableHeadCell
                cellHeaderProps={
                  columns[index].setCellHeaderProps ? columns[index].setCellHeaderProps({ index, ...column } as any) || {} : {}
                }
                key={index}
                index={index}
                colPosition={colPos}
                setCellRef={setCellRef}
                sort={column.sort}
                sortDirection={column.name === sortOrder.name ? sortOrder.direction : 'none'}
                toggleSort={handleToggleColumn}
                hint={(column as MUIDataTableColumnState & { hint?: string }).hint}
                print={column.print}
                options={options as any}
                column={column as MUIDataTableColumnState & { hint?: string }}
                columns={columns}
                updateColumnOrder={updateColumnOrder}
                columnOrder={columnOrder}
                timers={timers}
                draggingHook={[dragging, setDragging]}
                draggableHeadCellRefs={draggableHeadCellRefs}
                tableRef={tableRef}
                tableId={tableId}
                components={components}>
                {column.customHeadLabelRender
                  ? column.customHeadLabelRender({ index, colPos, ...column } as any)
                  : column.label}
              </TableHeadCell>
            )),
        )}
      </TableHeadRow>
    </MuiTableHead>
  );
};

export default TableHead;
