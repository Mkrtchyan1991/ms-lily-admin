export const getUserLocale = (): string => (typeof navigator !== 'undefined' ? navigator.language : 'de-DE');

export const getUserTimeZone = (): string =>
  typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Europe/Berlin';

export const formatDate = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getUserLocale(), {
    timeZone: getUserTimeZone(),
    dateStyle: 'short',
    ...options,
  }).format(d);
};

export const formatTime = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getUserLocale(), {
    timeZone: getUserTimeZone(),
    timeStyle: 'short',
    ...options,
  }).format(d);
};

export const formatDateTime = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(getUserLocale(), {
    timeZone: getUserTimeZone(),
    dateStyle: 'short',
    timeStyle: 'short',
    ...options,
  }).format(d);
};
