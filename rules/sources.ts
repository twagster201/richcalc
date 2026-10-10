/**
 * Every external source RichCalc relies on, listed once.
 *
 * `accessed` is the date the source was last read for this project. Rule values carry their own
 * `verified` date. Prefer primary sources (GOV.UK, HMRC, legislation.gov.uk, gov.scot, gov.wales,
 * ONS, Bank of England, OBR); fall back to authoritative secondary sources only where none exists,
 * and say so in the value's note.
 */

export interface Source {
  title: string;
  publisher: string;
  url: string;
  accessed: string;
  kind: 'primary' | 'secondary' | 'data';
}

const accessed = '2026-10-10';

export const SOURCES = {
  'govuk-employer-rates-2026-27': {
    title: 'Rates and thresholds for employers 2026 to 2027',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027',
    accessed,
    kind: 'primary',
  },
  'govuk-ni-rates': {
    title: 'Rates and allowances: National Insurance contributions',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions',
    accessed,
    kind: 'primary',
  },
  'govuk-income-tax-rates': {
    title: 'Income Tax rates and allowances for current and previous tax years',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past',
    accessed,
    kind: 'primary',
  },
  'govuk-thresholds-frozen-2031': {
    title: 'Maintaining income tax and equivalent NICs thresholds until 5 April 2031 (policy paper)',
    publisher: 'HM Treasury / HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/maintaining-income-tax-and-equivalent-national-insurance-contributions-thresholds-until-5-april-2031/income-tax-maintaining-the-personal-allowance-and-the-basic-rate-limit-for-income-tax-and-equivalent-national-insurance-contributions-thresholds-unt',
    accessed,
    kind: 'primary',
  },
  'govuk-budget-2025-annex-a': {
    title: 'Budget 2025: Overview of tax legislation and rates, Annex A: rates and allowances',
    publisher: 'HM Treasury (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances',
    accessed,
    kind: 'primary',
  },
  'govscot-income-tax-2026-27': {
    title: 'Scottish Income Tax: rates and bands 2026 to 2027',
    publisher: 'Scottish Government (gov.scot)',
    url: 'https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/',
    accessed,
    kind: 'primary',
  },
  'govscot-srr-2026-27': {
    title: 'Scottish Rate Resolution 2026 to 2027: draft motion and explanatory note',
    publisher: 'Scottish Government (gov.scot)',
    url: 'https://www.gov.scot/publications/scottish-rate-resolution-2026-2027-draft-motion-explanatory-note/',
    accessed,
    kind: 'primary',
  },
  'ciot-srr-agreed-2026-27': {
    title: 'MSPs agree income tax rates for 2026/27',
    publisher: 'Chartered Institute of Taxation',
    url: 'https://www.tax.org.uk/msps-agree-income-tax-rates-for-2026-27',
    accessed,
    kind: 'secondary',
  },
  'govuk-property-savings-dividend-rates': {
    title: 'Changes to tax rates for property, savings and dividend income',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/changes-to-tax-rates-for-property-savings-and-dividend-income',
    accessed,
    kind: 'primary',
  },
  'govuk-tax-on-dividends': {
    title: 'Tax on dividends',
    publisher: 'GOV.UK',
    url: 'https://www.gov.uk/tax-on-dividends',
    accessed,
    kind: 'primary',
  },
  'govuk-cgt-rates': {
    title: 'Capital Gains Tax rates and allowances',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/guidance/capital-gains-tax-rates-and-allowances',
    accessed,
    kind: 'primary',
  },
  'govuk-sl-deduction-tables-2026-27': {
    title: '2026 to 2027: Student and Postgraduate Loan deduction tables',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/sl3-student-loan-deduction-tables/2026-to-2027-student-and-postgraduate-loan-deduction-tables',
    accessed,
    kind: 'primary',
  },
  'govuk-sl-collection-2026': {
    title: 'Collection of student loans from 6 April 2026 (payroll technical specification)',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/payroll-technical-specifications-student-loans/collection-of-student-loans-from-6-april-2026',
    accessed,
    kind: 'primary',
  },
  'govuk-child-benefit-rates': {
    title: 'Child Benefit, Guardian’s Allowance and tax credits: rates and allowances',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/rates-and-allowances-tax-credits-child-benefit-and-guardians-allowance/tax-credits-child-benefit-and-guardians-allowance',
    accessed,
    kind: 'primary',
  },
  'govuk-hicbc': {
    title: 'High Income Child Benefit Charge',
    publisher: 'GOV.UK',
    url: 'https://www.gov.uk/child-benefit-tax-charge',
    accessed,
    kind: 'primary',
  },
  'govuk-tax-free-childcare': {
    title: 'Tax-Free Childcare',
    publisher: 'GOV.UK',
    url: 'https://www.gov.uk/tax-free-childcare',
    accessed,
    kind: 'primary',
  },
  'govuk-free-childcare-working-eligibility': {
    title: 'Free Childcare for Working Parents: check if you’re eligible',
    publisher: 'GOV.UK',
    url: 'https://www.gov.uk/free-childcare-if-working/check-youre-eligible',
    accessed,
    kind: 'primary',
  },
  'bsil-30-hours-eligibility': {
    title: 'Eligibility for 30 hours childcare',
    publisher: 'Department for Education (Best Start in Life)',
    url: 'https://beststartinlife.gov.uk/childcare-early-years-education/15-and-30-hours-support/working-families/eligibility/',
    accessed,
    kind: 'primary',
  },
  'govscot-elc': {
    title: 'Funded early learning and childcare',
    publisher: 'Scottish Government (gov.scot)',
    url: 'https://www.gov.scot/policies/early-education-and-care/early-learning-and-childcare/',
    accessed,
    kind: 'primary',
  },
  'govwales-childcare-offer-eligibility': {
    title: 'Get up to 30 hours of childcare for 3 and 4 year olds: eligibility',
    publisher: 'Welsh Government (gov.wales)',
    url: 'https://www.gov.wales/get-30-hours-childcare-3-and-4-year-olds/eligibility',
    accessed,
    kind: 'primary',
  },
  'educationni-nicss-2026': {
    title: 'Education Minister announces continuation of Northern Ireland Childcare Subsidy Scheme',
    publisher: 'Department of Education (Northern Ireland)',
    url: 'https://www.education-ni.gov.uk/news/education-minister-announces-continuation-northern-ireland-childcare-subsidy-scheme-education',
    accessed,
    kind: 'primary',
  },
  'govuk-cash-isa-limit': {
    title: 'Cash Individual Savings Account (ISA) limit reduction (policy paper)',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/reduction-in-the-cash-individual-savings-account-isa-limit/cash-individual-savings-account-isa-limit-reduction',
    accessed,
    kind: 'primary',
  },
  'govuk-isa-anti-circumvention': {
    title: 'ISA reform 2027: anti-circumvention rules factsheet',
    publisher: 'HM Treasury (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/fiscal-events-2026-factsheets/isa-reform-2027-anti-circumvention-rules-factsheet',
    accessed,
    kind: 'primary',
  },
  'leg-isa-amendment-no2-2026': {
    title: 'The Individual Savings Account (Amendment) (No. 2) Regulations 2026 (SI 2026/1018)',
    publisher: 'legislation.gov.uk',
    url: 'https://www.legislation.gov.uk/uksi/2026/1018/contents/made',
    accessed,
    kind: 'primary',
  },
  'govuk-pension-rates': {
    title: 'Pension schemes rates and allowances',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/rates-and-allowances-pension-schemes/pension-schemes-rates',
    accessed,
    kind: 'primary',
  },
  'govuk-salary-sacrifice-2029': {
    title: 'Salary sacrifice reform for pension contributions (effective from 6 April 2029)',
    publisher: 'HMRC (GOV.UK)',
    url: 'https://www.gov.uk/government/publications/salary-sacrifice-reform-for-pension-contributions-effective-from-6-april-2029/salary-sacrifice-reform-for-pension-contributions',
    accessed,
    kind: 'primary',
  },
  'parliament-nic-employer-pensions-bill': {
    title: 'National Insurance Contributions (Employer Pensions Contributions) Bill',
    publisher: 'UK Parliament',
    url: 'https://bills.parliament.uk/bills/4046',
    accessed,
    kind: 'primary',
  },
  'govuk-sdlt-residential': {
    title: 'Stamp Duty Land Tax: residential property rates',
    publisher: 'GOV.UK',
    url: 'https://www.gov.uk/stamp-duty-land-tax/residential-property-rates',
    accessed,
    kind: 'primary',
  },
  'hmrc-sdltm29805': {
    title: 'SDLTM29805: Introduction to First-Time Buyers’ relief',
    publisher: 'HMRC internal manual (GOV.UK)',
    url: 'https://www.gov.uk/hmrc-internal-manuals/stamp-duty-land-tax-manual/sdltm29805',
    accessed,
    kind: 'primary',
  },
  'revscot-lbtt-residential': {
    title: 'LBTT residential property rates and bands',
    publisher: 'Revenue Scotland',
    url: 'https://revenue.scot/taxes/land-buildings-transaction-tax/residential-property',
    accessed,
    kind: 'primary',
  },
  'govscot-tax-ready-reckoners-2026-27': {
    title: 'Scottish Budget 2026 to 2027: Scottish tax ready reckoners (LBTT)',
    publisher: 'Scottish Government (gov.scot)',
    url: 'https://www.gov.scot/publications/scottish-budget-2026-2027-scottish-tax-ready-reckoners/pages/4/',
    accessed,
    kind: 'primary',
  },
  'govwales-ltt-rates': {
    title: 'Land Transaction Tax rates and bands',
    publisher: 'Welsh Government (gov.wales)',
    url: 'https://www.gov.wales/land-transaction-tax-rates-and-bands',
    accessed,
    kind: 'primary',
  },
  'govwales-draft-budget-2026-27-taxes': {
    title: 'Written Statement: Draft Budget 2026-27: Welsh Taxes (14 October 2025)',
    publisher: 'Welsh Government (gov.wales)',
    url: 'https://www.gov.wales/written-statement-draft-budget-2026-27-welsh-taxes',
    accessed,
    kind: 'primary',
  },
  'govuk-nlw-2026': {
    title: 'National Living Wage increases to £12.71 per hour',
    publisher: 'GOV.UK',
    url: 'https://www.gov.uk/government/news/national-living-wage-increases-to-1271-per-hour',
    accessed,
    kind: 'primary',
  },
  'boe-mps-sep-2026': {
    title: 'Bank Rate maintained at 3.75%: September 2026 Monetary Policy Summary and Minutes',
    publisher: 'Bank of England',
    url: 'https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/september-2026',
    accessed,
    kind: 'primary',
  },
  'boe-mpr-jul-2026': {
    title: 'Monetary Policy Report: July 2026',
    publisher: 'Bank of England',
    url: 'https://www.bankofengland.co.uk/monetary-policy-report/2026/july-2026',
    accessed,
    kind: 'primary',
  },
  'boe-mps-survey-sep-2026': {
    title: 'Market Participants Survey results: September 2026',
    publisher: 'Bank of England',
    url: 'https://www.bankofengland.co.uk/markets/market-intelligence/survey-results/2026/market-participants-survey-results-september-2026',
    accessed,
    kind: 'primary',
  },
  'boe-money-credit-aug-2026': {
    title: 'Money and Credit: August 2026',
    publisher: 'Bank of England',
    url: 'https://www.bankofengland.co.uk/statistics/money-and-credit/2026/august-2026',
    accessed,
    kind: 'data',
  },
  'boe-inflation-target': {
    title: 'Monetary policy: the 2% inflation target',
    publisher: 'Bank of England',
    url: 'https://www.bankofengland.co.uk/monetary-policy/inflation',
    accessed,
    kind: 'primary',
  },
  'ubs-giry-2026': {
    title: 'UBS Global Investment Returns Yearbook 2026 (summary edition), Dimson, Marsh and Staunton',
    publisher: 'UBS / London Business School',
    url: 'https://www.ubs.com/content/dam/assets/wm/static/cio/documents/giry2026-summary-public.pdf',
    accessed,
    kind: 'data',
  },
  'ons-pipr-sep-2026': {
    title: 'Private rent and house prices, UK: September 2026',
    publisher: 'Office for National Statistics',
    url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/september2026',
    accessed,
    kind: 'data',
  },
  'kay-2016-quantile-dotplots': {
    title: 'When (ish) is my bus? User-centered visualizations of uncertainty in everyday, mobile predictive systems (Kay, Kola, Hullman, Munson, CHI 2016)',
    publisher: 'ACM CHI',
    url: 'https://doi.org/10.1145/2858036.2858558',
    accessed,
    kind: 'secondary',
  },
  'richcalc-judgement': {
    title: 'RichCalc modelling choice (reasoning given alongside the value)',
    publisher: 'RichCalc',
    url: 'https://richcalc.com/how-it-works/',
    accessed,
    kind: 'secondary',
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
