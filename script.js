// Example of a (hypothetical) component that would handle interest rate calculation
import React, { useState } from "react";

function LoanCalculator() {
  const [interestRate, setInterestRate] = useState(0);
  const [canCalculate, setCanCalculate] = useState(false);

  const handleInterestRateChange = (e) => {
    const rate = parseFloat(e.target.value);
    setInterestRate(rate);
    // Validation logic: Interest rate must be less than 30
    setCanCalculate(rate < 30);
  };

  const handleCalculate = () => {
    // Perform calculation here
    console.log("Calculating with interest rate:", interestRate);
  };

  return (
    <div>
      <label htmlFor="interestRate">Interest Rate (%):</label>
      <input
        type="number"
        id="interestRate"
        value={interestRate}
        onChange={handleInterestRateChange}
      />
      {interestRate >= 30 && (
        <p style={{ color: "red" }}>Interest rate must be less than 30%</p>
      )}

      <button onClick={handleCalculate} disabled={!canCalculate}>
        Calculate
      </button>
    </div>
  );
}

export default LoanCalculator;
