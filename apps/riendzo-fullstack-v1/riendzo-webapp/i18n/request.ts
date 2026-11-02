import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

type Messages = {[key: string]: unknown};

const isObject = (value: unknown): value is Messages =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Deep-merges `override` on top of `base`.
 * Keys missing from a locale (ts, se, kh are still being translated)
 * fall back to the default locale instead of showing "namespace.key".
 */
function deepMerge(base: Messages, override: Messages): Messages {
  const result: Messages = {...base};
  for (const [key, value] of Object.entries(override)) {
    const baseValue = base[key];
    result[key] =
      isObject(value) && isObject(baseValue) ? deepMerge(baseValue, value) : value;
  }
  return result;
}

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const defaults = (await import(`../messages/${routing.defaultLocale}.json`)).default;
  const localized =
    locale === routing.defaultLocale
      ? defaults
      : (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages: deepMerge(defaults, localized) as typeof defaults
  };
});
