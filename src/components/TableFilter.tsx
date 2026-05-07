import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid as MuiGrid,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';
import { withStyles } from 'tss-react/mui';
import cloneDeep from 'lodash.clonedeep';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import type {
  MUIDataTableCellValue,
  MUIDataTableColumnState,
  MUIDataTableFilterList,
  MUIDataTableOptions,
  MUIDataTableTextLabels,
} from '../types';

export const defaultFilterStyles = (theme: any) =>
  ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: '24px 24px 36px 24px',
    fontFamily: 'Roboto',
  },
  header: {
    flex: '0 0 auto',
    marginBottom: '16px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
  title: {
    display: 'inline-block',
    marginLeft: '7px',
    color: theme.palette.text.primary,
    fontSize: '14px',
    fontWeight: 500,
  },
  noMargin: {
    marginLeft: '0px',
  },
  reset: {
    alignSelf: 'left',
  },
  resetLink: {
    marginLeft: '16px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  filtersSelected: {
    alignSelf: 'right',
  },
  checkboxListTitle: {
    marginLeft: '7px',
    marginBottom: '8px',
    fontSize: '14px',
    color: theme.palette.text.secondary,
    textAlign: 'left',
    fontWeight: 500,
  },
  checkboxFormGroup: {
    marginTop: '8px',
  },
  checkboxFormControl: {
    margin: '0px',
  },
  checkboxFormControlLabel: {
    fontSize: '15px',
    marginLeft: '8px',
    color: theme.palette.text.primary,
  },
  checkboxIcon: {
    width: '32px',
    height: '32px',
  },
  checkbox: {},
  checked: {},
  gridListTile: {
    marginTop: '16px',
  },
  }) as Record<string, any>;

const Grid = MuiGrid as ComponentType<Record<string, unknown>>;

interface TableFilterOptions extends MUIDataTableOptions {
  textLabels: MUIDataTableTextLabels;
}

interface TableFilterComponents {
  Checkbox?: ComponentType<ComponentProps<typeof Checkbox>>;
}

interface TableFilterProps {
  filterData: MUIDataTableCellValue[][];
  filterList: MUIDataTableFilterList;
  options: TableFilterOptions;
  onFilterUpdate: (index: number, value: string | string[], column: string, type: string) => void;
  onFilterReset: () => void;
  handleClose: () => void;
  updateFilterByType: (
    filterList: MUIDataTableFilterList,
    index: number,
    value: string | string[],
    type: string,
    customUpdate?: (filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList,
  ) => void;
  customFooter?: (filterList: MUIDataTableFilterList, applyFilters: () => MUIDataTableFilterList) => ReactNode;
  columns: MUIDataTableColumnState[];
  classes?: Record<string, string>;
  components?: TableFilterComponents;
}

interface TableFilterState {
  filterList: MUIDataTableFilterList;
}

class TableFilter extends React.Component<TableFilterProps, TableFilterState> {
  static propTypes = {
    /** Data used to populate filter dropdown/checkbox */
    filterData: PropTypes.array.isRequired,
    /** Data selected to be filtered against dropdown/checkbox */
    filterList: PropTypes.array.isRequired,
    /** Options used to describe table */
    options: PropTypes.object.isRequired,
    /** Callback to trigger filter update */
    onFilterUpdate: PropTypes.func,
    /** Callback to trigger filter reset */
    onFilterReset: PropTypes.func,
    /** Extend the style applied to components */
    classes: PropTypes.object,
  };

  constructor(props: TableFilterProps) {
    super(props);
    this.state = {
      filterList: cloneDeep(props.filterList),
    };
  }

  filterUpdate = (
    index: number,
    value: string | string[],
    column: string,
    type: string,
    customUpdate?: (filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList,
  ) => {
    const newFilterList = this.state.filterList.slice(0) as MUIDataTableFilterList;

    this.props.updateFilterByType(newFilterList, index, value, type, customUpdate);
    this.setState({
      filterList: newFilterList,
    });
  };

  handleCheckboxChange = (index: number, value: string, column: string) => {
    this.filterUpdate(index, value, column, 'checkbox');

    if (this.props.options.confirmFilters !== true) {
      this.props.onFilterUpdate(index, value, column, 'checkbox');
    }
  };

  handleDropdownChange = (event: SelectChangeEvent<string>, index: number, column: string) => {
    const labelFilterAll = this.props.options.textLabels.filter.all;
    const value = event.target.value === labelFilterAll ? [] : [event.target.value];
    this.filterUpdate(index, value, column, 'dropdown');

    if (this.props.options.confirmFilters !== true) {
      this.props.onFilterUpdate(index, value, column, 'dropdown');
    }
  };

  handleMultiselectChange = (index: number, value: string[], column: string) => {
    this.filterUpdate(index, value, column, 'multiselect');

    if (this.props.options.confirmFilters !== true) {
      this.props.onFilterUpdate(index, value, column, 'multiselect');
    }
  };

  handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number, column: string) => {
    this.filterUpdate(index, event.target.value, column, 'textField');

    if (this.props.options.confirmFilters !== true) {
      this.props.onFilterUpdate(index, event.target.value, column, 'textField');
    }
  };

