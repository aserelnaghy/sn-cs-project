(function () {
    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    function isValidEmail(email) {
        // email regex
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return re.test(String(email).trim());
    }

    function setInvalid(input, errorEl, message) {
        input.classList.add("is-invalid");
        if (message) errorEl.textContent = message;
    }

    function setValid(input) {
        input.classList.remove("is-invalid");
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        if (!value) {
            setInvalid(emailInput, emailError, "Email is required.");
            return false;
        }
        if (!isValidEmail(value)) {
            setInvalid(emailInput, emailError, "Please enter a valid email address.");
            return false;
        }
        setValid(emailInput);
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        if (!value) {
            setInvalid(passwordInput, passwordError, "Password is required.");
            return false;
        }
        if (value.length < 6) {
            setInvalid(passwordInput, passwordError, "Password must be at least 6 characters.");
            return false;
        }
        setValid(passwordInput);
        return true;
    }

    // Live validation
    // emailInput.addEventListener("input", validateEmail);
    // passwordInput.addEventListener("input", validatePassword);

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const okEmail = validateEmail();
        const okPassword = validatePassword();

        if (!okEmail || !okPassword) return;

        // Simulated login success (no backend)
        const loginPayload = {
            email: emailInput.value.trim(),
            loggedInAt: new Date().toISOString()
        };
        localStorage.setItem("currentUser", JSON.stringify(loginPayload));


        window.location.href = "../index.html";
    });
})();