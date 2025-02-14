import React, { useState } from 'react';
import { Button } from '../ui/button';
import { formatCurrency } from '../../helpers/currency';

const CompoundInterest = () => {
    const [initialInvestment, setInitialInvestment] = useState('');
    const [annualContribution, setAnnualContribution] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [compoundInterestRate, setCompoundInterestRate] = useState('');
    const [compoundingFrequency, setCompoundingFrequency] = useState('annually');
    const [investmentYears, setInvestmentYears] = useState('');

    const calculateCompoundInterest = () => {
        const initial = parseFloat(initialInvestment) || 0;
        const ann = parseFloat(annualContribution) || 0;
        const mon = parseFloat(monthlyContribution) || 0;
        const rate = parseFloat(compoundInterestRate) || 0;
        const yrs = parseFloat(investmentYears) || 0;

        if (yrs <= 0 || rate < 0) {
            return {
                finalBalance: 0,
                totalContributions: 0,
                totalInterest: 0,
            };
        }

        let principal = initial;
        let totalContribution = initial;
        const monthlyRate = rate / 100 / 12;

        for (let year = 1; year <= yrs; year++) {
            for (let m = 1; m <= 12; m++) {
                principal += mon;
                totalContribution += mon;
                if (compoundingFrequency === 'monthly') {
                    principal *= 1 + monthlyRate;
                }
            }
            principal += ann;
            totalContribution += ann;
            if (compoundingFrequency === 'annually') {
                principal *= 1 + rate / 100;
            }
        }

        const totalInterest = principal - totalContribution;
        return {
            finalBalance: principal,
            totalContributions: totalContribution,
            totalInterest,
        };
    };

    const { finalBalance, totalContributions, totalInterest } = calculateCompoundInterest();

    return (
        <div>
            <h2 className="font-semibold text-xl mb-2">Compound Interest Calculator</h2>
<p className="text-sm text-gray-600 mb-4">
   This calculator estimates the growth of your investments over time using
   compound interest. Simply input your initial amount, periodic contributions,
   and interest rate to see how much your savings can grow.
 </p>           
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Initial Investment</label>
                    <input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Annual Contribution</label>
                    <input type="number" value={annualContribution} onChange={(e) => setAnnualContribution(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Monthly Contribution</label>
                    <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Interest Rate (%)</label>
                    <input type="number" value={compoundInterestRate} onChange={(e) => setCompoundInterestRate(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Compounding Frequency</label>
                    <select value={compoundingFrequency} onChange={(e) => setCompoundingFrequency(e.target.value)} className="w-full border rounded p-2">
                        <option value="annually">Annually</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Investment Duration (years)</label>
                    <input type="number" value={investmentYears} onChange={(e) => setInvestmentYears(e.target.value)} className="w-full border rounded p-2" />
                </div>
            </div>
            <div className="bg-white p-4 rounded shadow mt-4">
                {finalBalance > 0 ? (
                    <>
                        <p className="text-lg font-semibold mb-2">Compound Interest Results</p>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="pr-4">Final Balance:</td>
                                    <td className="font-medium">${formatCurrency(finalBalance)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Total Contributions:</td>
                                    <td className="font-medium">${formatCurrency(totalContributions)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Total Interest Earned:</td>
                                    <td className="font-medium">${formatCurrency(totalInterest)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className="text-gray-600">Enter valid details to calculate compound interest.</p>
                )}
            </div>
        </div>
    );
};

export default CompoundInterest;
