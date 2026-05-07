import React from 'react';
import PropTypes from 'prop-types';
import {
  TableCell as MuiTableCell,
  TableRow as MuiTableRow,
  TableFooter as MuiTableFooter,
  TablePagination as MuiTablePagination,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import JumpToPage from './JumpToPage';
import { makeStyles } from 'tss-react/mui';
import { getPageValue } from '../utils';
import type { MUIDataTableOptions, MUIDataTableTextLabels } from '../types';

const useStyles = makeStyles({ name: 'MUIDataTablePagination' })((theme) => ({
  root: {},
  tableCellContainer: {
    padding: '0px 24px 0px 24px',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  toolbar: {},
  selectRoot: {},
  '@media screen and (max-width: 400px)': {
    toolbar: {
      '& span:nth-of-type(2)': {
        display: 'none',
      },
    },
    selectRoot: {
      marginRight: '8px',
    },
  },
}));

interface TablePaginationOptions extends MUIDataTableOptions {
  textLabels: MUIDataTableTextLabels;
}

interface TablePaginationProps {
  count: number;
  options: TablePaginationOptions;
  page: number;
  rowsPerPage: number;
  changeRowsPerPage: (rowsPerPage: number) => void;
  changePage: (page: number) => void;
}

function TablePagination(props: TablePaginationProps) {
  const { classes } = useStyles();

  const handleRowChange = (event: SelectChangeEvent<number> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = Number(event.target.value);
    props.changeRowsPerPage(value);
  };

  const handlePageChange = (_: unknown, page: number) => {
    props.changePage(page);
  };

  const { count, options, rowsPerPage, page } = props;
  const textLabels = options.textLabels.pagination;

  const slotProps = {
    actions: {
      previousButton: {
        id: 'pagination-back',
        'data-testid': 'pagination-back',
        'aria-label': textLabels.previous,
        title: textLabels.previous || '',
      },
      nextButton: {
        id: 'pagination-next',
        'data-testid': 'pagination-next',
        'aria-label': textLabels.next,
        title: textLabels.next || '',
      },
    },
    select: {
      id: 'pagination-input',
      SelectDisplayProps: { id: 'pagination-rows', 'data-testid': 'pagination-rows' },
      MenuProps: {
        id: 'pagination-menu',
        'data-testid': 'pagination-menu',
        MenuListProps: { id: 'pagination-menu-list', 'data-testid': 'pagination-menu-list' },
      },
    },
  } as any;

  return (
    <MuiTableFooter>
      <MuiTableRow>
        <MuiTableCell colSpan={1000} className={classes.tableCellContainer}>
          <div className={classes.navContainer}>
            {options.jumpToPage ? (
              <JumpToPage
                count={count}
                page={page}
                rowsPerPage={rowsPerPage}
                textLabels={options.textLabels}
                changePage={props.changePage}
              />
            ) : null}
            <MuiTablePagination
              component="div"
              className={classes.root}
              classes={{
                toolbar: classes.toolbar,
                selectRoot: classes.selectRoot,
              }}
              count={count}
              rowsPerPage={rowsPerPage}
              page={getPageValue(count, rowsPerPage, page)}
              labelRowsPerPage={textLabels.rowsPerPage}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${textLabels.displayRows} ${count}`}
              slotProps={slotProps}
              rowsPerPageOptions={options.rowsPerPageOptions}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowChange}
            />
          </div>
        </MuiTableCell>
      </MuiTableRow>
    </MuiTableFooter>
  );
}

TablePagination.propTypes = {
  count: PropTypes.number.isRequired,
  options: PropTypes.object.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  changeRowsPerPage: PropTypes.func.isRequired,
};

export default TablePagination;
