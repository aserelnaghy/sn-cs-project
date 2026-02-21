async function loadComponent(id, file) {
    try {
        const res = await fetch(file);
        const html = await res.text();
        document.getElementById(id).innerHTML = html;
    } catch (err) {
        console.error("Component load error:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadComponent("navbar", "/components/navbar.html");
    await loadComponent("footer", "/components/footer.html");

    updateBagCount();
    renderNavAuth();
});

function getSupabaseUser() {
    const rawUser = localStorage.getItem("sb_user");
    if (rawUser) {
        try { return JSON.parse(rawUser); } catch { }
    }

    const rawSession = localStorage.getItem("sb_session");
    if (rawSession) {
        try {
            const s = JSON.parse(rawSession);
            return s?.user || null;
        } catch { }
    }

    return null;
}


function getSupabaseUser() {
    // Preferred: sb_user
    const sbUserRaw = localStorage.getItem("sb_user");
    if (sbUserRaw) {
        try { return JSON.parse(sbUserRaw); } catch { }
    }

    // Fallback: session.user
    const sessionRaw = localStorage.getItem("sb_session");
    if (sessionRaw) {
        try {
            const s = JSON.parse(sessionRaw);
            return s?.user || null;
        } catch { }
    }

    // Compatibility fallback if you kept it
    const currentRaw = localStorage.getItem("currentUser");
    if (currentRaw) {
        try { return JSON.parse(currentRaw); } catch { }
    }

    return null;
}


function renderNavAuth() {
    const slot = document.getElementById("navUserSlot");
    if (!slot) return;

    const user = getSupabaseUser();

    if (!user) {
        // NOT LOGGED IN: show icon + "Sign in"
        slot.innerHTML = `
      <a href="../Login/login.html" class="z-icon-btn d-flex align-items-center gap-2" aria-label="Sign in">
        <i class="bi bi-person-circle"></i>
        <span class="d-none d-md-inline">Sign in</span>
      </a>
    `;
        return;
    }

    // LOGGED IN: show "Sign out" text (no icon if you prefer)
    slot.innerHTML = `
    <button type="button"
      class="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 z-signout"
      id="navSignOutBtn" aria-label="Sign out">
      <span class="d-none d-md-inline">Sign out</span>
    </button>
  `;

    const btn = document.getElementById("navSignOutBtn");
    if (btn) btn.addEventListener("click", logout);
}

function shortName(name) {
    // keeps navbar tidy
    const s = String(name).trim();
    if (s.length <= 16) return s;
    return s.slice(0, 16) + "…";
}

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function logout() {
    localStorage.removeItem("sb_session");
    localStorage.removeItem("sb_user");

    window.location.href = "../Login/login.html";
}

function cartKey() {
    const u = getSupabaseUser();
    return u?.id ? `cart_${u.id}` : "cart_guest";
}

function getCart() {
    return JSON.parse(localStorage.getItem(cartKey())) || [];
}

function updateBagCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    const el = document.getElementById("bagCount");
    if (el) el.textContent = String(count);
}