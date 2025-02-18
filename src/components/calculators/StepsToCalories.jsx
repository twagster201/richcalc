import React, { useState } from 'react';

/**
 * A simple "Steps to Calories" calculator.
 * 
 * User inputs:
 *  - unitSystem: 'metric' | 'us'
 *  - height
 *  - weight
 *  - walkingSpeed (dropdown of typical speeds)
 *  - time (minutes)
 * 
 * We approximate:
 *  1) Stride length from height.
 *  2) Distance walked from speed * (time / 60).
 *  3) Steps = distance / strideLength.
 *  4) Calories burned (approx) using MET-based formula or simple factor.
 * 
 * Outputs: steps, calories
 */

export default function StepsToCalories() {
    // Unit system: 'metric' or 'us'
    const [unitSystem, setUnitSystem] = useState('metric');

    // Common states
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [timeMinutes, setTimeMinutes] = useState('');
    const [speed, setSpeed] = useState('slow'); // or 'moderate', 'fast'

    // We define typical speeds for each system
    // e.g. slow ~ 3 km/h (metric), 2 mph (us)
    // moderate ~ 5 km/h, 3 mph
    // fast ~ 6.5 km/h, 4 mph (approx)
    const getSpeedValue = () => {
        if (unitSystem === 'metric') {
            if (speed === 'slow') return 3;       // km/h
            if (speed === 'moderate') return 5;   // km/h
            if (speed === 'fast') return 6.5;     // km/h
        } else {
            if (speed === 'slow') return 2;       // mph
            if (speed === 'moderate') return 3;   // mph
            if (speed === 'fast') return 4;       // mph
        }
        return 0;
    };

    // Approx stride length from height:
    // Simplistic approach: stride ~ 0.415 * height for adult (ignoring gender).
    // We'll do:
    //  - Metric: height in cm => stride in meters
    //  - US: height in inches => stride in inches => convert to miles or feet?
    function computeStrideLength() {
        const h = parseFloat(height);
        if (!h || h <= 0) return 0;

        if (unitSystem === 'metric') {
            // height in cm => strideLength in meters
            return 0.415 * h / 100; // convert cm -> m
        } else {
            // US => height is presumably in inches? (if user enters ft/in separate, you'd combine them, but let's assume single input in inches)
            return 0.415 * h; // in inches
        }
    }

    // For a rough calorie formula, we'll do:
    //   MET approach: Calories = MET * weight_kg * time_hr
    // Speed (walking) ~ MET 2.0 - 4.0 range. We'll pick approximate:
    //   slow => MET 2.5
    //   moderate => MET 3.5
    //   fast => MET 4.5
    // In US, we need weight_kg = weight_lbs * 0.45359237
    function computeCalories(met, weightKg, timeHr) {
        if (met <= 0 || weightKg <= 0 || timeHr <= 0) return 0;
        return met * weightKg * timeHr;
    }

    // The main logic function
    function calculate() {
        const speedVal = getSpeedValue();
        const tMinutes = parseFloat(timeMinutes) || 0;
        if (speedVal <= 0 || tMinutes <= 0) {
            return { steps: 0, calories: 0 };
        }

        // Convert time to hours
        const timeH = tMinutes / 60;

        // Distance
        // if metric => speedVal is in km/h => distance in km
        // if us => speedVal is in mph => distance in miles
        const distance = speedVal * timeH;

        // compute stride length
        const stride = computeStrideLength();

        // Steps:
        let steps = 0;
        if (stride > 0) {
            if (unitSystem === 'metric') {
                // distance in km => convert to meters => distanceM = distance * 1000
                // stride in meters => steps = distanceM / stride
                const distanceM = distance * 1000;
                steps = distanceM / stride;
            } else {
                // distance in miles => convert to inches => distanceInches = distance * 5280 * 12
                // stride in inches => steps = distanceInches / stride
                const distanceInches = distance * 5280 * 12;
                steps = distanceInches / stride;
            }
        }

        // Approx MET for each speed
        let metVal = 2.5; // default slow
        if (speed === 'moderate') metVal = 3.5;
        if (speed === 'fast') metVal = 4.5;

        // convert weight to kg if US
        let weightKg = 0;
        const w = parseFloat(weight) || 0;
        if (unitSystem === 'metric') {
            weightKg = w; // we assume user typed kg
        } else {
            weightKg = w * 0.45359237; // lbs -> kg
        }

        // compute approximate calories
        const calories = computeCalories(metVal, weightKg, timeH);

        return { steps, calories };
    }

    const { steps, calories } = calculate();
    const stepsRounded = steps > 0 ? steps.toFixed(0) : 0;
    const calsRounded = calories > 0 ? calories.toFixed(1) : 0;

    return (
        <div>
            <h2 className="font-semibold text-xl mb-2">Steps to Calories Calculator</h2>
            <p className="text-sm text-gray-600 mb-4">
                Estimate how many steps you walk and approximate calories burned,
                based on your height, weight, walking speed, and time.
            </p>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setUnitSystem('metric')}
                    className={
                        unitSystem === 'metric'
                            ? 'bg-blue-600 text-white px-4 py-2 rounded'
                            : 'bg-gray-300 px-4 py-2 rounded'
                    }
                >
                    Metric
                </button>
                <button
                    onClick={() => setUnitSystem('us')}
                    className={
                        unitSystem === 'us'
                            ? 'bg-blue-600 text-white px-4 py-2 rounded'
                            : 'bg-gray-300 px-4 py-2 rounded'
                    }
                >
                    US
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block mb-1 font-medium">
                        {`Height (${unitSystem === 'metric' ? 'cm' : 'inches'})`}
                    </label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">
                        {`Weight (${unitSystem === 'metric' ? 'kg' : 'lbs'})`}
                    </label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Walking Speed</label>
                    <select
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={speed}
                        onChange={(e) => setSpeed(e.target.value)}
                    >
                        <option value="slow">Slow</option>
                        <option value="moderate">Moderate</option>
                        <option value="fast">Fast</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Walking Time (minutes)</label>
                    <input
                        type="number"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        value={timeMinutes}
                        onChange={(e) => setTimeMinutes(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
                {steps > 0 ? (
                    <>
                        <p className="text-lg font-semibold mb-2">
                            You walked approximately <span className="text-blue-600">{stepsRounded}</span> steps
                        </p>
                        <p className="text-sm text-gray-700">
                            Estimated Calories Burned: <strong>{calsRounded}</strong> kcal
                        </p>
                    </>
                ) : (
                    <p className="text-gray-600">Enter valid data to estimate your steps and calories.</p>
                )}
            </div>
        </div>
    );
}
