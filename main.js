const fs = require('fs');

// Function to format currency values
function formatCurrency(value) {
  return `$${value.toLocaleString()}`;
}

// Function to format percentage values
function formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}

// Read and parse the JSON data from file
let data;
try {
  data = JSON.parse(fs.readFileSync('data.json')).data;
} catch (error) {
  console.error("Error reading or parsing data.json:", error);
  process.exit(1);
}

// Initialize variables for calculations
let revenue = 0;
let expenses = 0;
let grossProfit = 0;
let workingCapitalAssets = 0;
let workingCapitalLiabilities = 0;

// Iterate through the data to calculate revenue, expenses, and other metrics
data.forEach(entry => {
  if (entry.account_category === 'revenue') {
    if (entry.value_type === 'credit') {
      revenue += entry.total_value;
    }
  } else if (entry.account_category === 'expense') {
    if (entry.value_type === 'debit') {
      expenses += entry.total_value;
    }
  } else if (entry.account_category === 'assets') {
    if (entry.value_type === 'debit') {
      if (['current_accounts_receivable', 'bank', 'current'].includes(entry.account_type)) {
        workingCapitalAssets += entry.total_value;
      }
    } else if (entry.value_type === 'credit') {
      if (['current_accounts_receivable', 'bank', 'current'].includes(entry.account_type)) {
        workingCapitalAssets -= entry.total_value;
      }
    }
  } else if (entry.account_category === 'liability') {
    if (entry.value_type === 'credit') {
      if (['current', 'current_accounts_payable'].includes(entry.account_type)) {
        workingCapitalLiabilities += entry.total_value;
      }
    } else if (entry.value_type === 'debit') {
      if (['current', 'current_accounts_payable'].includes(entry.account_type)) {
        workingCapitalLiabilities -= entry.total_value;
      }
    }
  }
});

// Calculate Gross Profit Margin
grossProfit = data.reduce((sum, entry) => {
  if (entry.account_type === 'sales' && entry.value_type === 'debit') {
    return sum + entry.total_value;
  }
  return sum;
}, 0);

let grossProfitMargin = (grossProfit / revenue) * 100;

// Calculate Net Profit Margin
let netProfitMargin = ((revenue - expenses) / revenue) * 100;

// Calculate Working Capital Ratio
let workingCapitalRatio = (workingCapitalAssets / workingCapitalLiabilities) * 100;

// Format the output
console.log(`Revenue: ${formatCurrency(revenue)}`);
console.log(`Expenses: ${formatCurrency(expenses)}`);
console.log(`Gross Profit Margin: ${formatPercentage(grossProfitMargin)}`);
console.log(`Net Profit Margin: ${formatPercentage(netProfitMargin)}`);
console.log(`Working Capital Ratio: ${formatPercentage(workingCapitalRatio)}`);
