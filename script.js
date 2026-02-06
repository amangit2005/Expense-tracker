// 1. GET HTML ELEMENTS

const form = document.querySelector(".add-expense form");
const textInput = form.querySelector("input[type='text']");
const amountInput = form.querySelector("input[type='number']");
const balanceAmount = document.querySelector(".balance-amount");
const expenseList = document.querySelector(".expense-list");
const clearAllBtn = document.getElementById("clearAllBtn");
const monthlyTotalEl = document.getElementById("monthlyTotal");
const weeklyTotalEl = document.getElementById("weeklyTotal");
const donutCtx = document.getElementById("donutChart").getContext("2d");
const lineCtx = document.getElementById("lineChart").getContext("2d");
const yearlyTotalEl = document.getElementById("yearlyTotal");
const categorySelect = document.getElementById("category");



let donutChart;
let lineChart;

// 2. STATE

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// 3. STORAGE HELPER

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// 4. RENDER EXPENSES

function renderExpenses() {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    const emptyMsg = document.createElement("li");
    emptyMsg.innerHTML = `
      <div style="text-align:center;padding:20px;color:#777;">
        <div style="font-size:28px;">📭</div>
        <p>No expenses yet</p>
        <p style="font-size:12px;">Add your first expense above</p>
      </div>
    `;
    expenseList.appendChild(emptyMsg);
    return;
  }

  expenses.forEach(addExpenseToDOM);
}

// 5. ADD EXPENSE TO DOM

function addExpenseToDOM(expense) {
  const li = document.createElement("li");

  li.innerHTML = `
    <span>
      ${expense.text}
      <small style="color:#777;font-size:12px;">
        (${new Date(expense.date).toLocaleDateString()})
      </small>
    </span>
    <span>₹${expense.amount}</span>
    <button>❌</button>
  `;

  li.style.display = "grid";
  li.style.gridTemplateColumns = "1fr auto auto";
  li.style.alignItems = "center";
  li.style.gap = "10px";
  li.style.marginTop = "10px";

  const amountSpan = li.querySelector("span:nth-child(2)");
  amountSpan.style.color = "#e63946";

  const deleteBtn = li.querySelector("button");
  deleteBtn.style.background = "none";
  deleteBtn.style.border = "none";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.fontSize = "16px";
  deleteBtn.style.color = "#e63946";

  // hover effect
deleteBtn.addEventListener("mouseenter", () => {
  deleteBtn.style.transform = "scale(1.2)";
  deleteBtn.style.color = "#b00020";
});

  deleteBtn.addEventListener("click", () => {
    const confirmDelete = confirm("Delete this expense?");
    if (confirmDelete) {
      removeExpense(expense.id);
    }
  });

  expenseList.appendChild(li);
}

// 6. REMOVE EXPENSE

function removeExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveToLocalStorage();
  updateUI();
}

// 7. BALANCE

function updateBalance() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  balanceAmount.textContent = `₹${total}`;
  balanceAmount.style.color = total === 0 ? "#777" : "#e07a5f";
}

// 8. MONTHLY ANALYTICS

function getMonthlyTotal() {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();

  return expenses.reduce((sum, exp) => {
    const d = new Date(exp.date);
    return d.getMonth() === m && d.getFullYear() === y
      ? sum + exp.amount
      : sum;
  }, 0);
}

function updateMonthlyTotal() {
  monthlyTotalEl.textContent = `This month: ₹${getMonthlyTotal()}`;
}

// 9. WEEKLY ANALYTICS

function getWeeklyTotal() {
  const now = new Date();

  return expenses.reduce((sum, exp) => {
    const d = new Date(exp.date);
    const diffDays = (now - d) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 6 ? sum + exp.amount : sum;
  }, 0);
}

function updateWeeklyTotal() {
  weeklyTotalEl.textContent = `This week: ₹${getWeeklyTotal()}`;
}

// YEARLY ANALYTICS

function getYearlyTotal() {
  const now = new Date();
  const currentYear = now.getFullYear();

  return expenses.reduce((sum, exp) => {
    const expDate = new Date(exp.date);
    return expDate.getFullYear() === currentYear
      ? sum + exp.amount
      : sum;
  }, 0);
}

function updateYearlyTotal() {
  yearlyTotalEl.textContent = `This year: ₹${getYearlyTotal()}`;
}

// 10. CHARTS

function updateCharts() {
  const labels = expenses.map(exp => exp.text);
  const data = expenses.map(exp => exp.amount);

  if (donutChart) donutChart.destroy();
  if (lineChart) lineChart.destroy();

  donutChart = new Chart(donutCtx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          "#e07a5f",
          "#f2cc8f",
          "#81b29a",
          "#f4a261",
          "#e76f51"
        ]
      }]
    },
    options: {
      plugins: { legend: { position: "bottom" } }
    }
  });

  lineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Spending",
        data,
        borderColor: "#e07a5f",
        backgroundColor: "rgba(224,122,95,0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

// 11. UPDATE UI (MASTER FUNCTION)

function updateUI() {
  renderExpenses();
  updateBalance();
  updateMonthlyTotal();
  updateWeeklyTotal();
  updateYearlyTotal();
  updateCharts();
}

// 12. EVENT LISTENERS

form.addEventListener("submit", e => {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = Number(amountInput.value);

  if (!text || amount === 0) {
    alert("Please enter valid expense details");
    return;
  }

  expenses.push({
    id: Date.now(),
    text,
    amount,
    category: categorySelect.value,
    date: new Date().toISOString()
  });

  saveToLocalStorage();
  updateUI();

  textInput.value = "";
  amountInput.value = "";
});

clearAllBtn.addEventListener("click", () => {
  if (expenses.length === 0) {
    alert("No expenses to clear");
    return;
  }

  if (!confirm("Delete all expenses?")) return;

  expenses = [];
  localStorage.removeItem("expenses");
  updateUI();
});

// 13. INITIAL LOAD

updateUI();
