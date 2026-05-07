import React from 'react';
import PropTypes from 'prop-types';
import { Paper, IconButton, Typography, Tooltip as MuiTooltip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { withStyles } from 'tss-react/mui';
import type { ComponentType } from 'react';
import type { TooltipProps } from '@mui/material/Tooltip';
import type {
  MUIDataTableComponents,
  MUIDataTableDisplayRow,
  MUIDataTableOptions,
  MUIDataTableSelectedRows,
  MUIDataTableTextLabels,
} from '../types';

const defaultToolbarSelectStyles = (theme: any) =>
  ({
    root: {
      backgroundColor: theme.palette.background.default,
      flex: '1 1 100%',
      display: 'flex',
      position: 'relative',
      zIndex: 120,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: typeof theme.spacing === 'function' ? theme.spacing(1) : theme.spacing.unit,
      paddingBottom: typeof theme.spacing === 'function' ? theme.spacing(1) : theme.spacing.unit,
      '@media print': {
        display: 'none',
      },
    },
    title: {
      paddingLeft: '26px',
    },
    iconButton: {
      marginRight: '24px',
    },
    deleteIcon: {},
  }) as Record<string, any>;

interface TableToolbarSelectOptions extends MUIDataTableOptions {
  textLabels: MUIDataTableTextLabels;
}

interface TableToolbarSelectProps {
  options: TableToolbarSelectOptions;
  rowSelected?: boolean;
  onRowsDelete?: () => void;
  classes?: Record<string, string>;
  selectedRows: MUIDataTableSelectedRows;
  displayData: MUIDataTableDisplayRow[];
  selectRowUpdate: (type: 'custom', value: number[]) => void;
  components?: MUIDataTableComponents;
}

class TableToolbarSelect extends React.Component<TableToolbarSelectProps> {
  static propTypes = {
    options: PropTypes.object.isRequired,
    rowSelected: PropTypes.bool,
    onRowsDelete: PropTypes.func,
    classes: PropTypes.object,
  };

  handleCustomSelectedRows = (selectedRows: number[]) => {
    if (!Array.isArray(selectedRows)) {
      throw new TypeError(`"selectedRows" must be an "array", but it's "${typeof selectedRows}"`);
    }

    if (selectedRows.some((row) => typeof row !== 'number')) {
      throw new TypeError('Array "selectedRows" must contain only numbers');
    }

    const { options } = this.props;
    if (selectedRows.length > 1 && options.selectableRows === 'single') {
      throw new Error('Can not select more than one row when "selectableRows" is "single"');
    }
    this.props.selectRowUpdate('custom', selectedRows);
  };

  render() {
    const { classes, onRowsDelete, selectedRows, options, displayData, components = {} } = this.props;
    const textLabels = options.textLabels.selectedRows;
    const Tooltip = (components.Tooltip || MuiTooltip) as ComponentType<TooltipProps>;
    const customToolbarSelect = options.customToolbarSelect;

    return (
      <Paper className={classes?.root}>
        <div>
          <Typography variant="subtitle1" className={classes?.title}>
            {selectedRows.data.length} {textLabels.text}
          </Typography>
        </div>
        {customToolbarSelect ? (
          typeof customToolbarSelect === 'function' ? (
            customToolbarSelect(selectedRows, displayData, this.handleCustomSelectedRows)
          ) : (
            customToolbarSelect
          )
        ) : (
          <Tooltip title={textLabels.delete}>
            <IconButton className={classes?.iconButton} onClick={onRowsDelete} aria-label={textLabels.deleteAria}>
              <DeleteIcon className={classes?.deleteIcon} />
            </IconButton>
          </Tooltip>
        )}
      </Paper>
    );
  }
}

export default withStyles(TableToolbarSelect, defaultToolbarSelectStyles, { name: 'MUIDataTableToolbarSelect' });
