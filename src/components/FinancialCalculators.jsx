import React, { useState } from 'react';
import { Button } from './ui/button';
import Mortgage from './calculators/Mortgage';
import CompoundInterest from './calculators/CompoundInterest';

const FinancialCalculators = () => {
  const [activeCalc, setActiveCalc] = useState('mortgage'); // 'mortgage' or 'interest'

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <Button variant={activeCalc === 'mortgage' ? 'default' : 'secondary'} onClick={() => setActiveCalc('mortgage')}>
          Mortgage Calculator
        </Button>
        <Button variant={activeCalc === 'interest' ? 'default' : 'secondary'} onClick={() => setActiveCalc('interest')}>
          Compound Interest
        </Button>
      </div>
      {activeCalc === 'mortgage' ? <Mortgage /> : <CompoundInterest />}
    </div>
  );
};

export default FinancialCalculators;
