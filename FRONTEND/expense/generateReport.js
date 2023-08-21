const token = localStorage.getItem("token");

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  if (token) localStorage.setItem("token", "");
  window.location.replace("../login/login.html");
});

const profilePic = document.getElementById("profilePic");
profilePic.addEventListener("click", () => {
  const welcomeDiv = document.getElementById("welcomeDiv");
  welcomeDiv.classList.toggle("profileShow");
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await axios(
      "http://localhost:3000/user/expense-report-downloaded-list",
      {
        headers: { Authorization: token },
      }
    );

    const downloadReportDiv = document.getElementById("downloadReportDiv");
    const downloadReport = document.createElement("button");
    downloadReport.className = "btn btn-primary mb-4";
    downloadReport.innerHTML =
      'Download Report <i class="fa fa-arrow-alt-circle-down ms-2"></i>';
    downloadReportDiv.appendChild(downloadReport);

    const h3 = document.createElement("h3");
    h3.className = "w-100 fw-bold mt-2";
    h3.textContent = "Previous Downloads";

    downloadReportDiv.appendChild(h3);
    const allExpensesList = response.data.expenseList;
    console.log(allExpensesList);

    let i = 0;
    allExpensesList.forEach((expense) => {
      console.log(expense);
      const a = document.createElement("a");
      a.className = "list-group-item border-0 ps-0 pb-0 w-100";
      a.href = `${expense.fileUrl}`;
      a.innerHTML = `♦ Expense ${(i += 1)} - <span class="fw-bold">Downloaded On:</span> ${new Date(
        expense.createdAt
      ).toDateString()}`;

      downloadReportDiv.appendChild(a);
    });

    downloadReport.addEventListener("click", async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/user/downloadexpensesreport",
          {
            headers: { Authorization: token },
          }
        );
        if (response.status === 200) {
          console.log(response);
          var a = document.createElement("a");
          a.href = response.data.fileUrl;
          //   a.download = "myExpense.csv";
          a.click();
          alert("Successfully Download");
        }
      } catch (error) {
        console.log(error);
        alert("Download Failed");
      }
    });
  } catch (error) {
    console.log(error);
    // window.location.replace("../login/login.html");
  }
});
