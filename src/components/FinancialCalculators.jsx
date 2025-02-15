import React, { useState } from 'react';
import { Button } from './ui/button';
import Mortgage from './calculators/Mortgage';
import CompoundInterest from './calculators/CompoundInterest';
import PaymentCalculator from './calculators/PaymentCalculator';

/**
 * Props:
 *  onBackToMain: () => void
 */
export default function FinancialCalculators({ onBackToMain }) {
    /**
     * selectedCalc: which specific calculator is active.
     *  '' => Show the card grid [Mortgage, Compound Interest, Payment Calculator]
     *  'mortgage' => Show <Mortgage />
     *  'interest' => Show <CompoundInterest />
     *  'payment' => Show <PaymentCalculator />
     */
    const [selectedCalc, setSelectedCalc] = useState('');

    function renderCalculator() {
        if (selectedCalc === 'mortgage') return <Mortgage />;
        if (selectedCalc === 'interest') return <CompoundInterest />;
        if (selectedCalc === 'payment') return <PaymentCalculator />;
        return null;
    }

    // Single "Back" button logic
    const handleBack = () => {
        if (selectedCalc) {
            // If a specific calculator is active, go back to the card grid
            setSelectedCalc('');
        } else {
            // If we're already on the card grid, go back to main
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
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Mortgage card */}
                    <div
                        onClick={() => setSelectedCalc('mortgage')}
                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                    >
                        <h3 className="text-lg font-semibold mb-2">Mortgage Calculator</h3>
                        <p className="text-sm text-gray-600">
                            Estimate monthly payments, interest, and payoff date for a home loan.
                        </p>
                    </div>

                    {/* Compound Interest card */}
                    <div
                        onClick={() => setSelectedCalc('interest')}
                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                    >
                        <h3 className="text-lg font-semibold mb-2">Compound Interest</h3>
                        <p className="text-sm text-gray-600">
                            Project investment growth with compound interest over time.
                        </p>
                    </div>

                    {/* Payment Calculator card */}
                    <div
                        onClick={() => setSelectedCalc('payment')}
                        className="cursor-pointer bg-gray-100 hover:bg-sky-100 transition
                               text-gray-800 rounded-lg shadow-lg transition-shadow p-6 hover:shadow-xl"
                    >
                        <h3 className="text-lg font-semibold mb-2">Payment Calculator</h3>
                        <p className="text-sm text-gray-600">
                            Calculate monthly payments or time to pay off a fixed interest loan.
                        </p>
                    </div>
                </div>
            )}

            {selectedCalc !== '' && (
                <div className="mt-4">{renderCalculator()}</div>
            )}
        </div>
    );
}
