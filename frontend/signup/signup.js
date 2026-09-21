const form = document.getElementById("signupform");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    console.log("FORM SUBMITTED");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const user = {
        name,
        email,
        password
    };

    try {
        const response = await fetch("http://localhost:3000/users/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            throw new Error("Network response is not ok");
        }

        const data = await response.json();

        console.log(data);

        message.textContent = data.message;
        alert('User registered successfully');
        form.reset();
        window.location.href = "../Login/login.html";
    } catch (error) {
        console.error("Error:", error);
        message.textContent = "Something went wrong";
    }

});