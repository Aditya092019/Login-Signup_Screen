const expense = document.getElementById('submitform');
const list = document.getElementById("list");

expense.addEventListener('submit',  async (event) => {
    event.preventDefault();
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;

    const expenses = {
        amount,
        description,
        category
    }

    try{
        const response = await fetch("http://localhost:3000/users/expense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expenses)
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            message.textContent = data.message;
            return;
        }
        displayExpense(expenses)
        expense.reset();
    }catch(error){
        console.error("Error:", error);
    }


})

function displayExpense(expenses){
    const deletebtn = document.createElement('button');
    deletebtn.textContent = 'Delete';
    const li = document.createElement("li");
    li.textContent = `Amount: ${expenses.amount}, Description: ${expenses.description}, Category: ${expenses.category}`;
    li.appendChild(deletebtn);
    list.appendChild(li);
}

document.addEventListener("DOMContentLoaded", async() => {

    console.log("DOM loaded");
    try{
        const response = await fetch( "http://localhost:3000/users/expense" );
        const data = await response.json(); 
        console.log(data);
        if (!response.ok) { console.error(data.message); return; }
        data.expenses.forEach((expense) => { displayExpense(expense); });
    }catch(error) {
        console.error(error.message);
    };
})

