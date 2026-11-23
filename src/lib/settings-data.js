export const CURRENCIES = [
  ['USD', 'US Dollar'], ['EUR', 'Euro'], ['GBP', 'British Pound'], ['JPY', 'Japanese Yen'],
  ['CNY', 'Chinese Yuan'], ['INR', 'Indian Rupee'], ['CAD', 'Canadian Dollar'], ['AUD', 'Australian Dollar'],
  ['NZD', 'New Zealand Dollar'], ['CHF', 'Swiss Franc'], ['SEK', 'Swedish Krona'], ['NOK', 'Norwegian Krone'],
  ['DKK', 'Danish Krone'], ['PLN', 'Polish Złoty'], ['BRL', 'Brazilian Real'], ['MXN', 'Mexican Peso'],
  ['ZAR', 'South African Rand'], ['NGN', 'Nigerian Naira'], ['KES', 'Kenyan Shilling'], ['AED', 'UAE Dirham'],
  ['SAR', 'Saudi Riyal'], ['SGD', 'Singapore Dollar'], ['HKD', 'Hong Kong Dollar'], ['KRW', 'South Korean Won'],
  ['PHP', 'Philippine Peso'], ['IDR', 'Indonesian Rupiah'], ['MYR', 'Malaysian Ringgit'], ['TRY', 'Turkish Lira'],
  ['PKR', 'Pakistani Rupee'], ['BDT', 'Bangladeshi Taka'],
].map(([code, name]) => ({ code, name }));

const REGION_CURRENCY = {
  US: 'USD', GB: 'GBP', IE: 'EUR', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  PT: 'EUR', FI: 'EUR', GR: 'EUR', JP: 'JPY', CN: 'CNY', IN: 'INR', CA: 'CAD', AU: 'AUD', NZ: 'NZD', CH: 'CHF',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', BR: 'BRL', MX: 'MXN', ZA: 'ZAR', NG: 'NGN', KE: 'KES', AE: 'AED',
  SA: 'SAR', SG: 'SGD', HK: 'HKD', KR: 'KRW', PH: 'PHP', ID: 'IDR', MY: 'MYR', TR: 'TRY', PK: 'PKR', BD: 'BDT',
};

/** Countries that mainly use imperial units for body measurements. */
const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM']);

export function detectDefaults(language) {
  let region = 'US';
  try {
    region = new Intl.Locale(language).maximize().region || 'US';
  } catch {
    /* keep default */
  }
  return {
    currency: REGION_CURRENCY[region] || 'USD',
    units: IMPERIAL_REGIONS.has(region) ? 'imperial' : 'metric',
  };
}
