import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { TableRow } from '@mui/material';
import { withStyles } from 'tss-react/mui';
import type { ComponentProps, ReactNode } from 'react';
import type { MUIDataTableOptions } from '../types';

const defaultBodyRowStyles = (theme: any) =>
  ({
    root: {
      '&.Mui-selected': {
        backgroundColor: theme.palette.action.selected,
      },
      '&.mui-row-selected': {
        backgroundColor: theme.palette.action.selected,
      },
    },
    hoverCursor: { cursor: 'pointer' },
    responsiveStacked: {
      [theme.breakpoints.down('md')]: {
        borderTop: 'solid 2px rgba(0, 0, 0, 0.15)',
        borderBottom: 'solid 2px rgba(0, 0, 0, 0.15)',
        padding: 0,
        margin: 0,
      },
    },
    responsiveSimple: {
      [theme.breakpoints.down('sm')]: {
        borderTop: 'solid 2px rgba(0, 0, 0, 0.15)',
        borderBottom: 'solid 2px rgba(0, 0, 0, 0.15)',
        padding: 0,
        margin: 0,
      },
    },
  }) as Record<string, any>;

interface TableBodyRowProps extends ComponentProps<typeof TableRow> {
  options: MUIDataTableOptions;
  onClick?: React.MouseEventHandler<HTMLElement>;
  rowSelected?: boolean;
  classes?: Record<string, string>;
  isRowSelectable?: boolean;
  children?: ReactNode;
}

class TableBodyRow extends React.Component<TableBodyRowProps> {
  static propTypes = {
    options: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    rowSelected: PropTypes.bool,
    classes: PropTypes.object,
  };

  render() {
    const { classes, options, rowSelected, onClick, className, isRowSelectable, ...rest } = this.props;

    const methods: Partial<Pick<ComponentProps<typeof TableRow>, 'onClick'>> = {};
    if (onClick) {
      methods.onClick = onClick;
    }

    return (
      <TableRow
        hover={options.rowHover ? true : false}
        {...methods}
        className={clsx(
          {
            [classes?.root || '']: true,
            [classes?.hover || '']: options.rowHover,
            [classes?.hoverCursor || '']: (options.selectableRowsOnClick && isRowSelectable) || options.expandableRowsOnClick,
            [classes?.responsiveSimple || '']: options.responsive === 'simple',
            [classes?.responsiveStacked || '']:
              options.responsive === 'vertical' ||
              options.responsive === 'stacked' ||
              options.responsive === 'stackedFullWidth',
            'mui-row-selected': rowSelected,
          },
          className,
        )}
        selected={rowSelected}
        {...rest}>
        {this.props.children}
      </TableRow>
    );
  }
}

export default withStyles(TableBodyRow, defaultBodyRowStyles, { name: 'MUIDataTableBodyRow' });
