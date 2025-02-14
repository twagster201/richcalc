import React, { useState } from 'react';
import { Button } from './ui/button';
import BMI from './calculators/BMI';
import BMR from './calculators/BMR';
import BodyFat from './calculators/BodyFat'; // <-- Import the new component

const HealthCalculators = () => {
  // Extend the possible states to 'bmi', 'bmr', or 'bodyFat'
  const [activeCalc, setActiveCalc] = useState('bmi');

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Button variant={activeCalc === 'bmi' ? 'default' : 'secondary'} onClick={() => setActiveCalc('bmi')}>
          BMI Calculator
        </Button>
        <Button variant={activeCalc === 'bmr' ? 'default' : 'secondary'} onClick={() => setActiveCalc('bmr')}>
          BMR Calculator
        </Button>
        <Button variant={activeCalc === 'bodyFat' ? 'default' : 'secondary'} onClick={() => setActiveCalc('bodyFat')}>
          Body Fat
        </Button>
      </div>

      {activeCalc === 'bmi' && <BMI />}
      {activeCalc === 'bmr' && <BMR />}
      {activeCalc === 'bodyFat' && <BodyFat />}
    </div>
  );
};

export default HealthCalculators;