// GET HTML ELEMENTS

const form = document.querySelector(".add-expense form");
const textInput = form.querySelector("input[type='text']");
const amountInput = form.querySelector("input[type='number']");
const balanceAmount = document.querySelector(".balance-amount");
const expenseList = document.querySelector(".expense-list");

// DATA STORAGE (IN MEMORY or local )

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// HANDLE FORM SUBMIT 

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = Number(amountInput.value);

  // basic validation
  if (text === "" || amount === 0) {
    alert("Please enter valid expense details");
    return;
  }

  const expense = {
    id: Date.now(),
    text: text,
    amount: amount
  };

  expenses.push(expense);
  saveToLocalStorage();

  addExpenseToDOM(expense);
  updateBalance();

  textInput.value = "";
  amountInput.value = "";
});

// ADD EXPENSE TO UI

function addExpenseToDOM(expense) {
  const li = document.createElement("li");

  li.innerHTML = `
    <span>${expense.text}</span>
    <span>₹${expense.amount}</span>
    <button data-id="${expense.id}">❌</button>
  `;

  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";
  li.style.marginTop = "10px";

  const deleteBtn = li.querySelector("button");
  deleteBtn.addEventListener("click", function () {
    removeExpense(expense.id);
  });

  expenseList.appendChild(li);
}

// REMOVE EXPENSE

function removeExpense(id) {
  expenses = expenses.filter(function (exp) {
    return exp.id !== id;
  });

  saveToLocalStorage();
  expenseList.innerHTML = "";
  expenses.forEach(addExpenseToDOM);

  updateBalance();
}

// UPDATE BALANCE

function updateBalance() {
  const total = expenses.reduce(function (sum, exp) {
    return sum + exp.amount;
  }, 0);

  balanceAmount.textContent = `₹${total}`;
}

expenses.forEach(addExpenseToDOM);
updateBalance();
