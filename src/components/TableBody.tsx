import React from 'react';
import PropTypes from 'prop-types';
import { Typography, TableBody as MuiTableBody } from '@mui/material';
import TableBodyCell from './TableBodyCell';
import TableBodyRow from './TableBodyRow';
import TableSelectCell from './TableSelectCell';
import { withStyles } from 'tss-react/mui';
import cloneDeep from 'lodash.clonedeep';
import { getPageValue } from '../utils';
import clsx from 'clsx';
import type {
  MUIDataTableCellValue,
  MUIDataTableCellMeta,
  MUIDataTableColumnState,
  MUIDataTableComponents,
  MUIDataTableDisplayRow,
  MUIDataTableExpandedRows,
  MUIDataTableFilterList,
  MUIDataTableOptions,
  MUIDataTableSelectedRow,
  MUIDataTableSelectedRows,
  MUIDataTableTextLabels,
} from '../types';

const defaultBodyStyles = (theme: any) =>
  ({
  root: {},
  emptyTitle: {
    textAlign: 'center',
  },
  lastStackedCell: {
    [theme.breakpoints.down('md')]: {
      '& td:last-child': {
        borderBottom: 'none',
      },
    },
  },
  lastSimpleCell: {
    [theme.breakpoints.down('sm')]: {
      '& td:last-child': {
        borderBottom: 'none',
      },
    },
  },
  }) as Record<string, any>;

interface TableBodyOptions extends MUIDataTableOptions {
  textLabels: MUIDataTableTextLabels;
}

interface TableBodyProps {
  data: MUIDataTableDisplayRow[];
  count: number;
  columns: MUIDataTableColumnState[];
  options: TableBodyOptions;
  filterList?: MUIDataTableFilterList;
  onRowClick?: (row: MUIDataTableCellValue[], meta: { rowIndex: number; dataIndex: number }, event: React.MouseEvent<HTMLElement>) => void;
  expandedRows: MUIDataTableExpandedRows;
  selectedRows: MUIDataTableSelectedRows;
  selectRowUpdate: (type: 'cell', value: MUIDataTableSelectedRow, shiftAdjacentRows?: MUIDataTableSelectedRow[]) => void;
  previousSelectedRow?: MUIDataTableSelectedRow | null;
  searchText?: string | null;
  toggleExpandRow: (row: MUIDataTableSelectedRow) => void;
  classes: Record<string, string>;
  page: number;
  rowsPerPage: number;
  columnOrder?: number[];
  components?: MUIDataTableComponents;
  tableId?: string;
}

class TableBody extends React.Component<TableBodyProps> {
  static propTypes = {
    /** Data used to describe table */
    data: PropTypes.array.isRequired,
    /** Total number of data rows */
    count: PropTypes.number.isRequired,
    /** Columns used to describe table */
    columns: PropTypes.array.isRequired,
    /** Options used to describe table */
    options: PropTypes.object.isRequired,
    /** Data used to filter table against */
    filterList: PropTypes.array,
    /** Callback to execute when row is clicked */
    onRowClick: PropTypes.func,
    /** Table rows expanded */
    expandedRows: PropTypes.object,
    /** Table rows selected */
    selectedRows: PropTypes.object,
    /** Callback to trigger table row select */
    selectRowUpdate: PropTypes.func,
    /** The most recent row to have been selected/unselected */
    previousSelectedRow: PropTypes.object,
    /** Data used to search table against */
    searchText: PropTypes.string,
    /** Toggle row expandable */
    toggleExpandRow: PropTypes.func,
    /** Extend the style applied to components */
    classes: PropTypes.object,
  };

  static defaultProps = {
    toggleExpandRow: () => {},
  };

  buildRows() {
    const { data, page, rowsPerPage, count } = this.props;

    if (this.props.options.serverSide) return data.length ? data : null;

    const rows: MUIDataTableDisplayRow[] = [];
    const highestPageInRange = getPageValue(count, rowsPerPage, page);
    const fromIndex = highestPageInRange === 0 ? 0 : highestPageInRange * rowsPerPage;
    const toIndex = Math.min(count, (highestPageInRange + 1) * rowsPerPage);

    if (page > highestPageInRange) {
      console.warn('Current page is out of range, using the highest page that is in range instead.');
    }

    for (let rowIndex = fromIndex; rowIndex < count && rowIndex < toIndex; rowIndex++) {
      if (data[rowIndex] !== undefined) rows.push(data[rowIndex]);
    }

    return rows.length ? rows : null;
  }

  getRowIndex(index: number) {
    const { page, rowsPerPage, options } = this.props;

    if (options.serverSide) {
      return index;
    }

    const startIndex = page === 0 ? 0 : page * rowsPerPage;
    return startIndex + index;
  }

