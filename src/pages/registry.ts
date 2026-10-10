/** Every page on the site: where it is built, and its title and description. */
export interface PageMeta {
  path: string;
  file: string;
  title: string;
  description: string;
}

export const PAGES: PageMeta[] = [
  {
    path: '/',
    file: 'index.html',
    title: 'RichCalc: UK money decisions, with the uncertainty left in',
    description:
      'UK personal-finance tools that show a range of likely outcomes, the chance each option comes out ahead, and every assumption behind the result.',
  },
  {
    path: '/mortgage-or-isa/',
    file: 'mortgage-or-isa/index.html',
    title: 'Overpay your mortgage or invest in an ISA? · RichCalc',
    description:
      'Compare overpaying your mortgage with investing in a stocks and shares or cash ISA across 5,000 simulated futures for rates, inflation and markets.',
  },
  {
    path: '/how-it-works/',
    file: 'how-it-works/index.html',
    title: 'How it works · RichCalc',
    description: 'How RichCalc simulates thousands of futures, the distributions it uses, and how to read fan charts and dot plots.',
  },
  {
    path: '/assumptions/',
    file: 'assumptions/index.html',
    title: 'Assumptions and tax rules · RichCalc',
    description: 'Every economic assumption and UK tax rule RichCalc uses, with sources, status and the date last checked.',
  },
  {
    path: '/sources/',
    file: 'sources/index.html',
    title: 'Sources · RichCalc',
    description: 'The official sources behind RichCalc’s tax rules and assumptions.',
  },
  {
    path: '/about/',
    file: 'about/index.html',
    title: 'About and privacy · RichCalc',
    description: 'Why RichCalc exists, why it isn’t financial advice, and how it protects your privacy (no cookies, no tracking).',
  },
];
