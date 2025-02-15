import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import HealthCalculators from './HealthCalculators';
import FinancialCalculators from './FinancialCalculators';

export default function MultiCalculatorApp() {
    const [activeGroup, setActiveGroup] = useState('');

    return (
        <div className="flex flex-col min-h-screen">
            {/* Gradient background using built-in Tailwind classes */}
            <motion.main
                className="flex-grow flex items-center justify-center p-4 
                   bg-gradient-to-r from-slate-300 to-slate-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Slightly transparent or white card */}
                <div className="max-w-4xl w-full">
                    <div className="bg-white/80 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden">
                        <div className="p-6 md:p-8">
                            <h1 className="text-3xl font-bold mb-3 text-slate-900">
                                RichCalc
                            </h1>
                            <p className="text-sm text-slate-700 mb-6">
                                RichCalc is your one-stop destination for a suite of powerful, easy-to-use calculators designed to simplify both financial and health decisions.
                            </p>

                            {activeGroup === '' && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Health Card */}
                                    <div
                                        onClick={() => setActiveGroup('health')}
                                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                                    >
                                        <h2 className="text-xl font-semibold mb-2">
                                            Health Calculators
                                        </h2>
                                        <p className="text-sm">
                                            Access BMI, BMR, and Body Fat calculators to track
                                            and estimate your health metrics.
                                        </p>
                                    </div>
                                    {/* Financial Card */}
                                    <div
                                        onClick={() => setActiveGroup('financial')}
                                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                                    >
                                        <h2 className="text-xl font-semibold mb-2">
                                            Financial Calculators
                                        </h2>
                                        <p className="text-sm">
                                            Estimate mortgage payments, compound interest, or
                                            fixed-term loans.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeGroup === 'health' && (
                                <HealthCalculators onBackToMain={() => setActiveGroup('')} />
                            )}
                            {activeGroup === 'financial' && (
                                <FinancialCalculators onBackToMain={() => setActiveGroup('')} />
                            )}
                        </div>
                    </div>
                </div>
            </motion.main>

            <footer className="text-center text-xs text-slate-500 p-2 bg-white">
                &copy; 2025 RichCalc. This website does not collect or store any personal data and does not
                use cookies or tracking technologies.
            </footer>
        </div>
    );
}

