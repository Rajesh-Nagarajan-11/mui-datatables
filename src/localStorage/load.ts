const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const load = (storageKey?: string): unknown => {
  if (isBrowser && storageKey !== undefined) {
    const storedState = window.localStorage.getItem(storageKey);
    return storedState === null ? null : JSON.parse(storedState);
  } else if (storageKey !== undefined) {
    console.warn('storageKey support only on browser');
    return undefined;
  }

  return undefined;
};
