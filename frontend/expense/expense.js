const expense = document.getElementById('submitform');
const list = document.getElementById("list");
const leaderboard = document.getElementById("leaderboard");
let currentPage = 1;

expense.addEventListener('submit',  async (event) => {
    event.preventDefault();
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;

    const expenses = {
        amount,
        description
    }
    const token = localStorage.getItem('token');
    try{
        const response = await fetch("http://localhost:3000/users/expense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(expenses)
        });
        const data = await response.json();
        console.log(data);
        
        if (!response.ok) {
            console.error(data.message);
            return;
        }
        const expension = { amount, description, category: data.category };
        console.log("AI selected category:", data.category);
        displayExpense(expension);
        expense.reset();
    }catch(error){
        console.error("Error:", error);
    }


})

function displayExpense(expenses) {
    const li = document.createElement("li");
    li.className = "expense-item";
    const expenseText = document.createElement("div");
    expenseText.className = "expense-text";
    expenseText.textContent =
        `Amount: ₹${expenses.amount} | Description: ${expenses.description} | Category: ${expenses.category}`;
    const deletebtn = document.createElement("button");
    deletebtn.textContent = "Delete Expense";
    deletebtn.className = "delete-btn";
    li.appendChild(expenseText);
    li.appendChild(deletebtn);
    list.appendChild(li);
    deletebtn.addEventListener("click", async () => {
        const success = await deleteexpense(expenses);
        if (success) {
            getExpenses(currentPage);
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    limit = Number(document.getElementById("dynamicpage").value);
    getExpenses(1);
});

document.getElementById("dynamicpage").addEventListener("change", (event) => {
    limit = Number(event.target.value);
    getExpenses(1);
});

async function getExpenses(page) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(
            `http://localhost:3000/users/expense?page=${page}&limit=${limit}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        const data = await response.json();
        if (!response.ok) {
            console.error(data.message);
            return;
        }
        currentPage = data.currentPage;
        document.getElementById("list").innerHTML = "";
        data.expenses.forEach((expense) => {
            displayExpense(expense);
        });
        showPagination(data.currentPage, data.totalPages);
        return data;
    } catch (error) {
        console.error(error.message);
    }
}

function showPagination(currentPage, totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    if (currentPage > 1) {
        const previous = document.createElement("button");
        previous.textContent = "Previous";
        previous.onclick = () => {
            getExpenses(currentPage - 1);
        };
        pagination.appendChild(previous);
    }
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.onclick = () => {
            getExpenses(i);
        };
        pagination.appendChild(button);
    }
    if (currentPage < totalPages) {
        const next = document.createElement("button");
        next.textContent = "Next";
        next.onclick = () => {
            getExpenses(currentPage + 1);
        };
        pagination.appendChild(next);
    }
}

const deleteexpense= async (expense)=>{
    try{
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/users/expense/${expense.id}`,{
            method: "DELETE",
            headers: {"Authorization": `Bearer ${token}`}
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            console.error(data.message);
            return false;
        }
        await handleAfterDelete();
        return true;
    }catch(error){
       console.error(error);
    }
}

const handleAfterDelete = async () => {
    const data = await getExpenses(currentPage);
    if (currentPage>data.totalPages && currentPage > 1) {
        currentPage--;
        await getExpenses(currentPage);
    }
};

leaderboard.addEventListener("click", async () => {
    const token = localStorage.getItem('token');
    console.log("Leaderboard button clicked");
    try {
        const response = await fetch(
            "http://localhost:3000/users/premium/showleaderboard",{
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        console.log("HTTP status:", response.status);
        const data = await response.json();

        console.log("Response:", data);
        showleaderboard(data);
    } catch (error) {
        console.error("Error:", error);
    }
});


function showleaderboard(data) {
    const list = document.createElement("ul");
    list.className = "leaderboard-list";
    const div = document.getElementById("premium");
    div.innerHTML = "";
    const h2 = document.createElement("h2");
    h2.textContent = "🏆 Leaderboard";
    h2.className = "leaderboard-title";
    div.appendChild(h2);
    div.appendChild(list);
    data.forEach((user) => {
        const li = document.createElement("li");
        li.className = "leaderboard-item";
        li.textContent =
            `Name: ${user.name}  --  Total Expense: ₹${user.totalExpenses}`;
        list.appendChild(li);
    });
}


const downloadButton = document.getElementById("downloadexpenses");
const downloadResult = document.getElementById("downloadresult");

downloadButton.addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            downloadResult.textContent = "Please login first.";
            return;
        }

        const response = await fetch(
            "http://localhost:3000/users/expense/download",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            downloadResult.textContent =
                data.message || "Unable to generate expense file.";
            return;
        }

        downloadResult.innerHTML = "";

        const message = document.createElement("p");
        message.textContent = data.message;

        const link = document.createElement("a");
        link.href = data.fileUrl;
        link.textContent = "Open Expense File";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        downloadResult.appendChild(message);
        downloadResult.appendChild(link);

    } catch (error) {
        console.error("Download error:", error);
        downloadResult.textContent =
            "Unable to generate expense file.";
    }
});



const showDownloads = document.getElementById("showdownloads");
const downloadList = document.getElementById("downloadlist");

showDownloads.addEventListener("click", async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            downloadList.textContent = "Please login first.";
            return;
        }

        const response = await fetch(
            "http://localhost:3000/users/expense/downloads",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            downloadList.textContent =
                data.message || "Unable to fetch files.";
            return;
        }

        downloadList.innerHTML = "";

        if (!data.files || data.files.length === 0) {
            downloadList.textContent = "No expense files found.";
            return;
        }

        data.files.forEach((file) => {

            const item = document.createElement("div");

            const name = document.createElement("p");
            name.textContent =
                `File: ${file.fileName.split("/").pop()}`;

            const date = document.createElement("p");
            date.textContent =
                `Created: ${new Date(file.createdAt).toLocaleString()}`;

            const link = document.createElement("a");
            link.href = file.fileUrl;
            link.textContent = "Open File";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            item.appendChild(name);
            item.appendChild(date);
            item.appendChild(link);

            downloadList.appendChild(item);
        });

    } catch (error) {
        console.error("Error:", error);
        downloadList.textContent =
            "Unable to load downloaded files.";
    }
});