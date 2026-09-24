const message = document.getElementById("provided");

function forgotpassword(e) {
    e.preventDefault();
    console.log(e.target.name);
    const form = new FormData(e.target);

    const userDetails = {
        email: form.get("email"),

    }
    console.log(userDetails)
    axios.post('http://localhost:3000/forgotpassword',userDetails).then(response => {
        if(response.status === 202){
            message.textContent = "Mail Successfully Sent";
            message.style.color = 'green';
        } else {
            throw new Error('Something went wrong!!!')
        }
    }).catch(err => {
        message.textContent = err.message;;
        message.style.color = 'red';
    })
}