  isRowSelected(dataIndex: number) {
    const { selectedRows } = this.props;
    return selectedRows.lookup && selectedRows.lookup[dataIndex] ? true : false;
  }

  isRowExpanded(dataIndex: number) {
    const { expandedRows } = this.props;
    return expandedRows.lookup && expandedRows.lookup[dataIndex] ? true : false;
  }

  isRowSelectable(dataIndex: number, selectedRows?: MUIDataTableSelectedRows) {
    const { options } = this.props;
    const lookupRows = selectedRows || this.props.selectedRows;

    if (options.isRowSelectable) {
      return options.isRowSelectable(dataIndex, lookupRows);
    } else {
      return true;
    }
  }

  isRowExpandable(dataIndex: number) {
    const { options, expandedRows } = this.props;
    if (options.isRowExpandable) {
      return options.isRowExpandable(dataIndex, expandedRows);
    } else {
      return true;
    }
  }

  handleRowSelect = (data: MUIDataTableSelectedRow, event?: React.SyntheticEvent<HTMLElement>) => {
    const shiftKey = event && (event.nativeEvent as MouseEvent | undefined)?.shiftKey ? true : false;
    const shiftAdjacentRows: MUIDataTableSelectedRow[] = [];
    const previousSelectedRow = this.props.previousSelectedRow;

    if (shiftKey && previousSelectedRow && previousSelectedRow.index < this.props.data.length) {
      let curIndex = previousSelectedRow.index;

      const selectedRows = cloneDeep(this.props.selectedRows);

      const clickedDataIndex = this.props.data[data.index].dataIndex;
      if (selectedRows.data.filter((d) => d.dataIndex === clickedDataIndex).length === 0) {
        selectedRows.data.push({
          index: data.index,
          dataIndex: clickedDataIndex,
        });
        selectedRows.lookup[clickedDataIndex] = true;
      }

      while (curIndex !== data.index) {
        const dataIndex = this.props.data[curIndex].dataIndex;

        if (this.isRowSelectable(dataIndex, selectedRows)) {
          const lookup = {
            index: curIndex,
            dataIndex: dataIndex,
          };

          if (selectedRows.data.filter((d) => d.dataIndex === dataIndex).length === 0) {
            selectedRows.data.push(lookup);
            selectedRows.lookup[dataIndex] = true;
          }

          shiftAdjacentRows.push(lookup);
        }
        curIndex = data.index > curIndex ? curIndex + 1 : curIndex - 1;
      }
    }
    this.props.selectRowUpdate('cell', data, shiftAdjacentRows);
  };

  handleRowClick = (row: MUIDataTableCellValue[], data: { rowIndex: number; dataIndex: number }, event: React.MouseEvent<HTMLElement>) => {
    if (
      (event.target as HTMLElement).id === 'expandable-button' ||
      ((event.target as HTMLElement).nodeName === 'path' && (event.target as HTMLElement).parentElement?.id === 'expandable-button')
    ) {
      return;
    }

    if ((event.target as HTMLElement).id && (event.target as HTMLElement).id.startsWith('MUIDataTableSelectCell')) return;

    if (
      this.props.options.selectableRowsOnClick &&
      this.props.options.selectableRows !== 'none' &&
      this.isRowSelectable(data.dataIndex, this.props.selectedRows)
    ) {
      const selectRow = { index: data.rowIndex, dataIndex: data.dataIndex };
      this.handleRowSelect(selectRow, event);
    }
    if (
      this.props.options.expandableRowsOnClick &&
      this.props.options.expandableRows &&
      this.isRowExpandable(data.dataIndex)
    ) {
      const expandRow = { index: data.rowIndex, dataIndex: data.dataIndex };
      this.props.toggleExpandRow(expandRow);
    }

    if (this.props.options.selectableRowsOnClick) return;

    this.props.options.onRowClick && this.props.options.onRowClick(row, data, event);
  };

  processRow = (row: MUIDataTableCellValue[], columnOrder: number[]) => {
    const ret: { value: MUIDataTableCellValue; index: number }[] = [];
    for (let ii = 0; ii < row.length; ii++) {
      ret.push({
        value: row[columnOrder[ii]],
        index: columnOrder[ii],
      });
    }
    return ret;
  };

