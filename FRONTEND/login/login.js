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

      // console.log(user.data.token);
      if (user.data.userDetails) {
        msg.className = "bg-success text-white p-1 px-2";

        localStorage.setItem("token", user.data.token);

        email.value = "";
        password.value = "";
        setTimeout(() => {
          window.location.replace("../expense/expense.html");
        }, 1000);
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
