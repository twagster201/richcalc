import React, { useState } from 'react';
import { Button } from '../ui/button';

const BMI = () => {
    const [unitSystem, setUnitSystem] = useState('metric');
    const [metricHeight, setMetricHeight] = useState('');
    const [metricWeight, setMetricWeight] = useState('');
    const [usFeet, setUsFeet] = useState('');
    const [usInches, setUsInches] = useState('');
    const [usWeight, setUsWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');

    const computeBMI = () => {
        if (unitSystem === 'metric') {
            const h = parseFloat(metricHeight);
            const w = parseFloat(metricWeight);
            if (!h || !w || h <= 0) return 0;
            const heightM = h / 100;
            return w / (heightM * heightM);
        } else {
            const ft = parseFloat(usFeet);
            const inch = parseFloat(usInches);
            const w = parseFloat(usWeight);
            if ((!ft && ft !== 0) || (!inch && inch !== 0) || !w) return 0;
            const totalInches = ft * 12 + inch;
            if (totalInches <= 0) return 0;
            return 703 * (w / (totalInches * totalInches));
        }
    };

    const bmi = computeBMI();

    let bmiCategory = '';
    if (bmi > 0) {
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi < 25) bmiCategory = 'Normal';
        else if (bmi < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';
    }

    const computeHealthyRange = () => {
        if (unitSystem === 'metric') {
            const h = parseFloat(metricHeight);
            if (!h || h <= 0) return { min: 0, max: 0 };
            const heightM = h / 100;
            return { min: 18.5 * (heightM * heightM), max: 24.9 * (heightM * heightM) };
        } else {
            const ft = parseFloat(usFeet);
            const inch = parseFloat(usInches);
            if ((!ft && ft !== 0) || (!inch && inch !== 0)) return { min: 0, max: 0 };
            const totalInches = ft * 12 + inch;
            if (totalInches <= 0) return { min: 0, max: 0 };
            return { min: (18.5 * totalInches * totalInches) / 703, max: (24.9 * totalInches * totalInches) / 703 };
        }
    };

    const healthyRange = computeHealthyRange();

    return (
        <div>
            <h2 className="font-semibold text-xl mb-2">BMI Calculator</h2>
<p className="text-sm text-gray-600 mb-4">
  The Body Mass Index (BMI) is a measure of body fat based on
  your height and weight. It helps categorize individuals as underweight,
  normal, overweight, or obese.
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
                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium">Weight (lbs)</label>
                            <input type="number" value={usWeight} onChange={(e) => setUsWeight(e.target.value)} className="w-full border rounded p-2" />
                        </div>
                    </>
                )}
            </div>
            <div className="bg-white p-4 rounded shadow mt-4">
                {bmi > 0 ? (
                    <>
                        <p className="text-lg font-semibold mb-2">Your BMI: {bmi.toFixed(2)} ({bmiCategory})</p>
                        <div className="h-3 w-full bg-gray-200 rounded-full mb-4">
                            <div
                                className={`h-3 rounded-full transition-all duration-300 ${bmiCategory === 'Underweight'
                                        ? 'bg-blue-500 w-1/4'
                                        : bmiCategory === 'Normal'
                                            ? 'bg-green-500 w-1/2'
                                            : bmiCategory === 'Overweight'
                                                ? 'bg-yellow-500 w-3/4'
                                                : 'bg-red-500 w-full'
                                    }`}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-700">
                            Healthy Weight Range: {healthyRange.min.toFixed(1)} - {healthyRange.max.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                        </p>
                    </>
                ) : (
                    <p className="text-gray-600">Please enter details to calculate BMI.</p>
                )}
            </div>
        </div>
    );
};

export default BMI;
