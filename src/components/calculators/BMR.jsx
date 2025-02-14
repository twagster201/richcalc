import React, { useState } from 'react';
import { Button } from '../ui/button';

const BMR = () => {
    const [unitSystem, setUnitSystem] = useState('metric');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [metricHeight, setMetricHeight] = useState('');
    const [metricWeight, setMetricWeight] = useState('');
    const [usFeet, setUsFeet] = useState('');
    const [usInches, setUsInches] = useState('');
    const [usWeight, setUsWeight] = useState('');

    const computeBMR = () => {
        const a = parseFloat(age);
        if (!a || a <= 0) return 0;
        let cm = 0, kg = 0;
        if (unitSystem === 'metric') {
            cm = parseFloat(metricHeight);
            kg = parseFloat(metricWeight);
            if (!cm || !kg || cm <= 0 || kg <= 0) return 0;
        } else {
            const ft = parseFloat(usFeet);
            const inch = parseFloat(usInches);
            const w = parseFloat(usWeight);
            if ((!ft && ft !== 0) || (!inch && inch !== 0) || !w) return 0;
            const totalInches = ft * 12 + inch;
            if (totalInches <= 0) return 0;
            cm = totalInches * 2.54;
            kg = w * 0.45359237;
        }
        let bmr = 10 * kg + 6.25 * cm - 5 * a;
        if (gender.toLowerCase() === 'male') {
            bmr += 5;
        } else if (gender.toLowerCase() === 'female') {
            bmr -= 161;
        }
        return Math.max(bmr, 0);
    };

    const bmrValue = computeBMR();

    return (
        <div>
            <h2 className="font-semibold text-xl mb-2">BMR Calculator</h2>
<p className="text-sm text-gray-600 mb-4">
   This calculator estimates the growth of your investments over time using
   compound interest. Simply input your initial amount, periodic contributions,
   and interest rate to see how much your savings can grow.
</p>            
<div className="flex items-center gap-2 mb-4">
                <Button variant={unitSystem === 'metric' ? 'default' : 'secondary'} onClick={() => setUnitSystem('metric')}>
                    Metric
                </Button>
                <Button variant={unitSystem === 'us' ? 'default' : 'secondary'} onClick={() => setUnitSystem('us')}>
                    US Units
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full border rounded p-2" />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded p-2">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                {unitSystem === 'metric' ? (
                    <>
                        <div>
                            <label className="block mb-1 font-medium">Height (cm)</label>
                            <input type="number" value={metricHeight} onChange={(e) => setMetricHeight(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Weight (kg)</label>
                            <input type="number" value={metricWeight} onChange={(e) => setMetricWeight(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block mb-1 font-medium">Height (ft)</label>
                            <input type="number" value={usFeet} onChange={(e) => setUsFeet(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Height (in)</label>
                            <input type="number" value={usInches} onChange={(e) => setUsInches(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Weight (lbs)</label>
                            <input type="number" value={usWeight} onChange={(e) => setUsWeight(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                    </>
                )}
            </div>
            <div className="bg-white p-4 rounded shadow mt-4">
                {bmrValue > 0 ? (
                    <p className="text-lg font-semibold">Your BMR: {bmrValue.toFixed(2)} kcal/day</p>
                ) : (
                    <p className="text-gray-600">Please enter valid details to calculate BMR.</p>
                )}
            </div>
        </div>
    );
};

export default BMR;
