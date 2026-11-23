// Plain data (no JSX) so it can also be read by scripts/prerender.mjs at build time.

export const CATEGORIES = [
  {
    id: 'money',
    name: 'Money',
    emoji: '💰',
    tagline: 'Loans, mortgages, savings and investing',
    description:
      'Free money calculators for mortgages, loans, car finance, savings goals, compound interest, retirement and inflation. Works in any currency.',
  },
  {
    id: 'health',
    name: 'Health',
    emoji: '💪',
    tagline: 'BMI, calories, body fat and fitness',
    description:
      'Free health calculators for BMI, BMR, daily calories, body fat, ideal weight and steps. Metric and imperial units.',
  },
  {
    id: 'everyday',
    name: 'Everyday',
    emoji: '✨',
    tagline: 'Percentages, tips, discounts and dates',
    description: 'Quick everyday calculators for percentages, tips and bill splitting, discounts and age.',
  },
];

export const CALCULATORS = [
  // Money
  {
    slug: 'mortgage',
    category: 'money',
    emoji: '🏡',
    title: 'Mortgage Calculator',
    short: 'Monthly repayments, total interest and how much overpaying saves.',
    description:
      'Work out your monthly mortgage repayment, total interest and payoff date. See a full amortization schedule and how much overpayments save. Any currency.',
    keywords: 'home loan house repayment amortization overpayment',
  },
  {
    slug: 'loan',
    category: 'money',
    emoji: '🧾',
    title: 'Loan Payment Calculator',
    short: 'Monthly payment for a set term, or how long a fixed payment takes.',
    description:
      'Calculate the monthly payment on a personal loan, or how long it will take to pay off a loan with a fixed monthly payment.',
    keywords: 'personal loan payment payoff debt credit card',
  },
  {
    slug: 'car-loan',
    category: 'money',
    emoji: '🚗',
    title: 'Car Loan Calculator',
    short: 'Car finance repayments with deposit, trade-in and balloon payment.',
    description:
      'Estimate monthly car finance payments including deposit, trade-in value and an optional balloon (final) payment such as PCP.',
    keywords: 'auto finance vehicle pcp balloon deposit',
  },
  {
    slug: 'compound-interest',
    category: 'money',
    emoji: '📈',
    title: 'Compound Interest Calculator',
    short: 'Watch savings and investments grow with regular contributions.',
    description:
      'See how your savings or investments grow with compound interest and regular monthly contributions, with a year-by-year chart.',
    keywords: 'investment growth savings interest apy',
  },
  {
    slug: 'savings-goal',
    category: 'money',
    emoji: '🎯',
    title: 'Savings Goal Calculator',
    short: 'How much to save each month to hit your target.',
    description:
      'Find out how much you need to save each month to reach a savings goal by a set date, including interest earned.',
    keywords: 'save target deposit emergency fund holiday',
  },
  {
    slug: 'retirement',
    category: 'money',
    emoji: '🏖️',
    title: 'Retirement Calculator',
    short: 'Project your pension pot and retirement income.',
    description:
      'Project your retirement savings and the yearly income they could provide, in today’s money after inflation.',
    keywords: 'pension 401k retire income nest egg',
  },
  {
    slug: 'inflation',
    category: 'money',
    emoji: '🎈',
    title: 'Inflation Calculator',
    short: 'What prices will be in the future, and what your money will be worth.',
    description:
      'Calculate how inflation changes future prices and reduces the purchasing power of your money over time.',
    keywords: 'cost of living purchasing power prices cpi',
  },
  // Health
  {
    slug: 'bmi',
    category: 'health',
    emoji: '⚖️',
    title: 'BMI Calculator',
    short: 'Body Mass Index with your healthy weight range.',
    description:
      'Calculate your Body Mass Index (BMI) in metric or imperial units and see the healthy weight range for your height.',
    keywords: 'body mass index weight height obese',
  },
  {
    slug: 'calories',
    category: 'health',
    emoji: '🍎',
    title: 'Calorie Calculator',
    short: 'Daily calories to maintain, lose or gain weight.',
    description:
      'Work out how many calories you need each day (TDEE) to maintain, lose or gain weight, based on your activity level.',
    keywords: 'tdee calorie needs diet weight loss maintenance',
  },
  {
    slug: 'bmr',
    category: 'health',
    emoji: '🔥',
    title: 'BMR Calculator',
    short: 'Calories your body burns at rest.',
    description:
      'Calculate your Basal Metabolic Rate (BMR), the calories your body burns at complete rest, using the Mifflin–St Jeor equation.',
    keywords: 'basal metabolic rate metabolism resting calories',
  },
  {
    slug: 'body-fat',
    category: 'health',
    emoji: '📏',
    title: 'Body Fat Calculator',
    short: 'Estimate body fat % from a few tape measurements.',
    description:
      'Estimate your body fat percentage with the US Navy method using height, neck, waist and hip measurements.',
    keywords: 'body fat percentage navy method lean mass',
  },
  {
    slug: 'ideal-weight',
    category: 'health',
    emoji: '🌿',
    title: 'Ideal Weight Calculator',
    short: 'Ideal body weight by four well-known formulas.',
    description:
      'Find your ideal body weight using the Robinson, Miller, Devine and Hamwi formulas, alongside the healthy BMI range.',
    keywords: 'ideal body weight ibw healthy weight',
  },
  {
    slug: 'steps-to-calories',
    category: 'health',
    emoji: '👟',
    title: 'Steps to Calories Calculator',
    short: 'Distance and calories burned from your step count.',
    description:
      'Convert your daily step count into distance walked and calories burned, based on your height, weight and walking pace.',
    keywords: 'steps walking pedometer calories burned distance',
  },
  // Everyday
  {
    slug: 'percentage',
    category: 'everyday',
    emoji: '➗',
    title: 'Percentage Calculator',
    short: 'Percent of a number, percentage change and more.',
    description:
      'Quickly work out a percentage of a number, what percent one number is of another, and percentage increase or decrease.',
    keywords: 'percent change increase decrease ratio',
  },
  {
    slug: 'tip',
    category: 'everyday',
    emoji: '🍽️',
    title: 'Tip & Bill Split Calculator',
    short: 'Work out the tip and split the bill between friends.',
    description: 'Calculate the tip on a bill and split the total evenly between any number of people.',
    keywords: 'gratuity restaurant split bill service charge',
  },
  {
    slug: 'discount',
    category: 'everyday',
    emoji: '🏷️',
    title: 'Discount Calculator',
    short: 'Sale price after discounts and sales tax.',
    description:
      'Find the final price after a percentage discount, an optional extra discount and sales tax or VAT, and how much you save.',
    keywords: 'sale price percent off vat sales tax savings',
  },
  {
    slug: 'age',
    category: 'everyday',
    emoji: '🎂',
    title: 'Age Calculator',
    short: 'Exact age in years, months and days, plus your next birthday.',
    description:
      'Calculate exact age in years, months and days from a date of birth, plus total days lived and a countdown to the next birthday.',
    keywords: 'birthday date of birth how old days between',
  },
];

export const SITE = {
  name: 'RichCalc',
  tagline: 'Friendly calculators for money, health and everyday life',
  description:
    'RichCalc is a free collection of friendly, easy-to-use calculators for money, health and everyday life. Mortgages, loans, savings, BMI, calories and more, in any currency and in metric or imperial units.',
};

export const calculatorBySlug = (slug) => CALCULATORS.find((c) => c.slug === slug);
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
