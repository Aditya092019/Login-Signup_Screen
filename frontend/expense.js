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
    deletebtn.textContent = ' Delete Expense ';
    const li = document.createElement("li");
    li.textContent = `Amount: ${expenses.amount} --- Description: ${expenses.description} --- Category: ${expenses.category}---`;
    li.appendChild(deletebtn);
    list.appendChild(li);
    deletebtn.addEventListener("click", ()=>{
        deleteexpense(expenses);
        li.remove();
    })
}

document.addEventListener("DOMContentLoaded", async() => {
    const token = localStorage.getItem('token');
    console.log("DOM loaded");
    try{
        const response = await fetch( "http://localhost:3000/users/expense", {headers: {"Authorization": `Bearer ${token}`}});
        const data = await response.json(); 
        console.log(data);
        if (!response.ok) { console.error(data.message); return; }
        data.expenses.forEach((expense) => { displayExpense(expense); });
    }catch(error) {
        console.error(error.message);
    };
})


const deleteexpense= async (expense)=>{
    try{
        const response = await fetch(`http://localhost:3000/users/expense/${expense.id}`,{
            method: "DELETE"
        });
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            console.error(data.message);
            return false;
        }
        return true;
    }catch(error){
       console.error(error);
    }
}


