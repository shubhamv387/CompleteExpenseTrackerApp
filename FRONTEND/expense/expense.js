/* Reloading page after clicking back button */
if (performance.navigation.type === 2) {
  location.reload(true);
}

let rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
let totalPrice = 0;
const token = localStorage.getItem("token");
const loadingExpense = document.getElementById("loadingExpense");

let page = 1;
window.addEventListener("DOMContentLoaded", showOnReload(page));

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
      showExpensesOnScreen(res.data.expense);
      showTotalExpense.innerText = rupee.format(totalPrice);

      return res.data;
    })
    .then((addedExpense) => {
      if (addedExpense.isPremium) leaderBoardFeature();
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
  expense.className = "list-group-item mb-0";
  expense.style.background = "#f2f2f2";

  expense.innerHTML = `
  <div class = "d-block mb-2 text-capitalize" style="font-size: 17px;"> 
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

            return updatedExpense.data;
          })
          .then((updatedExpense) => {
            if (updatedExpense.isPremium) leaderBoardFeature();
          })
          .catch((err) => console.log(err.message, err.response.data));
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
        totalPrice -= parseFloat(deletedExpense.data.expense.amount);
        showTotalExpense.innerText = rupee.format(totalPrice);
        expenseList.removeChild(expense);

        if (!expenseList.children[1]) {
          loadingExpense.innerHTML = "Add New Expenses Here!";
          loadingExpense.style.display = "block";
        }
        return deletedExpense.data;
      })
      .then((deletedExpense) => {
        if (deletedExpense.isPremium) leaderBoardFeature();
      })
      .catch((err) => console.log(err.message));
  }
}

function showOnReload(page) {
  // window.location.reload();
  const totalExpense = document.getElementById("totalExpense");

  loadingExpense.innerHTML = "Loding Expenses...";
  loadingExpense.style.display = "block";

  setTimeout(() => {
    axios
      .get(`http://localhost:3000/expense?page=${page}`, {
        headers: { Authorization: token },
      })
      .then(
        ({ data: { expenses, userName, isPremium, status, ...pageData } }) => {
          if (!isPremium) {
            document.getElementById("getpremium").style.display = "block";
            document.getElementById("expenseList").style.marginBottom = "100px";
            document.getElementById("lbUserList").style.display = "none";
          } else {
            leaderBoardFeature();
            document.getElementById("premiumUserText").innerText = `Hey ${
              userName.split(" ")[0]
            }, You Are A Premium User`;
            document.getElementById("premiumUser").style.display = "block";
          }

          const welcomeText = document.getElementById("welcomeText");
          if (!expenses.length) {
            welcomeText.innerText = `Hello, ${userName.split(" ")[0]}`;
            loadingExpense.innerHTML = "Add New Expenses Here!";
          } else {
            welcomeText.innerText = `Hello, ${userName.split(" ")[0]}`;
            loadingExpense.style.display = "none";

            expenses.forEach((expense) => {
              showExpensesOnScreen(expense);
              totalPrice += expense.amount;
            });
            showPagination(pageData);
          }
          totalExpense.innerHTML = rupee.format(totalPrice);
        }
      )
      .catch((err) => {
        totalExpense.innerHTML = rupee.format(totalPrice);
        console.log(err.message);
        setTimeout(() => {
          // window.location.replace("../login/login.html");
        }, 1500);
        loadingExpense.innerHTML = "Not authorized, please login again!";
      });
  }, 800);
}

function showPagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  lastPage,
  naxtPage,
  previousPage,
}) {
  // console.log(previousPage);
  const paginationDiv = document.createElement("div");
  paginationDiv.className = "g-2";
  paginationDiv.setAttribute("id", "paginationDiv");
  const expenseListDiv = document.getElementById("expenseList").parentElement;

  const expenseList = document.getElementById("expenseList");

  if (hasPreviousPage) {
    const btn1 = document.createElement("button");
    btn1.className = "btn btn-outline-primary";
    btn1.innerHTML = previousPage;
    btn1.addEventListener("click", () => {
      while (expenseList.lastElementChild) {
        expenseList.removeChild(expenseList.lastElementChild);
      }
      document.getElementById("paginationDiv").remove();
      showOnReload(previousPage);
    });
    paginationDiv.appendChild(btn1);
  }
  const btn2 = document.createElement("button");
  btn2.className = "btn btn-primary mx-2";
  btn2.innerHTML = currentPage;
  btn2.addEventListener("click", () => {
    while (expenseList.lastElementChild) {
      expenseList.removeChild(expenseList.lastElementChild);
    }
    document.getElementById("paginationDiv").remove();
    showOnReload(currentPage);
  });
  paginationDiv.appendChild(btn2);

  if (hasNextPage) {
    const btn3 = document.createElement("button");
    btn3.className = "btn btn-outline-primary";
    btn3.innerHTML = naxtPage;
    btn3.addEventListener("click", () => {
      while (expenseList.lastElementChild) {
        expenseList.removeChild(expenseList.lastElementChild);
      }
      document.getElementById("paginationDiv").remove();
      showOnReload(naxtPage);
    });
    paginationDiv.appendChild(btn3);
  }
  expenseListDiv.appendChild(paginationDiv);
  // console.log(expenseListDiv);
}

function getExpensesOnPagination(page) {
  axios
    .get(`http://localhost:3000/expense?page=${page}`, {
      headers: { Authorization: token },
    })
    .then(
      ({ data: { expenses, userName, isPremium, status, ...pageData } }) => {
        console.log(expenses);
      }
    );
}

/* LEADERBOARD FEATURES START */
function leaderBoardFeature() {
  axios
    .get("http://localhost:3000/expense/lb-users-expenses", {
      headers: { Authorization: token },
    })
    .then((users) => {
      // console.log(users.data);
      const lbDisplay = document.getElementById("lbDisplay");
      document.getElementById("lbUserList").remove();

      const lbUserList = document.createElement("ul");
      lbUserList.className = "list-unstyled list-group w-100";

      lbUserList.setAttribute("id", "lbUserList");
      lbUserList.innerHTML = `<li
      class="list-group-item d-flex justify-content-between list-group-item-dark fs-6 fw-bold">
        <span class="d-flex" style="width: 60%">
          <span style="width: 25%">Pos</span>
          <span>Name</span>
        </span>
        <span>Total Expenses</span>
    </li>`;
      lbDisplay.appendChild(lbUserList);

      let i = 0;
      users.data.users.forEach((user) => {
        const lbUser = document.createElement("li");
        lbUser.className =
          "list-group-item d-flex justify-content-between align-items-center list-group-item-danger";
        lbUser.innerHTML = `<span class="d-flex align-items-center" style="width: 75%"><span class='d-none'>${
          user.id
        }</span><span style="width: 20%">${(i += 1)}</span> <span>${
          user.name
        }</span></span> <span>${rupee.format(user.allExpenses)}</span>`;
        lbUserList.appendChild(lbUser);
      });
      lbDisplay.style.display = "block";
    })
    .catch((err) => console.log(err.message));
}
/* LEADERBOARD FEATURES END */

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
            const response = await axios.post(
              "http://localhost:3000/order/updatetrnasectionstatus",
              { order_id: options.order_id, payment_id: payment_id },
              {
                headers: { Authorization: token },
              }
            );
            document.getElementById("premiumUserText").innerText = `Hey ${
              response.data.userName.split(" ")[0]
            }, You Are A Premium User`;
            document.getElementById("getpremium").style.display = "none";
            document.getElementById("premiumUser").style.display = "block";

            document.getElementById("expenseList").style.marginBottom = "0";
            leaderBoardFeature();
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
