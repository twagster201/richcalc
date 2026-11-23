import { CALCULATORS } from '../calculators/meta.js';

// Also used by scripts/prerender.mjs for FAQPage structured data.
export const FAQS = [
  [
    'What is RichCalc?',
    'RichCalc is a free collection of friendly calculators for money, health and everyday life, from mortgages and savings to BMI, calories and tips.',
  ],
  [
    'Which calculators are available?',
    `There are ${CALCULATORS.length} calculators: ${CALCULATORS.map((c) => c.title.replace(' Calculator', '')).join(', ')}.`,
  ],
  [
    'Can I use my own currency?',
    'Yes. RichCalc picks a currency based on your browser’s language and region, and you can change it at any time with the 🌍 button at the top of the page. More than 30 currencies are supported.',
  ],
  [
    'Does it support metric and imperial units?',
    'Yes. Health calculators work in centimetres and kilograms or feet, inches and pounds. Switch units with the 🌍 button or inside any health calculator; your numbers are converted automatically.',
  ],
  [
    'Does RichCalc store my personal data?',
    'No. All calculations run in your browser and nothing you type is sent anywhere. We don’t use cookies, analytics or tracking. Your currency, unit and theme choices are saved in your browser’s local storage only so they are remembered next time.',
  ],
  [
    'How accurate are the calculators?',
    'They use well-known, published formulas (for example the standard loan amortization formula, Mifflin–St Jeor for BMR and the US Navy method for body fat). Results are estimates for information only and are not financial or medical advice.',
  ],
  [
    'Can I use RichCalc on my phone?',
    'Yes. Every calculator is designed to work on phones, tablets and desktops, and supports light and dark mode.',
  ],
];
