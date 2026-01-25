// GET HTML ELEMENTS

const form = document.querySelector(".add-expense form");
const textInput = form.querySelector("input[type='text']");
const amountInput = form.querySelector("input[type='number']");
const balanceAmount = document.querySelector(".balance-amount");
const expenseList = document.querySelector(".expense-list");

const donutCtx = document.getElementById("donutChart").getContext("2d");
const lineCtx = document.getElementById("lineChart").getContext("2d");
const clearAllBtn = document.getElementById("clearAllBtn");
const monthlyTotalEl = document.getElementById("monthlyTotal");



let donutChart;
let lineChart;

// DATA STORAGE

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}


// RENDER EXPENSES (ONLY WAY)

function renderExpenses() {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    const emptyMsg = document.createElement("li");

    emptyMsg.innerHTML = `
      <div style="
        text-align: center;
        padding: 20px;
        color: #777;
        font-size: 14px;
      ">
        <div style="font-size: 28px;">📭</div>
        <p>No expenses yet</p>
        <p style="font-size: 12px;">Add your first expense above</p>
      </div>
    `;

    expenseList.appendChild(emptyMsg);
    return;
  }

  expenses.forEach(addExpenseToDOM);
}



// HANDLE FORM SUBMIT

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = Number(amountInput.value);

  if (text === "" || amount === 0) {
    alert("Please enter valid expense details");
    return;
  }

const expense = {
  id: Date.now(),
  text,
  amount,
  date: new Date().toISOString()
};


  expenses.push(expense);
  saveToLocalStorage();

  renderExpenses();
  updateBalance();
  updateCharts();

  textInput.value = "";
  amountInput.value = "";
});

// ADD EXPENSE TO DOM

function addExpenseToDOM(expense) {
  const li = document.createElement("li");

li.innerHTML = `
  <span>
    ${expense.text}
    <small style="color:#777; font-size:12px;">
      (${new Date(expense.date).toLocaleDateString()})
    </small>
  </span>
  <span>₹${expense.amount}</span>
  <button>❌</button>
`;

const amountSpan = li.querySelector("span:nth-child(2)");

if (expense.amount < 0) {
  amountSpan.style.color = "green";
} else {
  amountSpan.style.color = "#e63946"; // soft red
}


li.style.display = "grid";
li.style.gridTemplateColumns = "1fr auto auto";
li.style.alignItems = "center";
li.style.gap = "10px";
li.style.marginTop = "10px";
li.querySelector("button").style.marginLeft = "15px";



const deleteBtn = li.querySelector("button");

// base style
deleteBtn.style.background = "none";
deleteBtn.style.border = "none";
deleteBtn.style.cursor = "pointer";
deleteBtn.style.fontSize = "16px";
deleteBtn.style.color = "#e63946";
deleteBtn.style.transition = "transform 0.2s, color 0.2s";

// hover effect
deleteBtn.addEventListener("mouseenter", () => {
  deleteBtn.style.transform = "scale(1.2)";
  deleteBtn.style.color = "#b00020";
});

deleteBtn.addEventListener("mouseleave", () => {
  deleteBtn.style.transform = "scale(1)";
  deleteBtn.style.color = "#e63946";
});

// click with confirmation
deleteBtn.addEventListener("click", () => {
  const confirmDelete = confirm("Delete this expense?");
  if (confirmDelete) {
    removeExpense(expense.id);
  }
});



  expenseList.appendChild(li);


deleteBtn.style.background = "none";
deleteBtn.style.border = "none";
deleteBtn.style.cursor = "pointer";
deleteBtn.style.fontSize = "16px";
deleteBtn.style.color = "#e63946";

}


// REMOVE EXPENSE

function removeExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);

  saveToLocalStorage();
  renderExpenses();
  updateBalance();
  updateCharts();
}

// Add the clear all logic
clearAllBtn.addEventListener("click", () => {
  if (expenses.length === 0) {
    alert("No expenses to clear");
    return;
  }

  const confirmClear = confirm("Are you sure you want to delete all expenses?");
  if (!confirmClear) return;

  expenses = [];
  localStorage.removeItem("expenses");

  renderExpenses();
  updateBalance();
  updateCharts();
});


// UPDATE BALANCE

function updateBalance() {
  const total = expenses.reduce(function (sum, exp) {
    return sum + exp.amount;
  }, 0);

  balanceAmount.textContent = `₹${total}`;

  // ✅ Balance Zero UX (THIS is the new part)
  if (total === 0) {
    balanceAmount.style.color = "#777";   // calm grey
  } else {
    balanceAmount.style.color = "#e07a5f"; // warm highlight
  }
}

function getMonthlyTotal() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let total = 0;

  expenses.forEach(exp => {
    if (!exp.date) return;

    const expDate = new Date(exp.date);

    if (
      expDate.getMonth() === currentMonth &&
      expDate.getFullYear() === currentYear
    ) {
      total += exp.amount;
    }
  });

  return total;
}

function updateMonthlyTotal() {
  const monthlyTotal = getMonthlyTotal();
  monthlyTotalEl.textContent = `This month: ₹${monthlyTotal}`;
}




// UPDATE CHARTS
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
      plugins: {
        legend: { position: "bottom" }
      }
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
        backgroundColor: "rgba(224, 122, 95, 0.2)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}

// INITIAL LOAD

renderExpenses();
updateBalance();
updateCharts();
