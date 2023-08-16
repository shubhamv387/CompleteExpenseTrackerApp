window.addEventListener("DOMContentLoaded", showOnReload);

const form = document.getElementById("form-submit");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = document.getElementById("amount");
  const description = document.getElementById("description");
  const category = document.getElementById("category");

  // creating new expense object
  const ExpenseObj = {
    amount: parseFloat(amount.value),
    description: description.value,
    category: category.value,
  };

  // POST request to backend
  axios
    .post("http://localhost:3000/expense/add-expense", ExpenseObj)
    .then((res) => {
      // adding each expense in the Expenselist
      showExpensesOnScreen(res.data);
    })
    .catch((err) => console.log(err.message));

  // resetting the input fields after submission
  amount.value = "";
  description.value = "";
  category.value = "";
});

function showExpensesOnScreen(ExpenseObj) {
  const expenseList = document.getElementById("expenseList");

  //creating a new li element
  const expense = document.createElement("li");
  expense.className = "list-group-item list-group-item-warning";

  expense.innerHTML = `
  <div class = "d-block mb-2 text-capitalize"> 
    <span class = "fw-bold"> Amount:</span> 
    ${ExpenseObj.amount} INR <br> 
    <span class = "fw-bold"> Description:</span> 
    ${ExpenseObj.description} <br> 
    <span class = "fw-bold"> Category:</span> 
    ${ExpenseObj.category} 
  </div>`;

  //Adding Edit Btn to each li element
  let editBtn = document.createElement("button");
  editBtn.className = "btn btn-success btn-sm d-inline-block me-2 ";
  editBtn.appendChild(document.createTextNode("EDIT"));
  expense.appendChild(editBtn);

  //Adding delete Btn to each li element
  let deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-danger btn-sm d-inline-block ";
  deleteBtn.appendChild(document.createTextNode("DELETE"));

  expense.append(deleteBtn);

  //Appening the li element to the ul element
  expenseList.append(expense);

  // adding event Listeners to edit btn
  editBtn.addEventListener("click", editExpense);

  function editExpense() {
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "block";

    // Sending the expense values to form inputs
    document.getElementById("amount").value = ExpenseObj.amount;
    document.getElementById("description").value = ExpenseObj.description;
    document.getElementById("category").value = ExpenseObj.category;
    document.getElementById("amount").focus();

    // Update button onclick event handler
    document.getElementById("updateBtn").onclick = editedExpense;

    function editedExpense() {
      newAmount = parseInt(document.getElementById("amount").value);
      let updatedExpense = {
        amount: document.getElementById("amount").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
      };

      // check for the input fields
      if (
        updatedExpense.amount === "" ||
        updatedExpense.description === "" ||
        updatedExpense.category === ""
      )
        alert("All inputs should be filled");
      else {
        axios
          .put(
            `http://localhost:3000/expense/edit-expense/${ExpenseObj.id}`,
            updatedExpense
          )
          .then((updatedExpense) => {
            ExpenseObj = updatedExpense.data;

            // manupulating the previous expense data with new data
            expense.firstElementChild.innerHTML = `<span class = "fw-bold"> Amount:</span> ${ExpenseObj.amount} INR <br> <span class = "fw-bold"> Description:</span> ${ExpenseObj.description} <br> <span class = "fw-bold"> Category:</span> ${ExpenseObj.category}`;

            // resetting the submit and update buttons
            document.getElementById("submitBtn").style.display = "block";
            document.getElementById("updateBtn").style.display = "none";

            // resetting the form inputs
            document.getElementById("amount").value = "";
            document.getElementById("description").value = "";
            document.getElementById("category").value = "";
          })
          .catch((err) => console.log(err.message));
      }
    }
  }

  // deleting an expense
  deleteBtn.addEventListener("click", deleteExpense);

  function deleteExpense() {
    axios
      .delete(`http://localhost:3000/expense/delete-expense/${ExpenseObj.id}`)
      .then((res) => {
        expenseList.removeChild(expense);
      })
      .catch((err) => console.log(err.message));
  }
}

function showOnReload() {
  axios
    .get("http://localhost:3000/expense/")
    .then((expenses) => {
      console.log(expenses.data);
      expenses.data.forEach((expense) => {
        showExpensesOnScreen(expense);
      });
    })
    .catch((err) => console.log(err.message));
}
