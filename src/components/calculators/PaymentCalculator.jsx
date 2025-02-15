import React, { useState } from 'react';

/**
 * Payment Calculator can determine either:
 * 1) Monthly payment for a fixed-term loan ("Fixed Term" tab).
 * 2) Time to pay off a loan with a fixed monthly payment ("Fixed Payments" tab).
 */
export default function PaymentCalculator() {
  // mode can be 'term' (Fixed Term) or 'payment' (Fixed Payments)
  const [mode, setMode] = useState('term');

  // --- Fixed Term states ---
  const [loanAmountFT, setLoanAmountFT] = useState('');
  const [loanTermYears, setLoanTermYears] = useState('');
  const [interestRateFT, setInterestRateFT] = useState('');

  // --- Fixed Payment states ---
  const [loanAmountFP, setLoanAmountFP] = useState('');
  const [monthlyPayFP, setMonthlyPayFP] = useState('');
  const [interestRateFP, setInterestRateFP] = useState('');

  // Helper: parse or default to 0
  const toNum = (val) => parseFloat(val) || 0;

  // ----------------------------------------------------
  // 1) FIXED TERM: Calculate monthly payment from a set term
  // ----------------------------------------------------
  const calculateFixedTerm = () => {
    const principal = toNum(loanAmountFT);
    const years = toNum(loanTermYears);
    const annualRate = toNum(interestRateFT);
    if (principal <= 0 || years <= 0 || annualRate < 0) {
      return { monthlyPayment: 0, totalPayments: 0, totalInterest: 0 };
    }

    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else {
      // zero interest case
      monthlyPayment = principal / totalMonths;
    }

    const totalPayments = monthlyPayment * totalMonths;
    const totalInterest = totalPayments - principal;
    return { monthlyPayment, totalPayments, totalInterest };
  };

  const { monthlyPayment: ftMonthly, totalPayments: ftTotal, totalInterest: ftInterest } = calculateFixedTerm();

  // ----------------------------------------------------
  // 2) FIXED PAYMENTS: Calculate time to pay off a loan with fixed monthly payment
  // ----------------------------------------------------
  const calculateFixedPayments = () => {
    const principal = toNum(loanAmountFP);
    const monthlyPay = toNum(monthlyPayFP);
    const annualRate = toNum(interestRateFP);

    if (principal <= 0 || monthlyPay <= 0 || annualRate < 0) {
      return { payoffMonths: 0, totalPayments: 0, totalInterest: 0 };
    }

    const monthlyRate = annualRate / 100 / 12;
    // if monthly payment not enough to cover even interest, it never pays off
    if (monthlyRate > 0 && monthlyPay <= principal * monthlyRate) {
      return { payoffMonths: Infinity, totalPayments: Infinity, totalInterest: Infinity };
    }

    let payoffMonths = 0;
    if (monthlyRate === 0) {
      // No interest => time = principal / monthlyPay
      payoffMonths = principal / monthlyPay;
    } else {
      // Formula for # of payments:
      // n = log( M / (M - rP) ) / log(1 + r)
      // where:
      // M = monthlyPay, r = monthlyRate, P = principal
      payoffMonths =
        Math.log(monthlyPay / (monthlyPay - principal * monthlyRate)) /
        Math.log(1 + monthlyRate);
    }

    const totalPayments = monthlyPay * payoffMonths;
    const totalInterest = totalPayments - principal;
    return { payoffMonths, totalPayments, totalInterest };
  };

  const { payoffMonths: fpMonths, totalPayments: fpTotal, totalInterest: fpInterest } = calculateFixedPayments();

  // Convert months to years+months for display
  const fpWholeMonths = Math.ceil(fpMonths);
  const fpYrs = Math.floor(fpWholeMonths / 12);
  const fpRemainingM = fpWholeMonths % 12;

  // A small helper to format numbers with 2 decimals and commas
  const fmt = (val) =>
    val === Infinity
      ? '∞'
      : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <h2 className="font-semibold text-xl mb-2">Payment Calculator</h2>
      <p className="text-sm text-gray-600 mb-4">
        Determine monthly payment for a fixed-term loan, or how long it takes
        to pay off a loan with a fixed monthly payment.
      </p>

      {/* Mode switch buttons */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded 
            ${mode === 'term' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          onClick={() => setMode('term')}
        >
          Fixed Term
        </button>
        <button
          className={`px-4 py-2 rounded 
            ${mode === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
          onClick={() => setMode('payment')}
        >
          Fixed Payments
        </button>
      </div>

      {/* FORM: FIXED TERM */}
      {mode === 'term' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium">Loan Amount</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={loanAmountFT}
                onChange={(e) => setLoanAmountFT(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Loan Term (years)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Interest Rate (%)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={interestRateFT}
                onChange={(e) => setInterestRateFT(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            {ftMonthly > 0 ? (
              <table className="w-full table-auto text-sm">
                <tbody>
                  <tr>
                    <td className="pr-4">Monthly Payment:</td>
                    <td className="font-medium">${fmt(ftMonthly)}</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Total of Payments:</td>
                    <td className="font-medium">${fmt(ftTotal)}</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Total Interest:</td>
                    <td className="font-medium">${fmt(ftInterest)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">Enter valid details to calculate.</p>
            )}
          </div>
        </div>
      )}

      {/* FORM: FIXED PAYMENTS */}
      {mode === 'payment' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block mb-1 font-medium">Loan Amount</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={loanAmountFP}
                onChange={(e) => setLoanAmountFP(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Monthly Payment</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={monthlyPayFP}
                onChange={(e) => setMonthlyPayFP(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Interest Rate (%)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={interestRateFP}
                onChange={(e) => setInterestRateFP(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            {fpMonths > 0 && fpMonths !== Infinity ? (
              <table className="w-full table-auto text-sm">
                <tbody>
                  <tr>
                    <td className="pr-4">Payoff Time:</td>
                    <td className="font-medium">
                      {fpYrs} years {fpRemainingM} months
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-4">Total of Payments:</td>
                    <td className="font-medium">${fmt(fpTotal)}</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Total Interest:</td>
                    <td className="font-medium">${fmt(fpInterest)}</td>
                  </tr>
                </tbody>
              </table>
            ) : fpMonths === Infinity ? (
              <p className="text-red-500">Monthly payment too small; loan never ends!</p>
            ) : (
              <p className="text-gray-600">Enter valid details to calculate.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
