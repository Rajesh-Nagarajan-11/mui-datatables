import { useDrop, type DropTargetMonitor } from 'react-dnd';

interface OffsetParent {
  offsetLeft?: number;
  scrollLeft?: number;
  offsetParent?: OffsetParent | null;
}

interface ColumnElement {
  offsetLeft: number;
  offsetWidth: number;
  offsetParent?: OffsetParent | null | number;
  scrollLeft?: number;
  style?: {
    transition?: string;
    transform?: string;
  };
}

type HeadCellRefs = Record<number, ColumnElement | null | undefined>;

interface Column {
  display?: string | boolean;
}

interface ColumnModelItem {
  left: number;
  width: number;
  columnIndex: number | null;
  ref: ColumnElement;
}

interface HeaderDragItem {
  type?: string;
  colIndex: number;
  headCellRefs: HeadCellRefs;
}

interface StylableElement {
  style: {
    transition?: string;
    transform?: string;
  };
}

interface TableRef {
  querySelectorAll: (selectors: string) => ArrayLike<StylableElement>;
}

interface ColumnDropTimers {
  columnShift?: ReturnType<typeof setTimeout> | null;
}

interface HoverMonitor {
  getItem: () => HeaderDragItem;
  getClientOffset: () => { x: number } | null;
}

interface HandleHoverOptions {
  item?: unknown;
  mon: HoverMonitor;
  index: number;
  headCellRefs: HeadCellRefs;
  updateColumnOrder: (columnOrder: number[], sourceColumnIndex: number, targetColumnIndex: number) => void;
  columnOrder: number[];
  transitionTime?: number;
  tableRef?: TableRef | null;
  tableId: string;
  timers: ColumnDropTimers;
  columns: Column[];
}

interface UseColumnDropOptions extends Omit<HandleHoverOptions, 'item' | 'mon'> {
  drop?: (item: HeaderDragItem, monitor: DropTargetMonitor<HeaderDragItem, unknown>) => void;
}

const getOffsetParent = (element: ColumnElement): OffsetParent | null => {
  return typeof element.offsetParent === 'object' && element.offsetParent !== null ? element.offsetParent : null;
};

const getColModel = (headCellRefs: HeadCellRefs, columnOrder: number[], columns: Column[]): ColumnModelItem[] => {
  const colModel: ColumnModelItem[] = [];
  let leftMostCell = headCellRefs[0] ? headCellRefs[0] : null;

  if (leftMostCell === null) {
    let candidate: ColumnElement = { offsetLeft: Infinity, offsetWidth: 0 };
    const headCells = Object.entries(headCellRefs);
    headCells.forEach(([, item]) => {
      if (item && item.offsetLeft < candidate.offsetLeft) {
        candidate = item;
      }
    });

    if (candidate.offsetLeft === Infinity) {
      candidate = { offsetParent: null, offsetWidth: 0, offsetLeft: 0 };
    }

    leftMostCell = candidate;
  }

  let ii = 0;
  let parentOffsetLeft = 0;
  let offsetParent = getOffsetParent(leftMostCell);
  while (offsetParent) {
    parentOffsetLeft = parentOffsetLeft + (offsetParent.offsetLeft || 0) - (offsetParent.scrollLeft || 0);
    offsetParent = offsetParent.offsetParent || null;
    ii++;
    if (ii > 1000) break;
  }

  if (headCellRefs[0]) {
    colModel[0] = {
      left: parentOffsetLeft + leftMostCell.offsetLeft,
      width: leftMostCell.offsetWidth,
      columnIndex: null,
      ref: leftMostCell,
    };
  }

  columnOrder.forEach((colIdx) => {
    const col = headCellRefs[colIdx + 1];
    const cmIndx = colModel.length - 1;
    if (col && !(columns[colIdx] && columns[colIdx].display !== 'true')) {
      const prevLeft =
        cmIndx !== -1 ? colModel[cmIndx].left + colModel[cmIndx].width : parentOffsetLeft + leftMostCell.offsetLeft;
      colModel.push({
        left: prevLeft,
        width: col.offsetWidth,
        columnIndex: colIdx,
        ref: col,
      });
    }
  });

  return colModel;
};

