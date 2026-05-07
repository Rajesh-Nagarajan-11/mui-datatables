import React from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { TableRow } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles({ name: 'MUIDataTableHeadRow' })(() => ({
  root: {},
}));

export interface TableHeadRowProps {
  children?: ReactNode;
}

const TableHeadRow = ({ children }: TableHeadRowProps) => {
  const { classes } = useStyles();

  return (
    <TableRow
      className={clsx({
        [classes.root]: true,
      })}>
      {children}
    </TableRow>
  );
};

export default TableHeadRow;
