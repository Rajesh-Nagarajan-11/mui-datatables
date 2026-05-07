import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import type { MUIDataTableOptions, MUIDataTableResizableColumns } from '../types';

const defaultResizeStyles = {
  root: {
    position: 'absolute',
  },
  resizer: {
    position: 'absolute',
    width: '1px',
    height: '100%',
    left: '100px',
    cursor: 'ew-resize',
    border: '0.1px solid rgba(224, 224, 224, 1)',
  },
} as Record<string, any>;

function getParentOffsetLeft(tableEl: HTMLElement) {
  let ii = 0;
  let parentOffsetLeft = 0;
  let offsetParent = tableEl.offsetParent as HTMLElement | null;
  while (offsetParent) {
    parentOffsetLeft = parentOffsetLeft + (offsetParent.offsetLeft || 0) - (offsetParent.scrollLeft || 0);
    offsetParent = offsetParent.offsetParent as HTMLElement | null;
    ii++;
    if (ii > 1000) break;
  }
  return parentOffsetLeft;
}

interface TableResizeProps {
  classes?: Record<string, string>;
  setResizeable: (fn: (cellsRef: Record<number, HTMLTableCellElement | null>, tableRef: HTMLTableElement) => void) => void;
  updateDividers: (fn: () => void) => void;
  options: MUIDataTableOptions;
  resizableColumns?: boolean | MUIDataTableResizableColumns;
  tableId?: string;
}

interface TableResizeState {
  resizeCoords: Record<string, { left: number }>;
  priorPosition: Record<string, unknown>;
  tableWidth: number | string;
  tableHeight: number | string;
  isResize?: boolean;
  id?: string | null;
  lastColumn?: number;
}

class TableResize extends React.Component<TableResizeProps, TableResizeState> {
  static propTypes = {
    classes: PropTypes.object,
  };

  minWidths: number[] = [];
  windowWidth: number | null = null;
  cellsRef: Record<string, HTMLTableCellElement | null> = {};
  tableRef: HTMLTableElement | null = null;

  state: TableResizeState = {
    resizeCoords: {},
    priorPosition: {},
    tableWidth: '100%',
    tableHeight: '100%',
  };

  handleResize = () => {
    if (window.innerWidth !== this.windowWidth) {
      this.windowWidth = window.innerWidth;
      this.setDividers();
    }
  };

  componentDidMount() {
    this.minWidths = [];
    this.windowWidth = null;
    this.props.setResizeable(this.setCellRefs);
    this.props.updateDividers(() => this.setState({} as TableResizeState, () => this.updateWidths));
    window.addEventListener('resize', this.handleResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize, false);
  }

  setCellRefs = (cellsRef: Record<number, HTMLTableCellElement | null>, tableRef: HTMLTableElement) => {
    this.cellsRef = cellsRef as Record<string, HTMLTableCellElement | null>;
    this.tableRef = tableRef;
    this.setDividers();
  };

  setDividers = () => {
    const tableEl = this.tableRef as HTMLTableElement;
    const { width: tableWidth, height: tableHeight } = tableEl.getBoundingClientRect();
    const { resizeCoords } = this.state;

    Object.keys(resizeCoords).forEach((prop) => {
      delete resizeCoords[prop];
    });

    const parentOffsetLeft = getParentOffsetLeft(tableEl);
    const finalCells = Object.entries(this.cellsRef);
    const cellMinusOne = finalCells.filter((_item, ix) => ix + 1 < finalCells.length);

    cellMinusOne.forEach(([key, item]) => {
      if (!item) return;
      const elRect = item.getBoundingClientRect();
      let left = elRect.left;
      left = (left || 0) - parentOffsetLeft;
      resizeCoords[key] = { left: left + item.offsetWidth };
    });
    this.setState({ tableWidth, tableHeight, resizeCoords }, this.updateWidths);
  };

  updateWidths = () => {
    let lastPosition = 0;
    const { resizeCoords, tableWidth } = this.state;

    Object.entries(resizeCoords).forEach(([key, item]) => {
      let newWidth = Number(((item.left - lastPosition) / Number(tableWidth)) * 100);

      if (typeof this.props.resizableColumns === 'object' && this.props.resizableColumns.roundWidthPercentages) {
        newWidth = Number(newWidth.toFixed(2));
      }

      lastPosition = item.left;

      const thCell = this.cellsRef[key];
      if (thCell) thCell.style.width = newWidth + '%';
    });
  };

  onResizeStart = (id: string) => {
    const tableEl = this.tableRef as HTMLTableElement;
    const originalWidth = tableEl.style.width;
    let lastColumn = 0;
    tableEl.style.width = '1px';

    const finalCells = Object.entries(this.cellsRef);
    finalCells.forEach(([key, item]) => {
      const elRect = item ? item.getBoundingClientRect() : { width: 0, left: 0 };
      this.minWidths[Number(key)] = elRect.width;
      lastColumn = Math.max(Number(key), lastColumn);
    });
    tableEl.style.width = originalWidth;

    this.setState({ isResize: true, id, lastColumn });
  };

  onResizeMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const { isResize, resizeCoords, lastColumn } = this.state;

    const prevCol = (colId: number) => {
      let nextId = colId - 1;
      while (typeof resizeCoords[nextId] === 'undefined' && nextId >= 0) {
        nextId--;
      }
      return nextId;
    };
    const nextCol = (colId: number) => {
      let nextId = colId + 1;
      let tries = 0;
      while (typeof resizeCoords[nextId] === 'undefined' && tries < 20) {
        nextId++;
        tries++;
      }
      return nextId;
    };

