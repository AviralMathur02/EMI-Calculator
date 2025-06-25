// Define constants for limits
const MIN_LOAN_AMOUNT = 5000;
const WARNING_THRESHOLD = 5000000; // 50 Lakhs
const ABSOLUTE_MAX_LOAN_AMOUNT = 10000000000; // 100 Crores (1,00,00,00,000)

function updateValue(id, displayId) {
  let inputElement = document.getElementById(id);
  let value = parseFloat(inputElement.value) || 0;

  // Get the calculate button
  const calculateButton = document.getElementById("calculateButton"); // Assuming your calculate button has this ID

  if (id === "loanAmount") {
    // Handle minimum loan amount warning
    if (value < MIN_LOAN_AMOUNT) {
      document.getElementById(
        "loanWarning"
      ).innerText = `⚠️ Minimum loan amount is ₹${MIN_LOAN_AMOUNT.toLocaleString(
        "en-IN"
      )}`;
      calculateButton.disabled = true; // Disable calculation if below min
    } else {
      document.getElementById("loanWarning").innerText = "";
      calculateButton.disabled = false; // Re-enable if valid so far
    }

    // Handle warning for amounts above WARNING_THRESHOLD (50 Lakhs) but below ABSOLUTE_MAX_LOAN_AMOUNT (100 Crores)
    if (value > WARNING_THRESHOLD && value <= ABSOLUTE_MAX_LOAN_AMOUNT) {
      document.getElementById(
        "highLoanWarning"
      ).innerText = `⚠️ Loan amount exceeds ₹${WARNING_THRESHOLD.toLocaleString(
        "en-IN"
      )}. Consider smaller amounts for better manageability.`;
      calculateButton.disabled = false; // Still allow calculation
    } else if (value > ABSOLUTE_MAX_LOAN_AMOUNT) {
      // If exceeds 100 Crores
      document.getElementById(
        "highLoanWarning"
      ).innerText = `⛔ Loan amount exceeds maximum limit of ₹${ABSOLUTE_MAX_LOAN_AMOUNT.toLocaleString(
        "en-IN"
      )}. Calculation disabled.`;
      calculateButton.disabled = true; // Absolutely disable calculation
    } else {
      document.getElementById("highLoanWarning").innerText = ""; // Clear if within normal range
      calculateButton.disabled = false; // Re-enable if within normal range
    }

    // Update display for loan amount
    document.getElementById(displayId).innerText = `₹${value.toLocaleString(
      "en-IN"
    )}`;
  } else if (id === "interestRate") {
    // Handle interest rate warnings
    if (value < 1) {
      document.getElementById("rateWarning").innerText =
        "⚠️ Minimum interest rate is 1%";
      calculateButton.disabled = true; // Disable if interest rate is invalid
    } else {
      document.getElementById("rateWarning").innerText = "";
      // Re-evaluate if button should be enabled based on loanAmount as well
      const currentLoanAmount =
        parseFloat(document.getElementById("loanAmount").value) || 0;
      if (
        currentLoanAmount >= MIN_LOAN_AMOUNT &&
        currentLoanAmount <= ABSOLUTE_MAX_LOAN_AMOUNT
      ) {
        calculateButton.disabled = false;
      }
    }
    document.getElementById(displayId).innerText = `${value}%`;
  }

  // Final check to ensure button state is correct after any update
  checkCalculationEligibility();
}

function checkCalculationEligibility() {
  const loanAmount =
    parseFloat(document.getElementById("loanAmount").value) || 0;
  const interestRate =
    parseFloat(document.getElementById("interestRate").value) || 0;
  const calculateButton = document.getElementById("calculateButton");

  if (
    loanAmount < MIN_LOAN_AMOUNT ||
    loanAmount > ABSOLUTE_MAX_LOAN_AMOUNT ||
    interestRate < 1
  ) {
    calculateButton.disabled = true;
  } else {
    calculateButton.disabled = false;
  }
}

function calculateEMI() {
  document.getElementById("highLoanWarning").innerText = ""; // Clear previous warnings
  document.getElementById("loanWarning").innerText = "";
  document.getElementById("rateWarning").innerText = "";

  let loanAmount = parseFloat(document.getElementById("loanAmount").value) || 0;
  let interestRate =
    parseFloat(document.getElementById("interestRate").value) / 12 / 100 || 0;
  let term = parseInt(document.getElementById("term").value) || 0;

  // Strict check before calculation: if outside allowed range, just return (button should be disabled already)
  if (
    loanAmount < MIN_LOAN_AMOUNT ||
    loanAmount > ABSOLUTE_MAX_LOAN_AMOUNT ||
    parseFloat(document.getElementById("interestRate").value) < 1
  ) {
    // These conditions should ideally disable the button preventing this call,
    // but as a fallback, ensure nothing calculates.
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
