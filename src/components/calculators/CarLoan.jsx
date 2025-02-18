import React, { useState } from 'react';
import { addMonthsToDate } from '../../helpers/dateHelpers';  // adjust path as needed
import { formatCurrency } from '../../helpers/currency';       // adjust path as needed

/**
 * CarLoan Calculator
 * 
 * Inputs:
 *  - carValue (required)
 *  - interestRate (required)
 *  - termYears & termMonths (required, can be 0 for months or vice versa)
 *  - initialDeposit (optional)
 *  - finalPayment (optional, acts like a balloon payment)
 *  - startDate (optional)
 * 
 * Outputs:
 *  - monthlyPayment
 *  - totalPayments
 *  - totalInterest
 *  - payoffDate
 */
export default function CarLoan() {
    const [carValue, setCarValue] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [termYears, setTermYears] = useState('');
    const [termMonths, setTermMonths] = useState('');
    const [initialDeposit, setInitialDeposit] = useState('');
    const [finalPayment, setFinalPayment] = useState('');
    const [startDate, setStartDate] = useState('');

    // Convert inputs to numbers (or 0 if empty)
    const principalValue = parseFloat(carValue) || 0;
    const depositValue = parseFloat(initialDeposit) || 0;
    const balloon = parseFloat(finalPayment) || 0;
    const rate = parseFloat(interestRate) || 0;
    const years = parseFloat(termYears) || 0;
    const months = parseFloat(termMonths) || 0;

    // Core calculations
    const netPrincipal = principalValue - depositValue;
    const totalMonths = years * 12 + months;
    const monthlyRate = rate > 0 ? (rate / 100) / 12 : 0;

    // If netPrincipal <= 0 or totalMonths <= 0, we can't do a meaningful calc
    // Also interestRate can be 0 for no interest scenario
    function calculateCarLoan() {
        if (netPrincipal <= 0 || totalMonths <= 0 || rate < 0) {
            return {
                monthlyPayment: 0,
                totalPayments: 0,
                totalInterest: 0,
                payoffDate: null,
            };
        }

        // If balloon > 0, we treat the finalPayment as a "balloon" at month n.
        // Formula for monthly payment with balloon:
        // Payment = ( r / (1 - (1 + r)^(-n)) ) * (P - B / ((1 + r)^n))
        // Where:
        //  r = monthlyRate
        //  n = totalMonths
        //  P = netPrincipal
        //  B = balloon
        // If balloon = 0, it simplifies to standard amortization formula.

        let monthlyPayment = 0;
        if (monthlyRate === 0) {
            // No interest scenario
            // If there's a balloon, subtract it first?
            // Payment = (P - balloon) / n
            monthlyPayment = (netPrincipal - balloon) / totalMonths;
        } else {
            monthlyPayment =
                (monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalMonths))) *
                (netPrincipal - balloon / Math.pow(1 + monthlyRate, totalMonths));
        }

        // If finalPayment is more than netPrincipal, handle edge case
        if (balloon >= netPrincipal) {
            // Then effectively monthlyPayment just amortizes 0. 
            // We'll handle it gracefully:
            monthlyPayment = 0;
        }

        // Calculate totalPayments
        // total regular installments + balloon
        const totalRegular = monthlyPayment * totalMonths;
        const totalPayments = totalRegular + balloon;
        const totalInterest = totalPayments - netPrincipal;

        // payoffDate
        let payoffDateObj = null;
        if (startDate && totalMonths > 0) {
            payoffDateObj = addMonthsToDate(startDate, totalMonths);
        }

        return {
            monthlyPayment,
            totalPayments,
            totalInterest,
            payoffDate: payoffDateObj,
        };
    }

    const { monthlyPayment, totalPayments, totalInterest, payoffDate } = calculateCarLoan();
    const payoffDateStr = payoffDate
        ? payoffDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : null;

    return (
        <div>
            <h2 className="font-semibold text-xl mb-2">Car Loan Calculator</h2>
            <p className="text-sm text-gray-600 mb-4">
                Estimate monthly payments for a car loan with optional deposit and balloon payment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Car Value</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={carValue}
                        onChange={(e) => setCarValue(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Interest Rate (%)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Term (Years)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={termYears}
                        onChange={(e) => setTermYears(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Term (Months)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={termMonths}
                        onChange={(e) => setTermMonths(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Initial Deposit (optional)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={initialDeposit}
                        onChange={(e) => setInitialDeposit(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Final Payment (optional)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={finalPayment}
                        onChange={(e) => setFinalPayment(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block mb-1 font-medium">Car Loan Start Date (optional)</label>
                    <input
                        type="date"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow mt-4">
                {monthlyPayment > 0 ? (
                    <>
                        <table className="w-full table-auto text-sm">
                            <tbody>
                                <tr>
                                    <td className="pr-4">Monthly Payment:</td>
                                    <td className="font-medium text-right">${formatCurrency(monthlyPayment)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Total of Payments:</td>
                                    <td className="font-medium text-right">${formatCurrency(totalPayments)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Total Interest:</td>
                                    <td className="font-medium text-right">${formatCurrency(totalInterest)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Payoff Date:</td>
                                    <td className="font-medium text-right">
                                        {payoffDateStr || 'N/A'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className="text-gray-600">
                        Enter valid details to calculate your car loan payments.
                    </p>
                )}
            </div>
        </div>
    );
}
