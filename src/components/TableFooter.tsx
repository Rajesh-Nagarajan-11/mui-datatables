import React from 'react';
import { Table as MuiTable } from '@mui/material';
import TablePagination from './TablePagination';
import { makeStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import type { MUIDataTableOptions, MUIDataTableTextLabels } from '../types';

const useStyles = makeStyles({ name: 'MUIDataTableFooter' })(() => ({
  root: {
    '@media print': {
      display: 'none',
    },
  },
}));

interface TableFooterOptions extends MUIDataTableOptions {
  textLabels: MUIDataTableTextLabels;
}

interface TableFooterProps {
  options: TableFooterOptions;
  rowCount: number;
  page: number;
  rowsPerPage: number;
  changeRowsPerPage: (rowsPerPage: number) => void;
  changePage: (page: number) => void;
}

const TableFooter = ({ options, rowCount, page, rowsPerPage, changeRowsPerPage, changePage }: TableFooterProps) => {
  const { classes } = useStyles();
  const { customFooter, pagination = true } = options;

  if (customFooter) {
    return (
      <MuiTable className={classes.root}>
        {typeof options.customFooter === 'function'
          ? (options.customFooter as any)(
              rowCount,
              page,
              rowsPerPage,
              changeRowsPerPage,
              changePage,
              options.textLabels.pagination as any,
            )
          : options.customFooter}
      </MuiTable>
    );
  }

  if (pagination) {
    return (
      <MuiTable className={classes.root}>
        <TablePagination
          count={rowCount}
          page={page}
          rowsPerPage={rowsPerPage}
          changeRowsPerPage={changeRowsPerPage}
          changePage={changePage}
          options={options}
        />
      </MuiTable>
    );
  }

  return null;
};

TableFooter.propTypes = {
  rowCount: PropTypes.number.isRequired,
  options: PropTypes.shape({
    customFooter: PropTypes.func,
    pagination: PropTypes.bool,
    textLabels: PropTypes.shape({
      pagination: PropTypes.object,
    }),
  }),
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  changeRowsPerPage: PropTypes.func.isRequired,
  changePage: PropTypes.func.isRequired,
};

export default TableFooter;
