import { lazy } from 'react';

// Each calculator is its own chunk, so a visitor only downloads the one they open.
export const CALCULATOR_COMPONENTS = {
  mortgage: lazy(() => import('./money/Mortgage.jsx')),
  loan: lazy(() => import('./money/Loan.jsx')),
  'car-loan': lazy(() => import('./money/CarLoan.jsx')),
  'compound-interest': lazy(() => import('./money/CompoundInterest.jsx')),
  'savings-goal': lazy(() => import('./money/SavingsGoal.jsx')),
  retirement: lazy(() => import('./money/Retirement.jsx')),
  inflation: lazy(() => import('./money/Inflation.jsx')),
  bmi: lazy(() => import('./health/BMI.jsx')),
  calories: lazy(() => import('./health/Calories.jsx')),
  bmr: lazy(() => import('./health/BMR.jsx')),
  'body-fat': lazy(() => import('./health/BodyFat.jsx')),
  'ideal-weight': lazy(() => import('./health/IdealWeight.jsx')),
  'steps-to-calories': lazy(() => import('./health/StepsToCalories.jsx')),
  percentage: lazy(() => import('./everyday/Percentage.jsx')),
  tip: lazy(() => import('./everyday/Tip.jsx')),
  discount: lazy(() => import('./everyday/Discount.jsx')),
  age: lazy(() => import('./everyday/Age.jsx')),
};
