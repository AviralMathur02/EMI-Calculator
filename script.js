
const MIN_LOAN_AMOUNT = 5000;
const WARNING_THRESHOLD = 5000000; // 50 Lakhs
const ABSOLUTE_MAX_LOAN_AMOUNT = 10000000000; // 100 Crores (1,00,00,00,000)
const MIN_INTEREST_RATE = 1; // Added for clarity, as you had 'value < 1' check
const MAX_INTEREST_RATE = 30; // Your new requirement

// Get DOM Elements once
const loanAmountInput = document.getElementById("loanAmount");
const interestRateInput = document.getElementById("interestRate");
const termInput = document.getElementById("term"); // Assuming you have a term input
const calculateButton = document.getElementById("calculateButton");
const loanAmountDisplay = document.getElementById("loanAmountDisplay");
const interestRateDisplay = document.getElementById("interestRateDisplay");
const loanWarning = document.getElementById("loanWarning");
const highLoanWarning = document.getElementById("highLoanWarning");
const rateWarning = document.getElementById("rateWarning");

// This function will consolidate all validation logic and update the button state
function checkCalculationEligibility() {
  const loanAmount = parseFloat(loanAmountInput.value) || 0;
  const interestRate = parseFloat(interestRateInput.value) || 0;

  let isValid = true; // Assume valid until a rule breaks

  // --- Loan Amount Validation ---
  if (loanAmount < MIN_LOAN_AMOUNT) {
    loanWarning.innerText = `⚠️ Minimum loan amount is ₹${MIN_LOAN_AMOUNT.toLocaleString(
      "en-IN"
    )}`;
    isValid = false;
  } else {
    loanWarning.innerText = "";
  }

  if (loanAmount > ABSOLUTE_MAX_LOAN_AMOUNT) {
    highLoanWarning.innerText = `⛔ Loan amount exceeds maximum limit of ₹${ABSOLUTE_MAX_LOAN_AMOUNT.toLocaleString(
      "en-IN"
    )}. Calculation disabled.`;
    isValid = false;
  } else if (loanAmount > WARNING_THRESHOLD) {
    highLoanWarning.innerText = `⚠️ Loan amount exceeds ₹${WARNING_THRESHOLD.toLocaleString(
      "en-IN"
    )}. Consider smaller amounts for better manageability.`;
  } else {
    highLoanWarning.innerText = "";
  }

  // --- Interest Rate Validation ---
  if (interestRate < MIN_INTEREST_RATE) {
    rateWarning.innerText = `⚠️ Minimum interest rate is ${MIN_INTEREST_RATE}%`;
    isValid = false;
  } else if (interestRate >= MAX_INTEREST_RATE) {
    // New condition: interest rate must be less than 30
    rateWarning.innerText = `⛔ Interest rate must be less than ${MAX_INTEREST_RATE}%. Calculation disabled.`;
    isValid = false;
  } else {
    rateWarning.innerText = "";
  }

  // --- Final Button State ---
  calculateButton.disabled = !isValid;
}

// This function updates the display values and then triggers the validation check
function updateValue(id, displayId) {
  let inputElement = document.getElementById(id);
  let value = parseFloat(inputElement.value) || 0;

  // Update display based on which input changed
  if (id === "loanAmount") {
    loanAmountDisplay.innerText = `₹${value.toLocaleString("en-IN")}`;
  } else if (id === "interestRate") {
    interestRateDisplay.innerText = `${value}%`;
  }
  // No explicit updateValue for 'term' as it's not displayed this way, but you can add if needed.

  // After updating the display, always run the full validation check
  checkCalculationEligibility();
}