    const fixedMinWidth1 = this.minWidths[Number(id)];
    const fixedMinWidth2 = this.minWidths[nextCol(parseInt(id, 10))] || this.minWidths[Number(id)];
    const idNumber = parseInt(id, 10);
    const finalCells = Object.entries(this.cellsRef);
    const tableEl = this.tableRef as HTMLTableElement;
    const { width: tableWidth, height: tableHeight } = tableEl.getBoundingClientRect();
    const { selectableRows } = this.props.options;

    const parentOffsetLeft = getParentOffsetLeft(tableEl);

    const nextCoord = (colId: number) => {
      let nextId = colId + 1;
      let tries = 0;
      while (typeof resizeCoords[nextId] === 'undefined' && tries < 20) {
        nextId++;
        tries++;
      }
      return resizeCoords[nextId];
    };
    const prevCoord = (colId: number) => {
      let nextId = colId - 1;
      while (typeof resizeCoords[nextId] === 'undefined' && nextId >= 0) {
        nextId--;
      }
      return resizeCoords[nextId];
    };

    if (isResize) {
      let leftPos = e.clientX - parentOffsetLeft;

      const handleMoveRightmostBoundary = (leftValue: number, widthValue: number, minWidth: number) => {
        if (leftValue > widthValue - minWidth) {
          return widthValue - minWidth;
        }
        return leftValue;
      };

      const handleMoveLeftmostBoundary = (leftValue: number, minWidth: number) => {
        if (leftValue < minWidth) {
          return minWidth;
        }
        return leftValue;
      };

      const handleMoveRight = (leftValue: number, coords: Record<string, { left: number }>, colId: number, minWidth: number) => {
        if (typeof nextCoord(colId) === 'undefined') return leftValue;
        if (leftValue > nextCoord(colId).left - minWidth) {
          return nextCoord(colId).left - minWidth;
        }
        return leftValue;
      };

      const handleMoveLeft = (leftValue: number, coords: Record<string, { left: number }>, colId: number, minWidth: number) => {
        if (typeof prevCoord(colId) === 'undefined') return leftValue;
        if (leftValue < prevCoord(colId).left + minWidth) {
          return prevCoord(colId).left + minWidth;
        }
        return leftValue;
      };

      const isFirstColumn = (selectable: string | boolean | undefined, colId: number) => {
        let firstColumn = 1;
        while (!resizeCoords[firstColumn] && firstColumn < 20) {
          firstColumn++;
        }

        return (selectable !== 'none' && colId === 0) || (selectable === 'none' && colId === firstColumn);
      };

      const isLastColumn = (colId: number, cells: Array<[string, HTMLTableCellElement | null]>) => {
        return colId === prevCol(lastColumn || 0);
      };

      if (isFirstColumn(selectableRows, idNumber) && isLastColumn(idNumber, finalCells)) {
        leftPos = handleMoveLeftmostBoundary(leftPos, fixedMinWidth1);
        leftPos = handleMoveRightmostBoundary(leftPos, tableWidth, fixedMinWidth2);
      } else if (!isFirstColumn(selectableRows, idNumber) && isLastColumn(idNumber, finalCells)) {
        leftPos = handleMoveRightmostBoundary(leftPos, tableWidth, fixedMinWidth2);
        leftPos = handleMoveLeft(leftPos, resizeCoords, idNumber, fixedMinWidth1);
      } else if (isFirstColumn(selectableRows, idNumber) && !isLastColumn(idNumber, finalCells)) {
        leftPos = handleMoveLeftmostBoundary(leftPos, fixedMinWidth1);
        leftPos = handleMoveRight(leftPos, resizeCoords, idNumber, fixedMinWidth2);
      } else if (!isFirstColumn(selectableRows, idNumber) && !isLastColumn(idNumber, finalCells)) {
        leftPos = handleMoveLeft(leftPos, resizeCoords, idNumber, fixedMinWidth1);
        leftPos = handleMoveRight(leftPos, resizeCoords, idNumber, fixedMinWidth2);
      }

      const curCoord = { ...resizeCoords[id], left: leftPos };
      const newResizeCoords = { ...resizeCoords, [id]: curCoord };
      this.setState({ resizeCoords: newResizeCoords, tableHeight }, this.updateWidths);
    }
  };

  onResizeEnd = (id: string) => {
    this.setState({ isResize: false, id: null });
  };

  render() {
    const { classes, tableId } = this.props;
    const { id, isResize, resizeCoords, tableWidth, tableHeight } = this.state;

    return (
      <div className={classes?.root} style={{ width: tableWidth }}>
        {Object.entries(resizeCoords).map(([key, val]) => {
          return (
            <div
              data-divider-index={key}
              data-tableid={tableId}
              aria-hidden="true"
              key={key}
              onMouseMove={this.onResizeMove.bind(null, key)}
              onMouseUp={this.onResizeEnd.bind(null, key)}
              style={{
                width: isResize && id == key ? tableWidth : 'auto',
                position: 'absolute',
                height: Number(tableHeight) - 2,
                cursor: 'ew-resize',
                zIndex: 1000,
              }}>
              <div
                aria-hidden="true"
                onMouseDown={this.onResizeStart.bind(null, key)}
                className={classes?.resizer}
                style={{ left: val.left }}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

export default withStyles(TableResize, defaultResizeStyles, { name: 'MUIDataTableResize' });
