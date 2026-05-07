import React from 'react';
import { Typography, Toolbar, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import {
  Search as SearchIcon,
  CloudDownload as DownloadIcon,
  Print as PrintIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import type { ComponentType } from 'react';
import type { TooltipProps } from '@mui/material/Tooltip';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import Popover from './Popover';
import TableFilter from './TableFilter';
import TableViewCol from './TableViewCol';
import TableSearch from './TableSearch';
import { useReactToPrint } from 'react-to-print';
import find from 'lodash.find';
import { withStyles } from 'tss-react/mui';
import { createCSVDownload, downloadCSV } from '../utils';
import type {
  MUIDataTableCellValue,
  MUIDataTableColumnState,
  MUIDataTableComponents,
  MUIDataTableDisplayRow,
  MUIDataTableFilterList,
  MUIDataTableOptions,
  MUIDataTableTextLabels,
} from '../types';

export const defaultToolbarStyles = (theme: any) =>
  ({
  root: {
    '@media print': {
      display: 'none',
    },
  },
  fullWidthRoot: {},
  left: {
    flex: '1 1 auto',
  },
  fullWidthLeft: {
    flex: '1 1 auto',
  },
  actions: {
    flex: '1 1 auto',
    textAlign: 'right',
  },
  fullWidthActions: {
    flex: '1 1 auto',
    textAlign: 'right',
  },
  titleRoot: {},
  titleText: {},
  fullWidthTitleText: {
    textAlign: 'left',
  },
  icon: {
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  iconActive: {
    color: theme.palette.primary.main,
  },
  filterPaper: {
    maxWidth: '50%',
  },
  filterCloseIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100,
  },
  searchIcon: {
    display: 'inline-flex',
    marginTop: '10px',
    marginRight: '8px',
  },
  [theme.breakpoints.down('md')]: {
    titleRoot: {},
    titleText: {
      fontSize: '16px',
    },
    spacer: {
      display: 'none',
    },
    left: {
      padding: '8px 0px',
    },
    actions: {
      textAlign: 'right',
    },
  },
  [theme.breakpoints.down('sm')]: {
    root: {
      display: 'block',
      '@media print': {
        display: 'none !important',
      },
    },
    left: {
      padding: '8px 0px 0px 0px',
    },
    titleText: {
      textAlign: 'center',
    },
    actions: {
      textAlign: 'center',
    },
  },
  '@media screen and (max-width: 480px)': {},
  }) as Record<string, any>;

const RESPONSIVE_FULL_WIDTH_NAME = 'scrollFullHeightFullWidth';

interface PrintButtonProps {
  getContent: () => HTMLElement | null;
  classes: Record<string, string>;
  IconComponent: ComponentType<SvgIconProps>;
  options: MUIDataTableOptions;
  print: string;
  Tooltip: ComponentType<TooltipProps>;
}

const PrintButton = ({ getContent, classes, IconComponent, options, print, Tooltip }: PrintButtonProps) => {
  const contentRef = React.useRef<HTMLElement | null>(null);
  const handlePrint = useReactToPrint({ contentRef });
  const onClick = () => {
    contentRef.current = getContent();
    handlePrint();
  };
  return (
    <Tooltip title={print}>
      <IconButton
        data-testid={print + '-iconButton'}
        aria-label={print}
        disabled={options.print === 'disabled'}
        onClick={onClick}
        classes={{ root: classes.icon }}>
        <IconComponent />
      </IconButton>
    </Tooltip>
  );
};

interface TableToolbarState {
  iconActive: string | null;
  prevIconActive?: string | null;
  showSearch: boolean;
  searchText: string | null;
  hideFilterPopover?: boolean;
}

interface TableToolbarOptions extends MUIDataTableOptions {
  textLabels: MUIDataTableTextLabels;
}

interface TableToolbarProps {
  data: MUIDataTableDisplayRow[];
  displayData: MUIDataTableDisplayRow[];
  columns: MUIDataTableColumnState[];
  columnOrder?: number[];
  options: TableToolbarOptions;
  filterData: MUIDataTableCellValue[][];
  filterList: MUIDataTableFilterList;
  filterUpdate: (index: number, value: string | string[], column: string, type: string, customUpdate?: (filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList) => void;
  updateFilterByType: (
    filterList: MUIDataTableFilterList,
    index: number,
    value: string | string[],
    type: string,
    customUpdate?: (filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList,
  ) => void;
  resetFilters: () => void;
  toggleViewColumn: (index: number) => void;
  updateColumns: (columns: MUIDataTableColumnState[]) => void;
  searchText: string | null;
  searchTextUpdate: (searchText: string) => void;
  searchClose: () => void;
  tableRef: () => HTMLElement | null;
  title: string | React.ReactElement;
  setTableAction: (action: string) => void;
  components?: MUIDataTableComponents;
  classes: Record<string, string>;
}

class TableToolbar extends React.Component<TableToolbarProps, TableToolbarState> {
  state: TableToolbarState = {
    iconActive: null,
    showSearch: Boolean(
      this.props.searchText ||
        this.props.options.searchText ||
        this.props.options.searchOpen ||
        this.props.options.searchAlwaysOpen,
    ),
    searchText: this.props.searchText || null,
  };

  searchButton?: HTMLButtonElement | null;

  componentDidUpdate(prevProps: TableToolbarProps) {
    if (this.props.searchText !== prevProps.searchText) {
      this.setState({ searchText: this.props.searchText });
    }
  }

  handleCSVDownload = () => {
    const { data, displayData, columns, options, columnOrder } = this.props;
    let dataToDownload: MUIDataTableDisplayRow[] = [];
    let columnsToDownload: MUIDataTableColumnState[] = [];
    let columnOrderCopy = Array.isArray(columnOrder) ? columnOrder.slice(0) : [];

    if (columnOrderCopy.length === 0) {
      columnOrderCopy = columns.map((_item, idx) => idx);
    }

    data.forEach((row) => {
      const newRow = { index: row.index, dataIndex: row.dataIndex, data: [] as MUIDataTableCellValue[] };
      columnOrderCopy.forEach((idx) => {
        newRow.data.push(row.data[idx]);
      });
      dataToDownload.push(newRow);
    });

    columnOrderCopy.forEach((idx) => {
      columnsToDownload.push(columns[idx]);
    });

    if (options.downloadOptions && options.downloadOptions.filterOptions) {
      if (options.downloadOptions.filterOptions.useDisplayedRowsOnly) {
        const filteredDataToDownload = displayData.map((row, index) => {
          let i = -1;

          row.index = index;

          return {
            index: row.index,
            dataIndex: row.dataIndex,
            data: row.data.map((column) => {
              i += 1;

              let val =
                typeof column === 'object' && column !== null && !Array.isArray(column)
                  ? (find(data, (d) => d.index === row.dataIndex) as MUIDataTableDisplayRow).data[i]
                  : column;
              val = typeof val === 'function' ? (find(data, (d) => d.index === row.dataIndex) as MUIDataTableDisplayRow).data[i] : val;
              return val;
            }),
          };
        });

        dataToDownload = [];
        filteredDataToDownload.forEach((row) => {
          const newRow = { index: row.index, dataIndex: row.dataIndex, data: [] as MUIDataTableCellValue[] };
          columnOrderCopy.forEach((idx) => {
            newRow.data.push(row.data[idx]);
          });
          dataToDownload.push(newRow as MUIDataTableDisplayRow);
        });
      }

      if (options.downloadOptions.filterOptions.useDisplayedColumnsOnly) {
        columnsToDownload = columnsToDownload.filter((item) => item.display === 'true');

        dataToDownload = dataToDownload.map((row) => {
          row.data = row.data.filter((_, index) => columns[columnOrderCopy[index]].display === 'true');
          return row;
        });
      }
    }
    const downloadOptions = {
      filename: 'tableDownload.csv',
      separator: ',',
      ...(options.downloadOptions || {}),
    };
    createCSVDownload(columnsToDownload, dataToDownload, { ...options, downloadOptions }, downloadCSV);
  };

  setActiveIcon = (iconName?: string) => {
    this.setState(
      (prevState) => ({
        showSearch: this.isSearchShown(iconName),
        iconActive: iconName || null,
        prevIconActive: prevState.iconActive,
      }),
      () => {
        const { iconActive, prevIconActive } = this.state;

        if (iconActive === 'filter') {
          this.props.setTableAction('onFilterDialogOpen');
          if (this.props.options.onFilterDialogOpen) {
            this.props.options.onFilterDialogOpen();
          }
        }
        if (iconActive === null && prevIconActive === 'filter') {
          this.props.setTableAction('onFilterDialogClose');
          if (this.props.options.onFilterDialogClose) {
            this.props.options.onFilterDialogClose();
          }
        }
      },
    );
  };

  isSearchShown = (iconName?: string) => {
    if (this.props.options.searchAlwaysOpen) {
      return true;
    }

    let nextVal = false;
    if (this.state.showSearch) {
      if (this.state.searchText) {
        nextVal = true;
      } else {
        const { onSearchClose } = this.props.options;
        this.props.setTableAction('onSearchClose');
        if (onSearchClose) onSearchClose();
        nextVal = false;
      }
    } else if (iconName === 'search') {
      nextVal = this.showSearch();
    }
    return nextVal;
  };

  getActiveIcon = (styles: Record<string, string>, iconName: string) => {
    let isActive = this.state.iconActive === iconName;
    if (iconName === 'search') {
      const { showSearch, searchText } = this.state;
      isActive = isActive || showSearch || Boolean(searchText);
    }
    return isActive ? styles.iconActive : styles.icon;
  };

  showSearch = () => {
    this.props.setTableAction('onSearchOpen');
    if (this.props.options.onSearchOpen) {
      this.props.options.onSearchOpen();
    }
    return true;
  };

  hideSearch = () => {
    const { onSearchClose } = this.props.options;

    this.props.setTableAction('onSearchClose');
    if (onSearchClose) onSearchClose();
    this.props.searchClose();

    this.setState(() => ({
      iconActive: null,
      showSearch: false,
      searchText: null,
    }));
  };

  handleSearch = (value: string) => {
    this.setState({ searchText: value });
    this.props.searchTextUpdate(value);
  };

  handleSearchIconClick = () => {
    const { showSearch, searchText } = this.state;
    if (showSearch && !searchText) {
      this.hideSearch();
    } else {
      this.setActiveIcon('search');
    }
  };

  render() {
    const {
      data,
      options,
      classes,
      columns,
      filterData,
      filterList,
      filterUpdate,
      resetFilters,
      toggleViewColumn,
      updateColumns,
      title,
      components = {},
      updateFilterByType,
    } = this.props;
    const { icons = {} } = components;

    const Tooltip = components.Tooltip || MuiTooltip;
    const TableViewColComponent = (components.TableViewCol || TableViewCol) as ComponentType<any>;
    const TableFilterComponent = (components.TableFilter || TableFilter) as ComponentType<any>;
    const SearchIconComponent = icons.SearchIcon || SearchIcon;
    const DownloadIconComponent = icons.DownloadIcon || DownloadIcon;
    const PrintIconComponent = icons.PrintIcon || PrintIcon;
    const ViewColumnIconComponent = icons.ViewColumnIcon || ViewColumnIcon;
    const FilterIconComponent = icons.FilterIcon || FilterIcon;
    const { search, downloadCsv, print, viewColumns, filterTable } = options.textLabels.toolbar;
    const { showSearch, searchText } = this.state;

    const filterPopoverExit = () => {
      this.setState({ hideFilterPopover: false });
      this.setActiveIcon();
    };

    const closeFilterPopover = () => {
      this.setState({ hideFilterPopover: true });
    };

    return (
      <Toolbar
        className={options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.root : classes.fullWidthRoot}
        role={'toolbar'}
        aria-label={'Table Toolbar'}>
        <div className={options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.left : classes.fullWidthLeft}>
          {showSearch === true ? (
            typeof options.customSearchRender === 'function' ? (
              options.customSearchRender(searchText || '', this.handleSearch, this.hideSearch, options)
            ) : options.customSearchRender ? (
              options.customSearchRender
            ) : (
              <TableSearch
                searchText={searchText || ''}
                onSearch={this.handleSearch}
                onHide={this.hideSearch}
                options={options}
              />
            )
          ) : typeof title !== 'string' ? (
            title
          ) : (
            <div className={classes.titleRoot} aria-hidden={'true'}>
              <Typography
                variant="h6"
                className={
                  options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.titleText : classes.fullWidthTitleText
                }>
                {title}
              </Typography>
            </div>
          )}
        </div>
        <div className={options.responsive !== RESPONSIVE_FULL_WIDTH_NAME ? classes.actions : classes.fullWidthActions}>
          {!(options.search === false || options.search === 'false' || options.searchAlwaysOpen === true) && (
            <Tooltip title={search} disableFocusListener>
              <IconButton
                aria-label={search}
                data-testid={search + '-iconButton'}
                ref={(el) => {
                  this.searchButton = el;
                }}
                classes={{ root: this.getActiveIcon(classes, 'search') }}
                disabled={options.search === 'disabled'}
                onClick={this.handleSearchIconClick}>
                <SearchIconComponent />
              </IconButton>
            </Tooltip>
          )}
          {!(options.download === false || options.download === 'false') && (
            <Tooltip title={downloadCsv}>
              <IconButton
                data-testid={downloadCsv.replace(/\s/g, '') + '-iconButton'}
                aria-label={downloadCsv}
                classes={{ root: classes.icon }}
                disabled={options.download === 'disabled'}
                onClick={this.handleCSVDownload}>
                <DownloadIconComponent />
              </IconButton>
            </Tooltip>
          )}
          {!(options.print === false || options.print === 'false') && (
            <span>
              <PrintButton
                getContent={() => this.props.tableRef()}
                classes={classes}
                IconComponent={PrintIconComponent}
                options={options}
                print={print}
                Tooltip={Tooltip}
              />
            </span>
          )}
          {!(options.viewColumns === false || options.viewColumns === 'false') && (
            <Popover
              refExit={this.setActiveIcon.bind(null)}
              classes={{ closeIcon: classes.filterCloseIcon }}
              hide={options.viewColumns === 'disabled'}
              trigger={
                <Tooltip title={viewColumns} disableFocusListener>
                  <IconButton
                    data-testid={viewColumns + '-iconButton'}
                    aria-label={viewColumns}
                    classes={{ root: this.getActiveIcon(classes, 'viewcolumns') }}
                    disabled={options.viewColumns === 'disabled'}
                    onClick={this.setActiveIcon.bind(null, 'viewcolumns')}>
                    <ViewColumnIconComponent />
                  </IconButton>
                </Tooltip>
              }
              content={
                <TableViewColComponent
                  columns={columns}
                  options={options}
                  onColumnUpdate={toggleViewColumn}
                  updateColumns={updateColumns}
                  components={components}
                />
              }
            />
          )}
          {!(options.filter === false || options.filter === 'false') && (
            <Popover
              refExit={filterPopoverExit}
              hide={this.state.hideFilterPopover || options.filter === 'disabled'}
              classes={{ paper: classes.filterPaper, closeIcon: classes.filterCloseIcon }}
              trigger={
                <Tooltip title={filterTable} disableFocusListener>
                  <IconButton
                    data-testid={filterTable + '-iconButton'}
                    aria-label={filterTable}
                    classes={{ root: this.getActiveIcon(classes, 'filter') }}
                    disabled={options.filter === 'disabled'}
                    onClick={this.setActiveIcon.bind(null, 'filter')}>
                    <FilterIconComponent />
                  </IconButton>
                </Tooltip>
              }
              content={
                <TableFilterComponent
                  customFooter={options.customFilterDialogFooter}
                  columns={columns}
                  options={options}
                  filterList={filterList}
                  filterData={filterData}
                  onFilterUpdate={filterUpdate}
                  onFilterReset={resetFilters}
                  handleClose={closeFilterPopover}
                  updateFilterByType={updateFilterByType}
                  components={components as any}
                />
              }
            />
          )}
          {options.customToolbar &&
            (typeof options.customToolbar === 'function'
              ? options.customToolbar({ displayData: this.props.displayData })
              : options.customToolbar)}
        </div>
      </Toolbar>
    );
  }
}

export default withStyles(TableToolbar, defaultToolbarStyles, { name: 'MUIDataTableToolbar' });
