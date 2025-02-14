import React, { useState } from 'react';
import { Button } from '../ui/button';

/**
 * This component estimates body fat percentage using
 * the U.S. Navy Body Fat Formula:
 *
 * For men:
 *    BF% = 495 / (1.0324 - 0.19077 * log10(waist - neck)
 *                 + 0.15456 * log10(height)) - 450
 *
 * For women:
 *    BF% = 495 / (1.29579 - 0.35004 * log10(waist - neck)
 *                 + 0.22100 * log10(height)) - 450
 *
 * Note: The typical Navy formula includes hip measurement for women,
 * but for demonstration we'll omit it to match your specification.
 * This may reduce accuracy for female calculations.
 */
const BodyFat = () => {
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [weight, setWeight] = useState(''); // Even though formula doesn't directly use weight, user wants to enter it.

  // A helper to safely do log10
  const log10 = (val) => Math.log10(val);

  const computeBodyFat = () => {
    const g = gender.toLowerCase();
    const a = parseFloat(age);
    const h = parseFloat(height);
    const n = parseFloat(neck);
    const w = parseFloat(waist);

    // Basic validation
    if (!g || !a || a <= 0 || !h || h <= 0 || !n || n <= 0 || !w || w <= 0) {
      return 0;
    }

    let bf = 0;
    if (g === 'male') {
      // Men’s US Navy formula
      bf = 495 / (1.0324 - 0.19077 * log10(w - n) + 0.15456 * log10(h)) - 450;
    } else if (g === 'female') {
      // Women’s US Navy formula (omitting hip for simplicity)
      bf = 495 / (1.29579 - 0.35004 * log10(w - n) + 0.22100 * log10(h)) - 450;
    } else {
      // If user doesn't pick male/female, just return 0
      return 0;
    }

    // Ensure it doesn't go negative if the logs create an invalid scenario
    return Math.max(bf, 0);
  };

  const bodyFat = computeBodyFat();

  // Classify body fat into categories (men vs women).
  // These are typical general guidelines:
  //   Men:
  //     <2% => Below essential
  //     2-5% => Essential
  //     6-13% => Athletes
  //     14-17% => Fitness
  //     18-24% => Average
  //     25+% => Obese
  //
  //   Women:
  //     <10% => Below essential
  //     10-13% => Essential
  //     14-20% => Athletes
  //     21-24% => Fitness
  //     25-31% => Average
  //     32+% => Obese

  let category = '';
  if (bodyFat > 0) {
    if (gender.toLowerCase() === 'male') {
      if (bodyFat < 2) category = 'Below Essential';
      else if (bodyFat <= 5) category = 'Essential';
      else if (bodyFat <= 13) category = 'Athletes';
      else if (bodyFat <= 17) category = 'Fitness';
      else if (bodyFat <= 24) category = 'Average';
      else category = 'Obese';
    } else if (gender.toLowerCase() === 'female') {
      if (bodyFat < 10) category = 'Below Essential';
      else if (bodyFat <= 13) category = 'Essential';
      else if (bodyFat <= 20) category = 'Athletes';
      else if (bodyFat <= 24) category = 'Fitness';
      else if (bodyFat <= 31) category = 'Average';
      else category = 'Obese';
    }
  }

  // For a visual bar (similar to BMI), let's define approximate maximum range.
  // We can clamp the bar's width to 40% as "Obese" cutoff for men is 25% and for women is 32%,
  // but let's just do a simpler approach. We'll define a maximum bar if BF > 40.
  const barPercentage = Math.min(bodyFat, 40); 
  // This will be a value between 0 and 40, so we can do (barPercentage / 40 * 100)% for bar width.
  const barWidth = (barPercentage / 40) * 100;

  return (
    <div>
      <h2 className="font-semibold text-xl mb-2">Body Fat Calculator</h2>
      <p className="text-sm text-gray-600 mb-4">
        Estimate your total body fat using the US Navy formula. This requires your gender, height,
        neck, and waist measurements. Note: results are only an estimate.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Gender</label>
          <select
            className="w-full border rounded p-2"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Age</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Height (cm)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Weight (kg)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Neck (cm)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Waist (cm)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {bodyFat > 0 ? (
          <>
            <p className="text-lg font-semibold mb-2">
              Estimated Body Fat: {bodyFat.toFixed(1)}%
              {category && ` (${category})`}
            </p>
            <div className="h-3 w-full bg-gray-200 rounded-full mb-4">
              <div
                className="h-3 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${barWidth}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">
              (Values above 40% are clamped on this chart for illustration.)
            </p>
          </>
        ) : (
          <p className="text-gray-600">
            Please enter valid measurements to calculate your Body Fat %.
          </p>
        )}
      </div>
    </div>
  );
};

export default BodyFat;
