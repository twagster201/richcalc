// Pure health maths. Everything is metric internally (cm, kg).

export const LB_PER_KG = 2.2046226218;
export const CM_PER_IN = 2.54;

export function bmi(kg, cm) {
  if (!(kg > 0) || !(cm > 0)) return NaN;
  const m = cm / 100;
  return kg / (m * m);
}

export const BMI_BANDS = [
  { max: 18.5, label: 'Underweight', color: '#38bdf8' },
  { max: 25, label: 'Healthy weight', color: '#22c55e' },
  { max: 30, label: 'Overweight', color: '#f59e0b' },
  { max: Infinity, label: 'Obese', color: '#f43f5e' },
];

export const bandFor = (bands, value) => bands.find((b) => value < b.max);

/** Weight range (kg) that gives a BMI of 18.5–24.9 at this height. */
export function healthyWeightRange(cm) {
  const m = cm / 100;
  return { min: 18.5 * m * m, max: 24.9 * m * m };
}

/** Mifflin–St Jeor basal metabolic rate, kcal/day. */
export function bmr({ sex, kg, cm, age }) {
  if (!(kg > 0) || !(cm > 0) || !(age > 0)) return NaN;
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === 'female' ? base - 161 : base + 5;
}

export const ACTIVITY_LEVELS = [
  { value: '1.2', label: 'Sedentary', hint: 'Little or no exercise' },
  { value: '1.375', label: 'Lightly active', hint: 'Exercise 1–3 days a week' },
  { value: '1.55', label: 'Moderately active', hint: 'Exercise 3–5 days a week' },
  { value: '1.725', label: 'Very active', hint: 'Hard exercise 6–7 days a week' },
  { value: '1.9', label: 'Extra active', hint: 'Physical job or training twice a day' },
];

/** US Navy body-fat estimate. All measurements in cm. Hip is required for women. */
export function bodyFatNavy({ sex, cm, neck, waist, hip }) {
  if (!(cm > 0) || !(neck > 0) || !(waist > 0)) return NaN;
  let bf;
  if (sex === 'female') {
    if (!(hip > 0) || waist + hip - neck <= 0) return NaN;
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(cm)) - 450;
  } else {
    if (waist - neck <= 0) return NaN;
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(cm)) - 450;
  }
  return bf > 0 && bf < 75 ? bf : NaN;
}

export const BODY_FAT_BANDS = {
  male: [
    { max: 6, label: 'Essential fat', color: '#38bdf8' },
    { max: 14, label: 'Athletic', color: '#14b8a6' },
    { max: 18, label: 'Fitness', color: '#22c55e' },
    { max: 25, label: 'Average', color: '#f59e0b' },
    { max: Infinity, label: 'Obese', color: '#f43f5e' },
  ],
  female: [
    { max: 14, label: 'Essential fat', color: '#38bdf8' },
    { max: 21, label: 'Athletic', color: '#14b8a6' },
    { max: 25, label: 'Fitness', color: '#22c55e' },
    { max: 32, label: 'Average', color: '#f59e0b' },
    { max: Infinity, label: 'Obese', color: '#f43f5e' },
  ],
};

/** Ideal body weight (kg) by four classic formulas, designed for heights over 5 ft (152.4 cm). */
export function idealWeights({ sex, cm }) {
  if (!(cm > 0)) return null;
  const over = Math.max(cm / CM_PER_IN - 60, 0);
  const f = sex === 'female';
  return [
    { name: 'Robinson (1983)', kg: f ? 49 + 1.7 * over : 52 + 1.9 * over },
    { name: 'Miller (1983)', kg: f ? 53.1 + 1.36 * over : 56.2 + 1.41 * over },
    { name: 'Devine (1974)', kg: f ? 45.5 + 2.3 * over : 50 + 2.3 * over },
    { name: 'Hamwi (1964)', kg: f ? 45.5 + 2.2 * over : 48 + 2.7 * over },
  ];
}

/** Walking paces with MET values from the Compendium of Physical Activities. */
export const WALKING_PACES = [
  { value: 'slow', label: 'Easy stroll', kmh: 3.2, met: 2.8 },
  { value: 'moderate', label: 'Normal walk', kmh: 4.8, met: 3.5 },
  { value: 'brisk', label: 'Brisk walk', kmh: 6.4, met: 5.0 },
];

export function stepsToCalories({ steps, cm, kg, pace = 'moderate' }) {
  if (!(steps > 0) || !(cm > 0) || !(kg > 0)) return null;
  const p = WALKING_PACES.find((x) => x.value === pace) ?? WALKING_PACES[1];
  const strideM = (cm * 0.414) / 100;
  const km = (steps * strideM) / 1000;
  const hours = km / p.kmh;
  return { km, minutes: hours * 60, kcal: p.met * kg * hours, strideM };
}
