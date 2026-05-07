import { makeStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import React from 'react';
import TableFilterListItem from './TableFilterListItem';
import type { ComponentType, ReactNode } from 'react';
import type {
  MUIDataTableColumnState,
  MUIDataTableFilterList,
  MUIDataTableOptions,
} from '../types';

const useStyles = makeStyles({ name: 'MUIDataTableFilterList' })(() => ({
  root: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    margin: '0px 16px 0px 16px',
  },
  chip: {
    margin: '8px 8px 0px 0px',
  },
}));

interface ColumnName {
  name: string;
  filterType?: string;
}

interface TableFilterListProps {
  options: MUIDataTableOptions;
  filterList: MUIDataTableFilterList;
  filterUpdate: (
    index: number,
    value: string | string[],
    column: string,
    type: string,
    customUpdate?: (filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList,
    next?: (filterList: MUIDataTableFilterList) => void,
  ) => void;
  filterListRenderers: Array<(value: string[] | string) => ReactNode>;
  columnNames: ColumnName[];
  serverSideFilterList?: MUIDataTableFilterList;
  customFilterListUpdate: Array<((filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList) | null>;
  ItemComponent?: ComponentType<any>;
}

const TableFilterList = ({
  options,
  filterList,
  filterUpdate,
  filterListRenderers,
  columnNames,
  serverSideFilterList,
  customFilterListUpdate,
  ItemComponent = TableFilterListItem,
}: TableFilterListProps) => {
  const { classes } = useStyles();
  const { serverSide } = options;

  const removeFilter = (
    index: number,
    filterValue: string | string[],
    columnName: string,
    filterType: string,
    customUpdate: ((filterList: MUIDataTableFilterList, filterPos: number, index: number) => MUIDataTableFilterList) | null = null,
  ) => {
    let removedFilter: string | string[] = filterValue;
    if (Array.isArray(removedFilter) && removedFilter.length === 0) {
      removedFilter = filterList[index];
    }

    filterUpdate(index, filterValue, columnName, filterType, customUpdate || undefined, (updated) => {
      if (options.onFilterChipClose) {
        options.onFilterChipClose(index, removedFilter as string, updated);
      }
    });
  };

  const customFilterChip = (
    customFilterItem: ReactNode,
    index: number,
    customFilterItemIndex: number,
    item: string[],
    isArray: boolean,
  ) => {
    let type;
    if (isArray) {
      type = customFilterListUpdate[index] ? 'custom' : 'chip';
    } else {
      type = columnNames[index].filterType;
    }

    return (
      <ItemComponent
        label={customFilterItem}
        key={customFilterItemIndex}
        onDelete={() =>
          removeFilter(
            index,
            item[customFilterItemIndex] || [],
            columnNames[index].name,
            type || 'custom',
            customFilterListUpdate[index],
          )
        }
        className={classes.chip}
        itemKey={customFilterItemIndex}
        index={index}
        data={item}
        columnNames={columnNames}
        filterProps={
          options.setFilterChipProps
            ? options.setFilterChipProps(index, columnNames[index].name, String(item[customFilterItemIndex] ?? ''))
            : {}
        }
      />
    );
  };

  const filterChip = (index: number, data: string, colIndex: number) => (
    <ItemComponent
      label={filterListRenderers[index](data)}
      key={colIndex}
      onDelete={() => removeFilter(index, data, columnNames[index].name, 'chip')}
      className={classes.chip}
      itemKey={colIndex}
      index={index}
      data={data}
      columnNames={columnNames}
      filterProps={options.setFilterChipProps ? options.setFilterChipProps(index, columnNames[index].name, data) : {}}
    />
  );

  const getFilterList = (list: MUIDataTableFilterList) => {
    return list.map((item, index) => {
      if (columnNames[index].filterType === 'custom' && list[index].length) {
        const filterListRenderersValue = filterListRenderers[index](item);

        if (Array.isArray(filterListRenderersValue)) {
          return filterListRenderersValue.map((customFilterItem, customFilterItemIndex) =>
            customFilterChip(customFilterItem, index, customFilterItemIndex, item, true),
          );
        } else {
          return customFilterChip(filterListRenderersValue, index, index, item, false);
        }
      }

      return item.map((data, colIndex) => filterChip(index, data, colIndex));
    });
  };

  return (
    <div className={classes.root}>
      {serverSide && serverSideFilterList ? getFilterList(serverSideFilterList) : getFilterList(filterList)}
    </div>
  );
};

TableFilterList.propTypes = {
  filterList: PropTypes.array.isRequired,
  filterListRenderers: PropTypes.array.isRequired,
  columnNames: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ name: PropTypes.string.isRequired, filterType: PropTypes.string }),
    ]),
  ).isRequired,
  onFilterUpdate: PropTypes.func,
  ItemComponent: PropTypes.any,
};

export default TableFilterList;
