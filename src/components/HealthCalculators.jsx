import React, { useState } from 'react';
import { Button } from './ui/button';
import BMI from './calculators/BMI';
import BMR from './calculators/BMR';
import BodyFat from './calculators/BodyFat';

/**
 * Props:
 *  onBackToMain: () => void
 *    Goes back to the top-level screen
 */
export default function HealthCalculators({ onBackToMain }) {
    /**
     * selectedCalc: which specific calculator is active.
     *  '' => Show a card grid of [BMI, BMR, BodyFat]
     *  'bmi' => Show <BMI />
     *  'bmr' => Show <BMR />
     *  'bodyFat' => Show <BodyFat />
     */
    const [selectedCalc, setSelectedCalc] = useState('');

    // Render the chosen calculator
    function renderCalculator() {
        if (selectedCalc === 'bmi') return <BMI />;
        if (selectedCalc === 'bmr') return <BMR />;
        if (selectedCalc === 'bodyFat') return <BodyFat />;
        return null;
    }

    // Decide what the "Back" button does:
    // 1. If user is inside a calculator, going "Back" returns to the card grid.
    // 2. If user is on the card grid, going "Back" returns to Main.
    const handleBack = () => {
        if (selectedCalc) {
            setSelectedCalc(''); // Go to sub-category card grid
        } else {
            onBackToMain(); // Go to top-level
        }
    };

    return (
        <div>
            {/* Single Back button at the top */}
            <div className="mb-4">
                <Button variant="secondary" onClick={handleBack}>
                    &larr; Back
                </Button>
            </div>

            {selectedCalc === '' && (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* BMI card */}
                    <div
                        onClick={() => setSelectedCalc('bmi')}
                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                    >
                        <h3 className="text-lg font-semibold mb-2">BMI Calculator</h3>
                        <p className="text-sm text-gray-600">
                            Estimate body mass index using height and weight.
                        </p>
                    </div>

                    {/* BMR card */}
                    <div
                        onClick={() => setSelectedCalc('bmr')}
                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                    >
                        <h3 className="text-lg font-semibold mb-2">BMR Calculator</h3>
                        <p className="text-sm text-gray-600">
                            Calculate your basal metabolic rate (calories at rest).
                        </p>
                    </div>

                    {/* Body Fat card */}
                    <div
                        onClick={() => setSelectedCalc('bodyFat')}
                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                    >
                        <h3 className="text-lg font-semibold mb-2">Body Fat Calculator</h3>
                        <p className="text-sm text-gray-600">
                            Estimate total body fat using the U.S. Navy formula.
                        </p>
                    </div>
                </div>
            )}

            {selectedCalc !== '' && (
                <div className="mt-4">
                    {/* Show the selected calculator */}
                    {renderCalculator()}
                </div>
            )}
        </div>
    );
}
