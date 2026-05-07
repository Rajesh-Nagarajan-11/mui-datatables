import React from 'react';
import type { ChangeEvent, ComponentProps, ComponentType, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Grow, IconButton, TextField } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { withStyles } from 'tss-react/mui';
import type { MUIDataTableOptions } from '../types';

type DebouncedFunction<TArgs extends unknown[]> = (...args: TArgs) => void;

function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number,
  immediate?: boolean,
): DebouncedFunction<TArgs> {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function debounced(...args: TArgs) {
    const later = function () {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

const defaultStyles = (theme: Theme) => ({
  main: {
    display: 'flex',
    flex: '1 0 auto',
    alignItems: 'center',
  },
  searchIcon: {
    color: theme.palette.text.secondary,
    marginRight: '8px',
  },
  searchText: {
    flex: '0.8 0',
  },
  clearIcon: {
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
});

interface DebounceTableSearchClasses {
  main: string;
  searchIcon: string;
  searchText: string;
  clearIcon: string;
}

interface DebounceTableSearchProps {
  classes: DebounceTableSearchClasses;
  options: MUIDataTableOptions & {
    textLabels: {
      toolbar: {
        search: string;
      };
    };
  };
  onHide: () => void;
  onSearch: (value: string) => void;
  searchText?: string;
  debounceWait: number;
}

class _DebounceTableSearch extends React.Component<DebounceTableSearchProps> {
  searchField: HTMLInputElement | null = null;

  handleTextChangeWrapper = (debouncedSearch: (value: string) => void) => {
    return function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
      debouncedSearch(event.target.value);
    };
  };

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, false);
  }

  onKeyDown = (event: KeyboardEvent | ReactKeyboardEvent) => {
    if (event.keyCode === 27) {
      this.props.onHide();
    }
  };

  render() {
    const { classes, options, onHide, searchText, debounceWait } = this.props;

    const debouncedSearch = debounce<[string]>((value) => {
      this.props.onSearch(value);
    }, debounceWait);

    const clearIconVisibility = options.searchAlwaysOpen ? 'hidden' : 'visible';
    const inputProps = {
      InputProps: {
        'data-test-id': options.textLabels.toolbar.search,
        'aria-label': options.textLabels.toolbar.search,
      },
    } as unknown as Partial<ComponentProps<typeof TextField>>;

    return (
      <Grow appear in={true} timeout={300}>
        <div className={classes.main}>
          <SearchIcon className={classes.searchIcon} />
          <TextField
            variant={'standard'}
            className={classes.searchText}
            autoFocus={true}
            {...inputProps}
            defaultValue={searchText}
            onChange={this.handleTextChangeWrapper(debouncedSearch)}
            fullWidth={true}
            inputRef={(el) => (this.searchField = el)}
            placeholder={options.searchPlaceholder}
            {...(options.searchProps ? options.searchProps : {})}
          />
          <IconButton className={classes.clearIcon} style={{ visibility: clearIconVisibility }} onClick={onHide}>
            <ClearIcon />
          </IconButton>
        </div>
      </Grow>
    );
  }
}

type DebounceTableSearchPublicProps = Omit<DebounceTableSearchProps, 'classes'>;

const DebounceTableSearch = withStyles(_DebounceTableSearch, defaultStyles, { name: 'MUIDataTableSearch' }) as unknown as ComponentType<DebounceTableSearchPublicProps>;
export { DebounceTableSearch };

export function debounceSearchRender(debounceWait = 200) {
  return (
    searchText: string,
    handleSearch: (searchText: string) => void,
    hideSearch: () => void,
    options: DebounceTableSearchProps['options'],
  ) => {
    return (
      <DebounceTableSearch
        searchText={searchText}
        onSearch={handleSearch}
        onHide={hideSearch}
        options={options}
        debounceWait={debounceWait}
      />
    );
  };
}
