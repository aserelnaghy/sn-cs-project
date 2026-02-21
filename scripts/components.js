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

function updateBagCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

    const el = document.getElementById("bagCount");
    if (el) el.textContent = `(${count})`;
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
    const container = document.getElementById("navAuthArea");
    if (!container) return;

    const user = getSupabaseUser();

    if (!user) {
        // NOT logged in
        container.innerHTML = `
      <a class="z-usericon" href="/pages/login.html" aria-label="Login">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span class="ms-1">Login</span>
      </a>
    `;
        return;
    }

    // LOGGED IN
    const name =
        user?.user_metadata?.name ||
        user?.user_metadata?.fullName ||
        user?.fullName ||
        user?.email ||
        "Account";

    container.innerHTML = `
    <a class="z-usericon" href="/pages/profile.html" aria-label="Profile">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span class="ms-1">${escapeHtml(shortName(name))}</span>
    </a>

    <button class="btn z-nav-logout" type="button" id="logoutBtn">
      Logout
    </button>
  `;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
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

async function logout() {
    // Optional: call Supabase logout endpoint to revoke refresh token
    // If you don't care, you can just clear storage.

    localStorage.removeItem("sb_session");
    localStorage.removeItem("sb_user");
    localStorage.removeItem("currentUser");

    // Redirect to login (or home)
    window.location.href = "/index.html";
}