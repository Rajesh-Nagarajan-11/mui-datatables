import React, { useEffect, useRef, useState } from 'react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { IconButton, Popover as MuiPopover } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

type MuiPopoverProps = ComponentProps<typeof MuiPopover>;

export interface PopoverProps extends Omit<MuiPopoverProps, 'content' | 'open' | 'anchorEl' | 'onClose'> {
  trigger: ReactElement<{ onClick?: () => void }>;
  refExit?: () => void;
  hide?: boolean;
  content: ReactNode;
  classes: MuiPopoverProps['classes'] & {
    closeIcon?: string;
  };
}

const Popover = ({ trigger, refExit, hide, content, classes, ...providedProps }: PopoverProps) => {
  const [isOpen, open] = useState(false);
  const anchorEl = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const shouldHide = typeof hide === 'boolean' ? hide : false;
      if (shouldHide) {
        open(false);
      }
    }
  }, [hide, isOpen, open]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    anchorEl.current = event.currentTarget;
    open(true);
  };

  const handleRequestClose = () => {
    open(false);
  };

  const { closeIcon: closeIconClass, ...popoverClasses } = classes;

  const transformOriginSpecs = {
    vertical: 'top',
    horizontal: 'center',
  } as const;

  const anchorOriginSpecs = {
    vertical: 'bottom',
    horizontal: 'center',
  } as const;

  const handleOnExit = () => {
    if (refExit) {
      refExit();
    }
  };

  const triggerProps = {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (trigger.props.onClick) trigger.props.onClick();
      handleClick(event);
    },
  };
  const transitionProps = {
    TransitionProps: { onExited: handleOnExit },
  } as unknown as Partial<MuiPopoverProps>;

  return (
    <>
      <span key="content" {...triggerProps}>
        {trigger}
      </span>
      <MuiPopover
        elevation={2}
        open={isOpen}
        {...transitionProps}
        onClose={handleRequestClose}
        anchorEl={anchorEl.current}
        anchorOrigin={anchorOriginSpecs}
        transformOrigin={transformOriginSpecs}
        classes={popoverClasses}
        {...providedProps}>
        <IconButton
          aria-label="Close"
          onClick={handleRequestClose}
          className={closeIconClass}
          style={{ position: 'absolute', right: '4px', top: '4px', zIndex: '1000' }}>
          <CloseIcon />
        </IconButton>
        {content}
      </MuiPopover>
    </>
  );
};

export default Popover;
