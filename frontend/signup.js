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
        const response = await axios.post(
            "http://localhost:3000/users/signup",
            user
        );
        console.log(response.data);
        message.textContent = response.data.message;
        form.reset();
    } catch (error) {
        console.log(error);
        if (error.response) {
            message.textContent = error.response.data.message;
        } else {
            message.textContent = "Something went wrong";
        }
    }
})