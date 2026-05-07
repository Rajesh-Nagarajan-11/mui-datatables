import type { ComponentType } from 'react';
import type { TooltipProps } from '@mui/material/Tooltip';
import type { SvgIconProps } from '@mui/material/SvgIcon';

export interface MUIDataTableComponents {
  TableBody?: ComponentType<unknown>;
  TableFilter?: ComponentType<unknown>;
  TableFilterList?: ComponentType<unknown>;
  TableFooter?: ComponentType<unknown>;
  TableHead?: ComponentType<unknown>;
  TableResize?: ComponentType<unknown>;
  TableToolbar?: ComponentType<unknown>;
  TableToolbarSelect?: ComponentType<unknown>;
  TableViewCol?: ComponentType<unknown>;
  Tooltip?: ComponentType<TooltipProps>;
  DragDropBackend?: unknown;
  icons?: {
    SearchIcon?: ComponentType<SvgIconProps>;
    DownloadIcon?: ComponentType<SvgIconProps>;
    PrintIcon?: ComponentType<SvgIconProps>;
    ViewColumnIcon?: ComponentType<SvgIconProps>;
    FilterIcon?: ComponentType<SvgIconProps>;
  };
}
