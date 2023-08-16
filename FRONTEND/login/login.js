const form = document.getElementById("form-submit");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = document.getElementById("msg");

  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const userObj = {
    email: email.value,
    password: password.value,
  };

  axios
    .post("http://localhost:3000/user/login", userObj)
    .then((user) => {
      msg.innerHTML = user.data.message;
      if (user.data.user) {
        msg.className = "bg-success text-white p-1 px-2";

        email.value = "";
        password.value = "";

        window.location.href =
          "D:/Desktop 2023/Sharpener Web Starting/Learning Express JS/Expense Tracking App/FRONTEND/expense/expense.html";
      } else msg.className = "bg-danger text-white p-1 px-2";

      msg.style.display = "block";
      // Remove msg after 3 seconds
      setTimeout(() => {
        msg.style.display = "none";
        msg.innerHTML = "";
      }, 3000);
    })
    .catch((err) => console.log(err.message));
});
