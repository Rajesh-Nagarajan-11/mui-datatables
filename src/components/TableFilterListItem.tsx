import { Chip } from '@mui/material';
import type { ComponentProps, ReactNode } from 'react';
import React from 'react';
import clsx from 'clsx';

export interface TableFilterListItemProps {
  label?: ReactNode;
  onDelete: ComponentProps<typeof Chip>['onDelete'];
  className: string;
  filterProps?: Partial<ComponentProps<typeof Chip>>;
}

const TableFilterListItem = ({ label, onDelete, className, filterProps = {} }: TableFilterListItemProps) => {
  const mergedClassName = filterProps.className ? clsx(className, filterProps.className) : className;
  return <Chip label={label} onDelete={onDelete} className={mergedClassName} {...filterProps} />;
};

export default TableFilterListItem;
