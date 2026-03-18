const bountyForm = document.getElementById("bounty");
fetch("http://127.0.0.1:8000/user")
    .then(response => response.json())
    .then(data => {
        console.log(data);
    bountyForm.textContent = "Bounty: " + data.bounty;
    })