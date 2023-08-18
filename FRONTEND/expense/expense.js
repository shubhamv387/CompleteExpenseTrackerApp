let rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

let totalPrice = 0;

const token = localStorage.getItem("token");

const loadingExpense = document.getElementById("loadingExpense");

window.addEventListener("DOMContentLoaded", showOnReload);

const form = document.getElementById("form-submit");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let showTotalExpense = document.getElementById("totalExpense");
  const amount = document.getElementById("amount");
  const description = document.getElementById("description");
  const category = document.getElementById("category");

  totalPrice += parseFloat(amount.value);

  // creating new expense object
  const ExpenseObj = {
    amount: parseFloat(amount.value),
    description: description.value,
    category: category.value,
  };

  // POST request to backend
  axios
    .post("http://localhost:3000/expense/add-expense", ExpenseObj, {
      headers: { Authorization: token },
    })
    .then((res) => {
      // adding each expense in the Expenselist
      showExpensesOnScreen(res.data);
      showTotalExpense.innerText = rupee.format(totalPrice);
    })
    .catch((err) => console.log(err.message));

  // resetting the input fields after submission
  amount.value = "";
  description.value = "";
  category.value = "";
});

function showExpensesOnScreen(ExpenseObj) {
  const expenseList = document.getElementById("expenseList");

  loadingExpense.style.display = "none";

  //creating a new li element
  const expense = document.createElement("li");
  expense.className = "list-group-item mb-2";
  expense.style.background = "#f2f2f2";

  expense.innerHTML = `
  <div class = "d-block mb-2 text-capitalize" style="font-size: 18px;"> 
    <span class = "fw-bold"> Amount:</span> 
    ${rupee.format(ExpenseObj.amount)}<br> 
    <span class = "fw-bold"> Description:</span> 
    ${ExpenseObj.description}<br> 
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
      newAmount = parseFloat(document.getElementById("amount").value);
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
            updatedExpense,
            {
              headers: { Authorization: token },
            }
          )
          .then((updatedExpense) => {
            let showTotalExpense = document.getElementById("totalExpense");
            totalPrice -= parseFloat(ExpenseObj.amount);

            ExpenseObj = { ...updatedExpense.data };

            // manupulating the previous expense data with new data
            expense.firstElementChild.innerHTML = `<span class = "fw-bold"> Amount:</span> ${rupee.format(
              ExpenseObj.amount
            )} <br> <span class = "fw-bold"> Description:</span> ${
              ExpenseObj.description
            } <br> <span class = "fw-bold"> Category:</span> ${
              ExpenseObj.category
            }`;

            totalPrice += parseFloat(ExpenseObj.amount);
            showTotalExpense.innerText = rupee.format(totalPrice);

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
    // console.log(token);
    axios
      .delete(`http://localhost:3000/expense/delete-expense/${ExpenseObj.id}`, {
        headers: { Authorization: token },
      })
      .then((deletedExpense) => {
        let showTotalExpense = document.getElementById("totalExpense");
        totalPrice -= parseFloat(deletedExpense.data.amount);
        showTotalExpense.innerText = rupee.format(totalPrice);

        expenseList.removeChild(expense);
        if (!expenseList.children[1]) {
          loadingExpense.innerHTML = "Add New Expenses Here!";
          loadingExpense.style.display = "block";
        }
      })
      .catch((err) => console.log(err.message));
  }
}

function showOnReload() {
  const totalExpense = document.getElementById("totalExpense");

  loadingExpense.innerHTML = "Loding Expenses...";
  loadingExpense.style.display = "block";

  setTimeout(() => {
    axios
      .get("http://localhost:3000/expense", {
        headers: { Authorization: token },
      })
      .then((expenses) => {
        if (!expenses.data.isPremium)
          document.getElementById("getpremium").style.display = "block";

        const welcomeText = document.getElementById("welcomeText");
        if (!expenses.data.expenses.length) {
          welcomeText.innerText = `Hello, ${
            expenses.data.userName.split(" ")[0]
          }`;
          loadingExpense.innerHTML = "Add New Expenses Here!";
        } else {
          welcomeText.innerText = `Hello, ${
            expenses.data.userName.split(" ")[0]
          }`;
          loadingExpense.style.display = "none";

          expenses.data.expenses.forEach((expense) => {
            showExpensesOnScreen(expense);
            totalPrice += expense.amount;
          });
        }
        totalExpense.innerHTML = rupee.format(totalPrice);
      })
      .catch((err) => {
        totalExpense.innerHTML = rupee.format(totalPrice);
        loadingExpense.innerHTML = "No authorized, please login again!";
        console.log(err.message);
        setTimeout(() => {
          window.location.replace("../login/login.html");
        }, 1500);
      });
  }, 800);
}

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  localStorage.setItem("token", "");
  window.location.replace("../login/login.html");
});

const profilePic = document.getElementById("profilePic");
profilePic.addEventListener("click", () => {
  const welcomeDiv = document.getElementById("welcomeDiv");
  welcomeDiv.classList.toggle("profileShow");
});

// Function to handle premium purchase
document
  .getElementById("getpremium")
  .addEventListener("click", purchasePremiumService);

function purchasePremiumService(e) {
  e.preventDefault();

  axios
    .get("http://localhost:3000/order/premiummembership", {
      headers: { Authorization: token },
    })
    .then((res) => {
      // console.log(res);

      const options = {
        key: res.data.key_id,
        order_id: res.data.order.id,
        handler: async function (response) {
          // The payment response includes the razorpay_payment_id
          const payment_id = response.razorpay_payment_id;

          // Send the payment_id to your server for updating transaction status
          try {
            const respons = await axios.post(
              "http://localhost:3000/order/updatetrnasectionstatus",
              { order_id: options.order_id, payment_id: payment_id },
              {
                headers: { Authorization: token },
              }
            );
            document.getElementById("getpremium").style.display = "none";
            alert("You are a Premium User Now!");
          } catch (error) {
            console.error("Error updating transaction status:", error);
            alert("Payment successful, but transaction update failed.");
          }
        },
      };

      // Initialize the Razorpay instance and open the payment dialog
      const rzp1 = new Razorpay(options);
      rzp1.open();

      // Handle payment failure
      rzp1.on("payment.failed", function (response) {
        console.log(response);
        axios
          .post(
            "http://localhost:3000/order/updatetrnasectionstatus",
            response,
            {
              headers: { Authorization: token },
            }
          )
          .then(() => {
            alert("Payment failed. Please try again or contact support.");
          })
          .catch((err) => {
            console.error("Error:", err.message);
            alert("An error occurred. Please try again later.");
          });
      });
    })
    .catch((err) => {
      console.error("Error:", err.message);
      alert("An error occurred. Please try again later.");
    });
}
