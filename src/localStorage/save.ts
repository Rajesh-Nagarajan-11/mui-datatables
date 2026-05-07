type PersistableState = Record<string, unknown> & {
  selectedRows?: unknown;
  data?: unknown;
  displayData?: unknown;
};

export const save = (storageKey: string, state: PersistableState): void => {
  const savedState = { ...state };
  delete savedState.selectedRows;
  delete savedState.data;
  delete savedState.displayData;

  window.localStorage.setItem(storageKey, JSON.stringify(savedState));
};