  render() {
    const {
      classes,
      columns,
      toggleExpandRow,
      options,
      columnOrder = this.props.columns.map((_item, idx) => idx),
      components = {},
      tableId,
    } = this.props;
    const bodyCellOptions = {
      responsive: options.responsive || 'standard',
      onCellClick: options.onCellClick
        ? (cellData: unknown, cellMeta: MUIDataTableCellMeta) => options.onCellClick?.(cellData as any, cellMeta)
        : undefined,
      setTableProps: options.setTableProps || (() => ({})),
    };
    const tableRows = this.buildRows();
    const visibleColCnt = columns.filter((c) => c.display === 'true').length;

    return (
      <MuiTableBody>
        {tableRows && tableRows.length > 0 ? (
          tableRows.map((data, rowIndex) => {
            const { data: row, dataIndex } = data;

            if (options.customRowRender) {
              return options.customRowRender(row, dataIndex, rowIndex);
            }

            const isRowSelected = options.selectableRows !== 'none' ? this.isRowSelected(dataIndex) : false;
            const isRowSelectable = this.isRowSelectable(dataIndex);
            const bodyClasses = options.setRowProps ? options.setRowProps(row, dataIndex, rowIndex) || {} : {};
            const { ref: _ignoredRef, ...bodyClassProps } = bodyClasses as Record<string, unknown>;

            const processedRow = this.processRow(row, columnOrder);

            return (
              <React.Fragment key={rowIndex}>
                <TableBodyRow
                  {...bodyClassProps}
                  options={options}
                  rowSelected={isRowSelected}
                  isRowSelectable={isRowSelectable}
                  onClick={this.handleRowClick.bind(null, row, { rowIndex, dataIndex })}
                  className={clsx({
                    [classes.lastStackedCell]:
                      options.responsive === 'vertical' ||
                      options.responsive === 'stacked' ||
                      options.responsive === 'stackedFullWidth',
                    [classes.lastSimpleCell]: options.responsive === 'simple',
                    [bodyClassProps.className as string]: Boolean(bodyClassProps.className),
                  })}
                  data-testid={'MUIDataTableBodyRow-' + dataIndex}
                  id={`MUIDataTableBodyRow-${tableId}-${dataIndex}`}>
                  <TableSelectCell
                    onChange={(event) =>
                      this.handleRowSelect(
                        {
                          index: this.getRowIndex(rowIndex),
                          dataIndex: dataIndex,
                        },
                        event as unknown as React.SyntheticEvent<HTMLElement>,
                      )
                    }
                    onExpand={toggleExpandRow.bind(null, {
                      index: this.getRowIndex(rowIndex),
                      dataIndex: dataIndex,
                    })}
                    fixedHeader={options.fixedHeader}
                    fixedSelectColumn={options.fixedSelectColumn}
                    checked={isRowSelected}
                    expandableOn={options.expandableRows}
                    hideExpandButton={!this.isRowExpandable(dataIndex) && options.expandableRows}
                    selectableOn={options.selectableRows}
                    selectableRowsHideCheckboxes={options.selectableRowsHideCheckboxes}
                    expandedRows={this.props.expandedRows}
                    isRowExpanded={this.isRowExpanded(dataIndex)}
                    isRowSelectable={isRowSelectable}
                    dataIndex={dataIndex}
                    id={`MUIDataTableSelectCell-${tableId}-${dataIndex}`}
                    components={components as any}
                  />
                  {processedRow.map(
                    (column) => {
                      const setCellProps = columns[column.index].setCellProps;
                      return (
                        columns[column.index].display === 'true' && (
                          <TableBodyCell
                            {...(setCellProps ? setCellProps(column.value, dataIndex, column.index) || {} : {})}
                            data-testid={`MuiDataTableBodyCell-${column.index}-${rowIndex}`}
                            dataIndex={dataIndex}
                            rowIndex={rowIndex}
                            colIndex={column.index}
                            columnHeader={columns[column.index].label}
                            print={columns[column.index].print}
                            options={bodyCellOptions}
                            tableId={tableId}
                            key={column.index}>
                            {column.value as unknown as React.ReactNode}
                          </TableBodyCell>
                        )
                      );
                    },
                  )}
                </TableBodyRow>
                {this.isRowExpanded(dataIndex) && options.renderExpandableRow
                  ? options.renderExpandableRow(row, { rowIndex, dataIndex })
                  : null}
              </React.Fragment>
            );
          })
        ) : (
          <TableBodyRow options={options}>
            <TableBodyCell
              colSpan={options.selectableRows !== 'none' || options.expandableRows ? visibleColCnt + 1 : visibleColCnt}
              options={bodyCellOptions}
              colIndex={0}
              rowIndex={0}>
              <Typography variant="body1" className={classes.emptyTitle} component={'div'}>
                {options.textLabels.body.noMatch}
              </Typography>
            </TableBodyCell>
          </TableBodyRow>
        )}
      </MuiTableBody>
    );
  }
}

export default withStyles(TableBody, defaultBodyStyles, { name: 'MUIDataTableBody' });