function calculateEMI() {
  // Clear previous warnings when calculation is triggered
  loanWarning.innerText = "";
  highLoanWarning.innerText = "";
  rateWarning.innerText = "";

  let loanAmount = parseFloat(loanAmountInput.value) || 0;
  let interestRate = parseFloat(interestRateInput.value) / 12 / 100 || 0;
  let term = parseInt(termInput.value) || 0;

  // It's good practice to have a final check here, though the button being disabled
  // should prevent this code from running if inputs are invalid.
  if (calculateButton.disabled) {
    console.warn(
      "Attempted to calculate with disabled button. Inputs are invalid."
    );
    // Optionally, clear results if calculation was attempted with invalid inputs
    document.getElementById("emiAmount").value = "";
    document.getElementById("totalPaymentBox").innerText = "";
    document.getElementById("interestPaidBox").innerText = "";
    document.getElementById("loanCategoryBox").innerText = "";
    document.getElementById("chartContainer").style.display = "none";
    document.getElementById("emiInfo").style.display = "none";
    document.getElementById("footer").style.display = "none";
    return;
  }

  // --- Calculation proceeds only if the button is enabled and values are valid ---
  let emi =
    (loanAmount * interestRate * Math.pow(1 + interestRate, term)) /
    (Math.pow(1 + interestRate, term) - 1);
  emi = emi.toFixed(2);

  let totalPayment = emi * term;
  let totalInterest = totalPayment - loanAmount;

  // Determine Loan Category (up to the ABSOLUTE_MAX_LOAN_AMOUNT)
  let loanCategory = "";
  if (loanAmount >= MIN_LOAN_AMOUNT && loanAmount <= 50000)
    loanCategory = "Small Loan";
  else if (loanAmount > 50000 && loanAmount <= 500000)
    loanCategory = "Personal Loan";
  else if (loanAmount > 500000 && loanAmount <= 1000000)
    loanCategory = "Business Loan";
  else if (loanAmount > 1000000 && loanAmount <= WARNING_THRESHOLD)
    // Up to 50 Lakhs
    loanCategory = "Home Loan";
  else if (
    loanAmount > WARNING_THRESHOLD &&
    loanAmount <= ABSOLUTE_MAX_LOAN_AMOUNT
  )
    // Above 50 Lakhs up to 100 Crores
    loanCategory = "Large Scale Loan";
  else loanCategory = "Invalid Amount"; // Should not be reached if button is correctly disabled

  // Determine EMI-Based Category
  let emiCategory = "";
  if (emi < 5000) emiCategory = "Low EMI Loan";
  else if (emi >= 5000 && emi <= 15000) emiCategory = "Moderate EMI Loan";
  else emiCategory = "High EMI Loan";

  document.getElementById("emiAmount").value = `₹${parseFloat(
    emi
  ).toLocaleString("en-IN")}`;

  document.getElementById(
    "totalPaymentBox"
  ).innerText = `Total Payment: ₹${totalPayment.toLocaleString("en-IN")}`;

  document.getElementById(
    "interestPaidBox"
  ).innerText = `Total Interest: ₹${totalInterest.toLocaleString("en-IN")}`;

  document.getElementById(
    "loanCategoryBox"
  ).innerText = ` Loan Category: ${loanCategory} (${emiCategory})`;

  document.getElementById("chartContainer").style.display = "block";
  document.getElementById("emiInfo").style.display = "block";
  document.getElementById("footer").style.display = "block";

  let ctx = document.getElementById("emiChart").getContext("2d");
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Principal", "Interest"],
      datasets: [
        {
          data: [loanAmount, totalInterest],
          backgroundColor: ["#007bff", "#ff6347"],
          borderColor: ["#000", "#000"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}
document.addEventListener("DOMContentLoaded", () => {
  // Attach event listeners to your input fields
  loanAmountInput.addEventListener("input", () =>
    updateValue("loanAmount", "loanAmountDisplay")
  );
  interestRateInput.addEventListener("input", () =>
    updateValue("interestRate", "interestRateDisplay")
  );
  termInput.addEventListener("input", checkCalculationEligibility); // Term change also affects eligibility, if you have rules for it

  // Attach click listener to the calculate button
  calculateButton.addEventListener("click", calculateEMI);

  // Initial check when the page loads
  checkCalculationEligibility();
});
