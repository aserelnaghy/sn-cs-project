
(function () {
    const form = document.getElementById("registerForm");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmError = document.getElementById("confirmError");

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return re.test(String(email).trim());
    }

    function hasLettersAndNumbers(str) {
        return /[A-Za-z]/.test(str) && /\d/.test(str);
    }

    function setInvalid(input, errorEl, message) {
        input.classList.add("is-invalid");
        if (message) errorEl.textContent = message;
    }

    function setValid(input) {
        input.classList.remove("is-invalid");
    }

    function validateName() {
        const v = fullNameInput.value.trim();
        if (!v) {
            setInvalid(fullNameInput, nameError, "Full name is required.");
            return false;
        }
        if (v.length < 3) {
            setInvalid(fullNameInput, nameError, "Full name must be at least 3 characters.");
            return false;
        }
        setValid(fullNameInput);
        return true;
    }

    function validateEmail() {
        const v = emailInput.value.trim();
        if (!v) {
            setInvalid(emailInput, emailError, "Email is required.");
            return false;
        }
        if (!isValidEmail(v)) {
            setInvalid(emailInput, emailError, "Please enter a valid email address.");
            return false;
        }
        setValid(emailInput);
        return true;
    }

    function validatePassword() {
        const v = passwordInput.value;
        if (!v) {
            setInvalid(passwordInput, passwordError, "Password is required.");
            return false;
        }
        if (v.length < 6) {
            setInvalid(passwordInput, passwordError, "Password must be at least 6 characters.");
            return false;
        }
        if (!hasLettersAndNumbers(v)) {
            setInvalid(passwordInput, passwordError, "Password must include letters and numbers.");
            return false;
        }
        setValid(passwordInput);
        return true;
    }

    function validateConfirm() {
        const p = passwordInput.value;
        const c = confirmInput.value;
        if (!c) {
            setInvalid(confirmInput, confirmError, "Please confirm your password.");
            return false;
        }
        if (p !== c) {
            setInvalid(confirmInput, confirmError, "Passwords must match.");
            return false;
        }
        setValid(confirmInput);
        return true;
    }

    // Live validation
    fullNameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    passwordInput.addEventListener("input", () => {
        validatePassword();
        // keep confirm in sync while typing password
        if (confirmInput.value) validateConfirm();
    });
    confirmInput.addEventListener("input", validateConfirm);

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem("users")) || [];
        } catch {
            return [];
        }
    }

    function setUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const ok =
            validateName() &&
            validateEmail() &&
            validatePassword() &&
            validateConfirm();

        if (!ok) return;

        const users = getUsers();
        const email = emailInput.value.trim().toLowerCase();

        const exists = users.some(u => (u.email || "").toLowerCase() === email);
        if (exists) {
            setInvalid(emailInput, emailError, "This email is already registered. Please sign in.");
            return;
        }

        const newUser = {
            id: crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            fullName: fullNameInput.value.trim(),
            email: email,
            password: passwordInput.value,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        setUsers(users);

        localStorage.setItem("currentUser", JSON.stringify({
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email
        }));

        window.location.href = "../index.html";
    });
})();