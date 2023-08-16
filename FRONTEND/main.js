const form = document.getElementById("form-submit");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = document.getElementById("msg");
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const phone = document.getElementById("phone");

  const userObj = {
    name: name.value,
    email: email.value,
    password: password.value,
    phone: phone.value,
  };

  axios
    .post("http://localhost:3000/user/signup", userObj)
    .then((user) => {
      msg.innerHTML = user.data.message;
      msg.style.display = "block";
      // Remove error after 3 seconds
      setTimeout(() => {
        msg.style.display = "none";
        msg.innerHTML = "";
      }, 3000);

      if (user.data.user) {
        name.value = "";
        email.value = "";
        password.value = "";
        phone.value = "";
      }
    })
    .catch((err) => console.log(err.messame));
});
