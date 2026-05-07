import React, { useCallback } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import clsx from 'clsx';
import { TableCell, Table } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import type { MUIDataTableCellMeta, MUIDataTableCellValue, MUIDataTableResponsive } from '../types';

const useStyles = makeStyles({ name: 'MUIDataTableBodyCell' })((theme) => ({
  root: {},
  cellHide: {
    display: 'none',
  },
  simpleHeader: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      fontWeight: 'bold',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  simpleCell: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline-block',
      width: '100%',
      boxSizing: 'border-box',
    },
  },
  stackedHeader: {
    verticalAlign: 'top',
  },
  stackedCommon: {
    [theme.breakpoints.down('md')]: {
      display: 'inline-block',
      fontSize: '16px',
      height: 'auto',
      width: 'calc(50%)',
      boxSizing: 'border-box',
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:nth-last-of-type(2)': {
        borderBottom: 'none',
      },
    },
  },
  stackedCommonAlways: {
    display: 'inline-block',
    fontSize: '16px',
    height: 'auto',
    width: 'calc(50%)',
    boxSizing: 'border-box',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:nth-last-of-type(2)': {
      borderBottom: 'none',
    },
  },
  stackedParent: {
    [theme.breakpoints.down('md')]: {
      display: 'inline-block',
      fontSize: '16px',
      height: 'auto',
      width: 'calc(100%)',
      boxSizing: 'border-box',
    },
  },
  stackedParentAlways: {
    display: 'inline-block',
    fontSize: '16px',
    height: 'auto',
    width: 'calc(100%)',
    boxSizing: 'border-box',
  },
  cellStackedSmall: {
    [theme.breakpoints.down('md')]: {
      width: '50%',
      boxSizing: 'border-box',
    },
  },
  responsiveStackedSmall: {
    [theme.breakpoints.down('md')]: {
      width: '50%',
      boxSizing: 'border-box',
    },
  },
  responsiveStackedSmallParent: {
    [theme.breakpoints.down('md')]: {
      width: '100%',
      boxSizing: 'border-box',
    },
  },
}));

interface BodyCellOptions {
  responsive: MUIDataTableResponsive;
  onCellClick?: (
    cellData: unknown,
    cellMeta: MUIDataTableCellMeta,
  ) => void;
  setTableProps: () => ComponentProps<typeof Table>;
}

export interface TableBodyCellProps extends Omit<ComponentProps<typeof TableCell>, 'children'> {
  children?: ReactNode | ((dataIndex: number, rowIndex: number) => ReactNode);
  colIndex: number;
  columnHeader?: ReactNode;
  options: BodyCellOptions;
  dataIndex?: number;
  rowIndex?: number;
  print?: boolean;
  tableId?: string;
}

function TableBodyCell(props: TableBodyCellProps) {
  const { classes } = useStyles();
  const { children, colIndex, columnHeader, options, dataIndex, rowIndex, className, print, tableId, ...otherProps } =
    props;
  const onCellClick = options.onCellClick;

  const renderedChildren: ReactNode =
    typeof children === 'function'
      ? dataIndex !== undefined && rowIndex !== undefined
        ? children(dataIndex, rowIndex)
        : null
      : children;

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLTableCellElement>) => {
      if (onCellClick && dataIndex !== undefined && rowIndex !== undefined) {
        onCellClick(children, { colIndex, rowIndex, dataIndex, event });
      }
    },
    [onCellClick, children, colIndex, rowIndex, dataIndex],
  );

  const methods: Pick<ComponentProps<typeof TableCell>, 'onClick'> = {};
  if (onCellClick) {
    methods.onClick = handleClick;
  }

  const cells = [
    <div
      key={1}
      className={clsx(
        {
          lastColumn: colIndex === 2,
          [classes.root]: true,
          [classes.cellHide]: true,
          [classes.stackedHeader]: true,
          [classes.stackedCommon]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            options.responsive === 'stackedFullWidth',
          [classes.stackedCommonAlways]: options.responsive === 'verticalAlways',
          [classes.cellStackedSmall]:
            options.responsive === 'stacked' ||
            (options.responsive === 'stackedFullWidth' &&
              (options.setTableProps().padding === 'none' || options.setTableProps().size === 'small')),
          [classes.simpleHeader]: options.responsive === 'simple',
          'datatables-noprint': print === false,
        },
        className,
      )}>
      {columnHeader}
    </div>,
    <div
      key={2}
      className={clsx(
        {
          [classes.root]: true,
          [classes.stackedCommon]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            options.responsive === 'stackedFullWidth',
          [classes.stackedCommonAlways]: options.responsive === 'verticalAlways',
          [classes.responsiveStackedSmall]:
            options.responsive === 'stacked' ||
            (options.responsive === 'stackedFullWidth' &&
              (options.setTableProps().padding === 'none' || options.setTableProps().size === 'small')),
          [classes.simpleCell]: options.responsive === 'simple',
          'datatables-noprint': !print,
        },
        className,
      )}>
      {renderedChildren}
    </div>,
  ];

  let innerCells: ReactNode[];
  if (
    ['standard', 'scrollMaxHeight', 'scrollFullHeight', 'scrollFullHeightFullWidth'].indexOf(options.responsive) !== -1
  ) {
    innerCells = cells.slice(1, 2);
  } else {
    innerCells = cells;
  }

  return (
    <TableCell
      {...methods}
      data-colindex={colIndex}
      data-tableid={tableId}
      className={clsx(
        {
          [classes.root]: true,
          [classes.stackedParent]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            options.responsive === 'stackedFullWidth',
          [classes.stackedParentAlways]: options.responsive === 'verticalAlways',
          [classes.responsiveStackedSmallParent]:
            options.responsive === 'vertical' ||
            options.responsive === 'stacked' ||
            (options.responsive === 'stackedFullWidth' &&
              (options.setTableProps().padding === 'none' || options.setTableProps().size === 'small')),
          [classes.simpleCell]: options.responsive === 'simple',
          'datatables-noprint': print === false,
        },
        className,
      )}
      {...otherProps}>
      {innerCells}
    </TableCell>
  );
}

export default TableBodyCell;
