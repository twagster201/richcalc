import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import HealthCalculators from './HealthCalculators';
import FinancialCalculators from './FinancialCalculators';

const MultiCalculatorApp = () => {
  const [activeGroup, setActiveGroup] = useState('health'); // 'health' or 'financial'

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-100 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Card className="max-w-3xl w-full shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Multi-Calculator</h1>
 <p className="text-sm text-gray-600 mb-6">
   Welcome to the Multi-Calculator App! Choose either Health or Financial
   to explore a variety of calculators, all in one place.
 </p>          
<div className="flex gap-4 mb-6">
            <Button
  variant="nav" // use your new nav variant
  onClick={() => setActiveGroup('health')}
  className={activeGroup === 'health' ? 'opacity-100' : 'opacity-70'}
>
  Health
</Button>
<Button
  variant="nav"
  onClick={() => setActiveGroup('financial')}
  className={activeGroup === 'financial' ? 'opacity-100' : 'opacity-70'}
>
  Financial
</Button>
          </div>
          {activeGroup === 'health' ? <HealthCalculators /> : <FinancialCalculators />}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MultiCalculatorApp;
