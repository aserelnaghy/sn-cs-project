
(function () {
    const bagCountEl = document.getElementById("bagCount");

    const welcomeMeta = document.getElementById("welcomeMeta");
    const notLoggedIn = document.getElementById("notLoggedIn");
    const profileForm = document.getElementById("profileForm");

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");

    const logoutBtn = document.getElementById("logoutBtn");
    const saveToast = document.getElementById("saveToast");

    const prefEmails = document.getElementById("prefEmails");
    const prefOffers = document.getElementById("prefOffers");
    const savePrefsBtn = document.getElementById("savePrefsBtn");
    const prefsToast = document.getElementById("prefsToast");

    const ordersList = document.getElementById("ordersList");
    const ordersEmpty = document.getElementById("ordersEmpty");
    const ordersCount = document.getElementById("ordersCount");

    function getLS(key, fallback) {
        try {
            const v = JSON.parse(localStorage.getItem(key));
            return v ?? fallback;
        } catch {
            return fallback;
        }
    }

    function setLS(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // --- Bag count ---
    function updateBagCount() {
        const cart = getLS("cart", []);
        const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
        bagCountEl.textContent = `(${count})`;
    }

    // --- Validation ---
    function isValidEmail(email) {
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

    function validateName() {
        const v = fullNameInput.value.trim();
        if (!v || v.length < 3) {
            setInvalid(fullNameInput, nameError, "Name is required (min 3 chars).");
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
            setInvalid(emailInput, emailError, "Please enter a valid email.");
            return false;
        }
        setValid(emailInput);
        return true;
    }

    function showToast(el) {
        el.classList.remove("d-none");
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.add("d-none"), 1800);
    }

    // --- Auth / Profile ---
    function loadProfile() {
        const currentUser = getLS("currentUser", null);

        if (!currentUser) {
            welcomeMeta.textContent = "Not signed in";
            notLoggedIn.classList.remove("d-none");
            profileForm.classList.add("d-none");
            return;
        }

        // Support both {fullName,email} and {id,fullName,email}
        const name = currentUser.fullName || currentUser.name || "";
        const email = currentUser.email || "";

        welcomeMeta.textContent = `Signed in as ${email || "user"}`;

        notLoggedIn.classList.add("d-none");
        profileForm.classList.remove("d-none");

        fullNameInput.value = name;
        emailInput.value = email;

        // Preferences stored in currentUser.preferences
        const prefs = currentUser.preferences || {};
        prefEmails.checked = !!prefs.emails;
        prefOffers.checked = !!prefs.offers;
    }

    function saveProfileChanges() {
        const ok = validateName() && validateEmail();
        if (!ok) return;

        const users = getLS("users", []);
        const currentUser = getLS("currentUser", null);
        if (!currentUser) return;

        const updated = {
            ...currentUser,
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim().toLowerCase()
        };

        // If you store users array, update matching user record by id OR email
        const newUsers = users.map(u => {
            const sameId = updated.id && u.id && u.id === updated.id;
            const sameEmail = (u.email || "").toLowerCase() === (currentUser.email || "").toLowerCase();
            return (sameId || sameEmail) ? { ...u, ...updated } : u;
        });

        setLS("users", newUsers);
        setLS("currentUser", updated);

        welcomeMeta.textContent = `Signed in as ${updated.email}`;
        showToast(saveToast);
    }

    function logout() {
        localStorage.removeItem("currentUser");
        window.location.href = "./login.html";
    }

    // --- Orders ---
    function renderOrders() {
        const currentUser = getLS("currentUser", null);
        const orders = getLS("orders", []);

        // Filter orders for current user if email exists, else show none
        const myOrders = currentUser?.email
            ? orders.filter(o => (o.user?.email || o.email || "").toLowerCase() === currentUser.email.toLowerCase())
            : [];

        ordersCount.textContent = `${myOrders.length} ${myOrders.length === 1 ? "order" : "orders"}`;

        if (!myOrders.length) {
            ordersEmpty.classList.remove("d-none");
            ordersList.innerHTML = "";
            return;
        }

        ordersEmpty.classList.add("d-none");

        // newest first
        myOrders.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));

        ordersList.innerHTML = myOrders.map(order => {
            const id = order.orderId || order.id || "—";
            const date = order.createdAt || order.date || "";
            const niceDate = date ? new Date(date).toLocaleString() : "—";
            const total = typeof order.total === "number" ? order.total : Number(order.total || 0);

            const items = Array.isArray(order.items) ? order.items : [];
            const itemsText = items.length
                ? items.slice(0, 3).map(i => `${i.title || "Item"} × ${i.qty || 1}`).join(" • ")
                : "No items saved";

            return `
        <div class="z-order">
          <div class="z-order-top">
            <div>
              <div class="z-order-id">ORDER ${String(id).toUpperCase()}</div>
              <div class="z-order-date">${niceDate}</div>
            </div>
            <div class="z-order-id">${total.toFixed(2)}$</div>
          </div>
          <p class="z-order-items">${itemsText}${items.length > 3 ? " …" : ""}</p>
        </div>
      `;
        }).join("");
    }

    function savePreferences() {
        const currentUser = getLS("currentUser", null);
        if (!currentUser) return;

        const updated = {
            ...currentUser,
            preferences: {
                ...(currentUser.preferences || {}),
                emails: prefEmails.checked,
                offers: prefOffers.checked
            }
        };

        // Keep users array in sync too
        const users = getLS("users", []);
        const newUsers = users.map(u => {
            const sameId = updated.id && u.id && u.id === updated.id;
            const sameEmail = (u.email || "").toLowerCase() === (currentUser.email || "").toLowerCase();
            return (sameId || sameEmail) ? { ...u, ...updated } : u;
        });

        setLS("users", newUsers);
        setLS("currentUser", updated);

        showToast(prefsToast);
    }

    // Events
    if (profileForm) {
        fullNameInput.addEventListener("input", validateName);
        emailInput.addEventListener("input", validateEmail);

        profileForm.addEventListener("submit", function (e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }

    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (savePrefsBtn) savePrefsBtn.addEventListener("click", savePreferences);

    // Init
    updateBagCount();
    loadProfile();
    renderOrders();
})();