import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/de';

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const getUserLocale = (): string => (typeof navigator !== 'undefined' ? navigator.language : 'de-DE');

export const getUserTimeZone = (): string =>
  typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Europe/Berlin';

const dateStyleMap: Record<NonNullable<Intl.DateTimeFormatOptions['dateStyle']>, string> = {
  short: 'L',
  medium: 'll',
  long: 'LL',
  full: 'dddd, LL',
};

const timeStyleMap: Record<NonNullable<Intl.DateTimeFormatOptions['timeStyle']>, string> = {
  short: 'LT',
  medium: 'LTS',
  long: 'LTS',
  full: 'LTS',
};

const getLocale = (): string => {
  const locale = getUserLocale().toLowerCase();
  if ((dayjs as any).Ls[locale]) return locale;
  const generic = locale.split('-')[0];
  return (dayjs as any).Ls[generic] ? generic : 'en';
};

const buildFormat = (
  defaultDateToken: string,
  defaultTimeToken: string | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const { dateStyle, timeStyle } = options;
  const dateToken = dateStyle ? dateStyleMap[dateStyle] : defaultDateToken;
  const timeToken = timeStyle ? timeStyleMap[timeStyle] : defaultTimeToken;
  return [dateToken, timeToken].filter(Boolean).join(' ');
};

export const formatDate = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const formatStr = buildFormat('L', undefined, options);
  return dayjs(date).tz(getUserTimeZone()).locale(getLocale()).format(formatStr);
};

export const formatTime = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const formatStr = buildFormat('', 'LT', options);
  return dayjs(date).tz(getUserTimeZone()).locale(getLocale()).format(formatStr);
};

export const formatDateTime = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const formatStr = buildFormat('L', 'LT', options);
  return dayjs(date).tz(getUserTimeZone()).locale(getLocale()).format(formatStr);
};
