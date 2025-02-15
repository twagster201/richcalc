import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import HealthCalculators from './HealthCalculators';
import FinancialCalculators from './FinancialCalculators';
export default function MultiCalculatorApp() {
    /**
     * activeGroup can be:
     * '' (empty string) => Show top-level card grid (Health / Financial)
     * 'health' => Show HealthCalculators
     * 'financial' => Show FinancialCalculators
     */
    const [activeGroup, setActiveGroup] = useState('');

    return (
        <motion.div
            className="flex items-center justify-center min-h-screen bg-gray-100 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Card className="max-w-4xl w-full shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8">
                    <h1 className="text-2xl font-bold mb-3">PlentiCalc</h1>
                    <p className="text-sm text-gray-600 mb-6">
                        Welcome to PlentiCalc! Choose either Health or Financial
                        to explore a variety of calculators, all in one place.
                    </p>

                    {/* If no group is selected, show the main 2-card grid. */}
                    {activeGroup === '' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div
                                onClick={() => setActiveGroup('health')}
                                className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow p-6"
                            >
                                <h2 className="text-xl font-semibold mb-2">Health Calculators</h2>
                                <p className="text-sm text-gray-600">
                                    Access BMI, BMR, and Body Fat calculators to track and estimate your health metrics.
                                </p>
                            </div>
                            <div
                                onClick={() => setActiveGroup('financial')}
                                className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow p-6"
                            >
                                <h2 className="text-xl font-semibold mb-2">Financial Calculators</h2>
                                <p className="text-sm text-gray-600">
                                    Estimate mortgage payments or project your investment growth with compound interest.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* If a group is selected, render its sub-calculators. 
              Pass down a function to go back to the main screen. */}
                    {activeGroup === 'health' && (
                        <HealthCalculators onBackToMain={() => setActiveGroup('')} />
                    )}
                    {activeGroup === 'financial' && (
                        <FinancialCalculators onBackToMain={() => setActiveGroup('')} />
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