  handleCustomChange = (value: string | string[], index: number, column: string | MUIDataTableColumnState) => {
    const columnName = typeof column === 'string' ? column : column.name;
    const filterType = typeof column === 'string' ? this.props.columns[index].filterType || 'custom' : column.filterType || 'custom';

    this.filterUpdate(index, value, columnName, filterType);

    if (this.props.options.confirmFilters !== true) {
      this.props.onFilterUpdate(index, value, columnName, filterType);
    }
  };

  renderCheckbox(column: MUIDataTableColumnState, index: number, components: TableFilterComponents = {}) {
    const CheckboxComponent = components.Checkbox || Checkbox;

    const { filterData } = this.props;
    const classes = this.props.classes ?? ({} as Record<string, string>);
    const { filterList } = this.state;
    const renderItem: (value: MUIDataTableCellValue) => ReactNode =
      column.filterOptions && 'renderValue' in column.filterOptions && column.filterOptions.renderValue
        ? column.filterOptions.renderValue
        : (v: MUIDataTableCellValue) => v as unknown as ReactNode;

    return (
      <Grid key={index} size={6}>
        <FormGroup>
          <Grid size={12}>
            <Typography variant="body2" className={classes.checkboxListTitle}>
              {column.label}
            </Typography>
          </Grid>
          <Grid container>
            {filterData[index].map((filterValue, filterIndex) => (
              <Grid key={filterIndex}>
                <FormControlLabel
                  key={filterIndex}
                  classes={{
                    root: classes.checkboxFormControl,
                    label: classes.checkboxFormControlLabel,
                  }}
                  control={
                    <CheckboxComponent
                      data-description="table-filter"
                      color="primary"
                      className={classes.checkboxIcon}
                      onChange={this.handleCheckboxChange.bind(null, index, String(filterValue), column.name)}
                      checked={filterList[index].indexOf(String(filterValue)) >= 0}
                      classes={{
                        root: classes.checkbox,
                        checked: classes.checked,
                      }}
                      value={filterValue != null ? filterValue.toString() : ''}
                    />
                  }
                  label={renderItem(filterValue)}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      </Grid>
    );
  }

  renderSelect(column: MUIDataTableColumnState, index: number) {
    const { filterData, options } = this.props;
    const classes = this.props.classes ?? ({} as Record<string, string>);
    const { filterList } = this.state;
    const textLabels = options.textLabels.filter;
    const renderItem: (value: MUIDataTableCellValue) => ReactNode =
      column.filterOptions && 'renderValue' in column.filterOptions && column.filterOptions.renderValue
        ? column.filterOptions.renderValue
        : (v: MUIDataTableCellValue) => (v != null ? v.toString() : '');
    const width = column.filterOptions && 'fullWidth' in column.filterOptions && column.filterOptions.fullWidth === true ? 12 : 6;

    return (
      <Grid key={index} size={width} className={classes.gridListTile}>
        <FormControl key={index} variant={'standard'} fullWidth>
          <InputLabel htmlFor={column.name}>{column.label}</InputLabel>
          <Select
            fullWidth
            value={filterList[index].length ? filterList[index].toString() : textLabels.all}
            name={column.name}
            onChange={(event) => this.handleDropdownChange(event, index, column.name)}
            input={<Input name={column.name} id={column.name} />}>
            <MenuItem value={textLabels.all} key={0}>
              {textLabels.all}
            </MenuItem>
            {filterData[index].map((filterValue, filterIndex) => (
              <MenuItem value={String(filterValue ?? '')} key={filterIndex + 1}>
                {renderItem(filterValue)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    );
  }

  renderTextField(column: MUIDataTableColumnState, index: number) {
    const classes = this.props.classes ?? ({} as Record<string, string>);
    const { filterList } = this.state;
    if (column.filterOptions && 'renderValue' in column.filterOptions && column.filterOptions.renderValue) {
      console.warn('Custom renderValue not supported for textField filters');
    }
    const width = column.filterOptions && 'fullWidth' in column.filterOptions && column.filterOptions.fullWidth === true ? 12 : 6;

    return (
      <Grid key={index} size={width} className={classes.gridListTile}>
        <FormControl key={index} fullWidth>
          <TextField
            fullWidth
            variant={'standard'}
            label={column.label}
            value={filterList[index].toString() || ''}
            data-testid={'filtertextfield-' + column.name}
            onChange={(event) => this.handleTextFieldChange(event, index, column.name)}
          />
        </FormControl>
      </Grid>
    );
  }

  renderMultiselect(column: MUIDataTableColumnState, index: number, components: TableFilterComponents = {}) {
    const CheckboxComponent = components.Checkbox || Checkbox;

    const { filterData } = this.props;
    const classes = this.props.classes ?? ({} as Record<string, string>);
    const { filterList } = this.state;
    const renderItem: (value: MUIDataTableCellValue) => ReactNode =
      column.filterOptions && 'renderValue' in column.filterOptions && column.filterOptions.renderValue
        ? column.filterOptions.renderValue
        : (v: MUIDataTableCellValue) => v as unknown as ReactNode;
    const width = column.filterOptions && 'fullWidth' in column.filterOptions && column.filterOptions.fullWidth === true ? 12 : 6;
    return (
      <Grid key={index} size={width} className={classes.gridListTile}>
        <FormControl key={index} variant={'standard'} fullWidth>
          <InputLabel htmlFor={column.name}>{column.label}</InputLabel>
          <Select
            multiple
            fullWidth
            value={filterList[index] || []}
            renderValue={(selected) =>
              (Array.isArray(selected) ? (selected as MUIDataTableCellValue[]) : []).map(renderItem).join(', ')
            }
            name={column.name}
            onChange={(event) => this.handleMultiselectChange(index, event.target.value as string[], column.name)}
            input={<Input name={column.name} id={column.name} />}>
            {filterData[index].map((filterValue, filterIndex) => (
              <MenuItem value={String(filterValue ?? '')} key={filterIndex + 1}>
                <CheckboxComponent
                  data-description="table-filter"
                  color="primary"
                  checked={filterList[index].indexOf(String(filterValue)) >= 0}
                  value={filterValue != null ? filterValue.toString() : ''}
                  className={classes.checkboxIcon}
                  classes={{
                    root: classes.checkbox,
                    checked: classes.checked,
                  }}
                />
                <ListItemText primary={renderItem(filterValue)} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    );
  }

  renderCustomField(column: MUIDataTableColumnState, index: number) {
    const { filterData, options } = this.props;
    const classes = this.props.classes ?? ({} as Record<string, string>);
    const { filterList } = this.state;
    const width = column.filterOptions && 'fullWidth' in column.filterOptions && column.filterOptions.fullWidth === true ? 12 : 6;
    const display =
      (column.filterOptions && 'display' in column.filterOptions && column.filterOptions.display) ||
      (options.filterOptions && options.filterOptions.display);

    if (!display) {
      console.error('Property "display" is required when using custom filter type.');
      return;
    }
    if (column.filterOptions && 'renderValue' in column.filterOptions && column.filterOptions.renderValue) {
      console.warn('"renderValue" is ignored for custom filter fields');
    }

    return (
      <Grid key={index} size={width} className={classes.gridListTile}>
        <FormControl key={index} fullWidth>
          {display(filterList, this.handleCustomChange, index, column, filterData[index])}
        </FormControl>
      </Grid>
    );
  }

  applyFilters = () => {
    this.state.filterList.forEach((filter, index) => {
      this.props.onFilterUpdate(index, filter, this.props.columns[index].name, 'custom');
    });

    this.props.handleClose();

    if (this.props.options.onFilterConfirm) {
      this.props.options.onFilterConfirm(this.state.filterList);
    }

    return this.state.filterList;
  };

  resetFilters = () => {
    this.setState({
      filterList: this.props.columns.map(() => []),
    });
    if (this.props.options.confirmFilters !== true) {
      this.props.onFilterReset();
    }
  };

  render() {
    const { columns, options, customFooter, filterList, components = {} } = this.props;
    const classes = this.props.classes ?? ({} as Record<string, string>);
    const textLabels = options.textLabels.filter;

    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.reset}>
            <Typography
              variant="body2"
              className={clsx(classes.title)}>
              {textLabels.title}
            </Typography>
            <Button
              color="primary"
              className={classes.resetLink}
              tabIndex={0}
              aria-label={textLabels.reset}
              data-testid={'filterReset-button'}
              onClick={this.resetFilters}>
              {textLabels.reset}
            </Button>
          </div>
          <div className={classes.filtersSelected} />
        </div>
        <Grid container direction="row" justifyContent="flex-start" alignItems="center" spacing={4}>
          {columns.map((column, index) => {
            if (column.filter) {
              const filterType = column.filterType || options.filterType;
              return filterType === 'checkbox'
                ? this.renderCheckbox(column, index, components)
                : filterType === 'multiselect'
                  ? this.renderMultiselect(column, index, components)
                  : filterType === 'textField'
                    ? this.renderTextField(column, index)
                    : filterType === 'custom'
                      ? this.renderCustomField(column, index)
                      : this.renderSelect(column, index);
            }
            return null;
          })}
        </Grid>
        {customFooter ? customFooter(filterList, this.applyFilters) : ''}
      </div>
    );
  }
}

export default withStyles(TableFilter, defaultFilterStyles, { name: 'MUIDataTableFilter' });
