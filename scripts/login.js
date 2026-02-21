const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    loginError.classList.add("d-none");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u =>
        u.email.toLowerCase() === email &&
        u.password === password
    );

    if (!user) {
        loginError.classList.remove("d-none");
        return;
    }

    // Successful login
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "../index.html";
});