const reorderColumns = (prevColumnOrder: number[], columnIndex: number, newPosition: number): number[] => {
  let columnOrder = prevColumnOrder.slice();
  const srcIndex = columnOrder.indexOf(columnIndex);
  const targetIndex = columnOrder.indexOf(newPosition);

  if (srcIndex !== -1 && targetIndex !== -1) {
    const newItem = columnOrder[srcIndex];
    columnOrder = [...columnOrder.slice(0, srcIndex), ...columnOrder.slice(srcIndex + 1)];
    columnOrder = [...columnOrder.slice(0, targetIndex), newItem, ...columnOrder.slice(targetIndex)];
  }
  return columnOrder;
};

const handleHover = (opts: HandleHoverOptions): void => {
  const {
    mon,
    index,
    headCellRefs,
    updateColumnOrder,
    columnOrder,
    transitionTime = 300,
    tableRef,
    tableId,
    timers,
    columns,
  } = opts;

  const dragItem = mon.getItem();
  const hoverIdx = dragItem.colIndex;

  if (headCellRefs !== dragItem.headCellRefs) return;

  if (hoverIdx !== index) {
    const reorderedCols = reorderColumns(columnOrder, dragItem.colIndex, index);
    const newColModel = getColModel(headCellRefs, reorderedCols, columns);

    const clientOffset = mon.getClientOffset();
    if (!clientOffset) return;

    const newX = clientOffset.x;
    let modelIdx: number | null = -1;
    for (let ii = 0; ii < newColModel.length; ii++) {
      if (newX > newColModel[ii].left && newX < newColModel[ii].left + newColModel[ii].width) {
        modelIdx = newColModel[ii].columnIndex;
        break;
      }
    }

    if (modelIdx === dragItem.colIndex) {
      if (timers.columnShift) clearTimeout(timers.columnShift);

      const curColModel = getColModel(headCellRefs, columnOrder, columns);

      const transitions: number[] = [];
      newColModel.forEach((item) => {
        if (item.columnIndex !== null) transitions[item.columnIndex] = item.left;
      });
      curColModel.forEach((item) => {
        if (item.columnIndex !== null) transitions[item.columnIndex] = transitions[item.columnIndex] - item.left;
      });

      for (let idx = 1; idx < columnOrder.length; idx++) {
        const colIndex = columnOrder[idx];
        if (columns[colIndex] && columns[colIndex].display !== 'true') {
        } else {
          const headCell = headCellRefs[idx];
          if (headCell?.style) headCell.style.transition = '280ms';
          if (headCell?.style) headCell.style.transform = 'translateX(' + transitions[idx - 1] + 'px)';
        }
      }

      const allElms: StylableElement[] = [];
      const dividers: StylableElement[] = [];
      for (let ii = 0; ii < columnOrder.length; ii++) {
        const elms = tableRef
          ? tableRef.querySelectorAll('[data-colindex="' + ii + '"][data-tableid="' + tableId + '"]')
          : [];
        for (let jj = 0; jj < elms.length; jj++) {
          elms[jj].style.transition = transitionTime + 'ms';
          elms[jj].style.transform = 'translateX(' + transitions[ii] + 'px)';
          allElms.push(elms[jj]);
        }

        const divider = tableRef
          ? tableRef.querySelectorAll('[data-divider-index="' + (ii + 1) + '"][data-tableid="' + tableId + '"]')
          : [];
        for (let jj = 0; jj < divider.length; jj++) {
          divider[jj].style.transition = transitionTime + 'ms';
          divider[jj].style.transform = 'translateX(' + transitions[columnOrder[ii]] + 'px)';
          dividers.push(divider[jj]);
        }
      }

      const newColIndex = dragItem.colIndex;
      timers.columnShift = setTimeout(() => {
        allElms.forEach((item) => {
          item.style.transition = '0s';
          item.style.transform = 'translateX(0)';
        });
        dividers.forEach((item) => {
          item.style.transition = '0s';
          item.style.transform = 'translateX(0)';
        });
        updateColumnOrder(reorderedCols, newColIndex, index);
      }, transitionTime);
    }
  }
};

const useColumnDrop = (opts: UseColumnDropOptions) => {
  const [, drop] = useDrop<HeaderDragItem, unknown, { isOver: boolean; canDrop: boolean }>({
    accept: 'HEADER',
    drop: opts.drop,
    hover: (item, mon) => handleHover({ ...opts, item, mon }),
    collect: (mon) => ({
      isOver: !!mon.isOver(),
      canDrop: !!mon.canDrop(),
    }),
  });

  return [drop];
};

export { getColModel, reorderColumns, handleHover };
export default useColumnDrop;
