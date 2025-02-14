import React, { useState } from 'react';
import { Button } from '../ui/button';
import { addMonthsToDate } from '../../helpers/dateHelpers';
import { formatCurrency } from '../../helpers/currency';

const Mortgage = () => {
    const [housePrice, setHousePrice] = useState('');
    const [downPaymentType, setDownPaymentType] = useState('percentage');
    const [downPaymentValue, setDownPaymentValue] = useState('');
    const [loanTermYears, setLoanTermYears] = useState('');
    const [interestRate, setInterestRate] = useState('');
    const [startDate, setStartDate] = useState('');

    const calculateMortgage = () => {
        const price = parseFloat(housePrice);
        const dpValue = parseFloat(downPaymentValue);
        const rate = parseFloat(interestRate);
        const years = parseFloat(loanTermYears);

        if (!price || price <= 0 || !dpValue || dpValue < 0 || !rate || rate < 0 || !years || years <= 0) {
            return {
                principal: 0,
                dpAmount: 0,
                monthlyPayment: 0,
                totalPayments: 0,
                totalInterest: 0,
                payoffDate: null,
            };
        }

        let downPayment = downPaymentType === 'percentage' ? price * (dpValue / 100) : dpValue;
        if (downPayment >= price) {
            return {
                principal: 0,
                dpAmount: price,
                monthlyPayment: 0,
                totalPayments: 0,
                totalInterest: 0,
                payoffDate: null,
            };
        }

        const principal = price - downPayment;
        const monthlyInterestRate = rate / 100 / 12;
        const totalMonths = years * 12;
        let monthlyPayment =
            monthlyInterestRate > 0
                ? principal * ((monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1))
                : principal / totalMonths;
        const totalPayments = monthlyPayment * totalMonths;
        const totalInterest = totalPayments - principal;
        const payoffDateObj = addMonthsToDate(startDate, totalMonths);

        return {
            principal,
            dpAmount: downPayment,
            monthlyPayment,
            totalPayments,
            totalInterest,
            payoffDate: payoffDateObj,
        };
    };

    const { principal, dpAmount, monthlyPayment, totalPayments, totalInterest, payoffDate } = calculateMortgage();
    const payoffDateStr = payoffDate ? payoffDate.toLocaleDateString() : 'N/A';

    return (
        <div>
            <h2 className="font-semibold text-xl mb-2">Mortgage Calculator</h2>
<p className="text-sm text-gray-600 mb-4">
  A mortgage calculator helps you estimate monthly payments, total interest,
  and payoff date based on home price, down payment, loan term, and interest rate.
 </p>            
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">House Price</label>
                    <input type="number" value={housePrice} onChange={(e) => setHousePrice(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Down Payment Type</label>
                    <select value={downPaymentType} onChange={(e) => setDownPaymentType(e.target.value)} className="w-full border rounded p-2">
                        <option value="percentage">Percentage</option>
                        <option value="amount">Amount</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">{downPaymentType === 'percentage' ? 'Down Payment (%)' : 'Down Payment (Amount)'}</label>
                    <input type="number" value={downPaymentValue} onChange={(e) => setDownPaymentValue(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Loan Term (years)</label>
                    <input type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Interest Rate (%)</label>
                    <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded p-2" />
                </div>
            </div>
            <div className="bg-white p-4 rounded shadow mt-4">
                {principal > 0 ? (
                    <>
                        <p className="text-lg font-semibold mb-2">Mortgage Results</p>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="pr-4">Loan Amount:</td>
                                    <td className="font-medium">${formatCurrency(principal)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Down Payment:</td>
                                    <td className="font-medium">${formatCurrency(dpAmount)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Monthly Payment:</td>
                                    <td className="font-medium">${formatCurrency(monthlyPayment)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Total Payments:</td>
                                    <td className="font-medium">${formatCurrency(totalPayments)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Total Interest:</td>
                                    <td className="font-medium">${formatCurrency(totalInterest)}</td>
                                </tr>
                                <tr>
                                    <td className="pr-4">Payoff Date:</td>
                                    <td className="font-medium">{payoffDateStr}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className="text-gray-600">Enter valid details to calculate mortgage.</p>
                )}
            </div>
        </div>
    );
};

export default Mortgage;
