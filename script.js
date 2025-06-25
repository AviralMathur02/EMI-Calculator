// Define constants for limits
const MIN_LOAN_AMOUNT = 5000;
const WARNING_THRESHOLD = 5000000; // 50 Lakhs
const ABSOLUTE_MAX_LOAN_AMOUNT = 10000000000; // 100 Crores (1,00,00,00,000)
const MIN_INTEREST_RATE = 1; // From your existing logic
const MAX_INTEREST_RATE = 30; // <<< YOUR NEW REQUIREMENT: Max interest rate 30%

// Get DOM elements once, assuming they exist in your HTML
const loanAmountInput = document.getElementById("loanAmount");
const interestRateInput = document.getElementById("interestRate");
const termInput = document.getElementById("term"); // Assuming you have a term input

const calculateButton = document.getElementById("calculateButton");

const loanAmountDisplay = document.getElementById("loanAmountDisplay"); // Assuming these are for displaying current values
const interestRateDisplay = document.getElementById("interestRateDisplay");

const loanWarning = document.getElementById("loanWarning");
const highLoanWarning = document.getElementById("highLoanWarning");
const rateWarning = document.getElementById("rateWarning");


// This function consolidates all validation logic and updates the button state
function checkCalculationEligibility() {
    const loanAmount = parseFloat(loanAmountInput.value) || 0;
    const interestRate = parseFloat(interestRateInput.value) || 0;

    let isLoanAmountValid = true;
    let isInterestRateValid = true;
    let isTermValid = true; // Assuming 'term' might also have validation in future


    // --- 1. Validate Loan Amount ---
    if (loanAmount < MIN_LOAN_AMOUNT) {
        loanWarning.innerText = `⚠️ Minimum loan amount is ₹${MIN_LOAN_AMOUNT.toLocaleString("en-IN")}`;
        isLoanAmountValid = false;
    } else {
        loanWarning.innerText = ""; // Clear if valid
    }

    if (loanAmount > ABSOLUTE_MAX_LOAN_AMOUNT) {
        highLoanWarning.innerText = `⛔ Loan amount exceeds maximum limit of ₹${ABSOLUTE_MAX_LOAN_AMOUNT.toLocaleString("en-IN")}. Calculation disabled.`;
        isLoanAmountValid = false; // This is a hard invalidation
    } else if (loanAmount > WARNING_THRESHOLD) {
        highLoanWarning.innerText = `⚠️ Loan amount exceeds ₹${WARNING_THRESHOLD.toLocaleString("en-IN")}. Consider smaller amounts for better manageability.`;
        // This is just a warning, doesn't make it invalid for calculation
    } else {
        highLoanWarning.innerText = ""; // Clear if within normal range
    }

    // --- 2. Validate Interest Rate ---
    if (interestRate < MIN_INTEREST_RATE) {
        rateWarning.innerText = `⚠️ Minimum interest rate is ${MIN_INTEREST_RATE}%`;
        isInterestRateValid = false;
    } else if (interestRate >= MAX_INTEREST_RATE) { // <<< THIS IS THE NEW VALIDATION
        rateWarning.innerText = `⛔ Interest rate must be less than ${MAX_INTEREST_RATE}%. Calculation disabled.`;
        isInterestRateValid = false; // This is a hard invalidation
    } else {
        rateWarning.innerText = ""; // Clear if valid
    }

    // --- 3. Validate Term (Add your term validation if needed) ---
    // Example: if (parseInt(termInput.value) <= 0) { isTermValid = false; }


    // --- Final Decision for Calculate Button ---
    // The button is enabled ONLY if ALL critical validations pass.
    calculateButton.disabled = !(isLoanAmountValid && isInterestRateValid && isTermValid);
}


// This function updates the display values and then triggers the validation check
function updateValue(id, displayId) {
    let inputElement = document.getElementById(id);
    let value = parseFloat(inputElement.value) || 0;

    // Update the display for the specific input
    if (displayId) { // Check if displayId is provided (e.g., loanAmountDisplay, interestRateDisplay)
        if (id === "loanAmount") {
            document.getElementById(displayId).innerText = `₹${value.toLocaleString("en-IN")}`;
        } else if (id === "interestRate") {
            document.getElementById(displayId).innerText = `${value}%`;
        }
    }

    // After any input change, re-run the full validation to update the button and warnings
    checkCalculationEligibility();
}


function calculateEMI() {
    // Clear all warnings at the start of calculation (optional, but good for a fresh start)
    loanWarning.innerText = "";
    highLoanWarning.innerText = "";
    rateWarning.innerText = "";

    // Double-check if the button is disabled. If it is, something went wrong or
    // the user tried to bypass. Just return.
    if (calculateButton.disabled) {
        console.warn("Calculation attempted with invalid inputs. Button was disabled.");
        // Optionally clear results if a calculation was attempted when invalid
        document.getElementById("emiAmount").value = "";
        document.getElementById("totalPaymentBox").innerText = "";
        document.getElementById("interestPaidBox").innerText = "";
        document.getElementById("loanCategoryBox").innerText = "";
        document.getElementById("chartContainer").style.display = "none";
        document.getElementById("emiInfo").style.display = "none";
        document.getElementById("footer").style.display = "none";
        return;
    }

    // Retrieve values after validation
    let loanAmount = parseFloat(loanAmountInput.value) || 0;
    let interestRate = parseFloat(interestRateInput.value) / 12 / 100 || 0; // Monthly rate
    let term = parseInt(termInput.value) || 0;

    // --- Calculation proceeds only if the inputs are valid and button is enabled ---
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
    else if (loanAmount > 1000000 && loanAmount <= WARNING_THRESHOLD) // Up to 50 Lakhs
        loanCategory = "Home Loan";
    else if (loanAmount > WARNING_THRESHOLD && loanAmount <= ABSOLUTE_MAX_LOAN_AMOUNT) // Above 50 Lakhs up to 100 Crores
        loanCategory = "Large Scale Loan";
    else loanCategory = "Invalid Amount"; // Should ideally not be reached due to disabled button

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

    // Assuming Chart.js is loaded
    let ctx = document.getElementById("emiChart").getContext("2d");
    if (window.myChart) window.myChart.destroy(); // Destroy previous chart if it exists

    window.myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Principal", "Interest"],
            datasets: [{
                data: [loanAmount, totalInterest],
                backgroundColor: ["#007bff", "#ff6347"],
                borderColor: ["#000", "#000"],
                borderWidth: 2,
            }, ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // You might want to adjust other chart options here for better display
        },
    });
}


// --- Event Listeners and Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {

    loanAmountInput.addEventListener('input', () => updateValue('loanAmount', 'loanAmountDisplay'));
    interestRateInput.addEventListener('input', () => updateValue('interestRate', 'interestRateDisplay'));
    termInput.addEventListener('input', checkCalculationEligibility); // Term input might not need a display update, but should trigger validation

    // Attach click listener to the calculate button
    calculateButton.addEventListener('click', calculateEMI);


    checkCalculationEligibility();
});
