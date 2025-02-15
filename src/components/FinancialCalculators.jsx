import React, { useState } from 'react';
import { Button } from './ui/button';
import Mortgage from './calculators/Mortgage';
import CompoundInterest from './calculators/CompoundInterest';

/**
 * Props:
 *  onBackToMain: () => void
 */
export default function FinancialCalculators({ onBackToMain }) {
    /**
     * selectedCalc: which specific calculator is active.
     *  '' => Show card grid [Mortgage, Compound Interest]
     *  'mortgage' => Show <Mortgage />
     *  'interest' => Show <CompoundInterest />
     */
    const [selectedCalc, setSelectedCalc] = useState('');

    const renderCalculator = () => {
        if (selectedCalc === 'mortgage') return <Mortgage />;
        if (selectedCalc === 'interest') return <CompoundInterest />;
        return null;
    };

    // Similar single Back button logic
    const handleBack = () => {
        if (selectedCalc) {
            setSelectedCalc('');
        } else {
            onBackToMain();
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
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Mortgage card */}
                    <div
                        onClick={() => setSelectedCalc('mortgage')}
                        className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                        <h3 className="text-lg font-semibold mb-2">Mortgage Calculator</h3>
                        <p className="text-sm text-gray-600">
                            Estimate monthly payments, interest, and payoff date for a home loan.
                        </p>
                    </div>

                    {/* Compound Interest card */}
                    <div
                        onClick={() => setSelectedCalc('interest')}
                        className="cursor-pointer bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow p-6"
                    >
                        <h3 className="text-lg font-semibold mb-2">Compound Interest</h3>
                        <p className="text-sm text-gray-600">
                            Project investment growth with compound interest over time.
                        </p>
                    </div>
                </div>
            )}

            {selectedCalc !== '' && (
                <div className="mt-4">
                    {renderCalculator()}
                </div>
            )}
        </div>
    );
}
