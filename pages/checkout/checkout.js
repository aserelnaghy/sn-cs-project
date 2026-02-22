(function () {
    const SB_API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
    const SB_REST_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";

    const subtotalEl = document.getElementById("order-subtotal");
    const btn = document.getElementById("place-order-btn");
    const errorEl = document.getElementById("order-error");

    let subtotal = 0;

    function getAccessToken() {
        try {
            const s = JSON.parse(localStorage.getItem("sb_session"));
            return s?.access_token || null;
        } catch {
            return null;
        }
    }

    function authHeaders(token) {
        return {
            apikey: SB_API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    // ---------- subtotal ----------
    async function loadSubtotal() {
        const token = getAccessToken();
        if (!token) {
            // no guest checkout in DB-cart setup
            window.location.href = "../Login/login.html";
            return;
        }

        subtotalEl.textContent = "—";
        subtotal = 0;

        // 1) cart items
        const itemsRes = await fetch(
            `${SB_REST_URL}/cart_items?select=product_id,quantity`,
            { headers: authHeaders(token) }
        );

        if (!itemsRes.ok) {
            if (itemsRes.status === 401) {
                localStorage.removeItem("sb_session");
                localStorage.removeItem("sb_user");
                window.location.href = "../Login/login.html";
                return;
            }
            subtotalEl.textContent = "—";
            return;
        }

        const items = await itemsRes.json();
        if (!Array.isArray(items) || items.length === 0) {
            subtotalEl.textContent = "0$";
            subtotal = 0;
            return;
        }

        // 2) fetch prices in one query (IN) instead of N fetches
        const ids = [...new Set(items.map(i => i.product_id))].filter(Boolean);
        const inFilter = `(${ids.join(",")})`;

        const productsRes = await fetch(
            `${SB_REST_URL}/products?select=id,price&id=in.${encodeURIComponent(inFilter)}`,
            { headers: authHeaders(token) }
        );

        if (!productsRes.ok) {
            subtotalEl.textContent = "—";
            return;
        }

        const productsArr = await productsRes.json();
        const priceMap = Object.fromEntries(
            (productsArr || []).map(p => [p.id, Number(p.price) || 0])
        );

        subtotal = items.reduce((sum, item) => {
            const price = priceMap[item.product_id] || 0;
            return sum + price * (Number(item.quantity) || 0);
        }, 0);

        subtotalEl.textContent = `${subtotal}$`;
    }

    // ---------- validation ----------
    const fields = ["first-name", "last-name", "address", "city", "zip", "country", "phone"];

    function validateForm() {
        let valid = true;
        fields.forEach((fieldId) => {
            const input = document.getElementById(fieldId);
            const err = document.getElementById(`${fieldId}-error`);
            if (!input.value.trim()) {
                input.classList.add("invalid");
                err.style.display = "block";
                valid = false;
            } else {
                input.classList.remove("invalid");
                err.style.display = "none";
            }
        });
        return valid;
    }

    fields.forEach((fieldId) => {
        const el = document.getElementById(fieldId);
        if (!el) return;
        el.addEventListener("input", () => {
            if (el.value.trim()) {
                el.classList.remove("invalid");
                const err = document.getElementById(`${fieldId}-error`);
                if (err) err.style.display = "none";
            }
        });
    });

    // ---------- create order ----------
    async function placeOrder() {
        if (!validateForm()) return;

        const token = getAccessToken();
        if (!token) {
            window.location.href = "../Login/login.html";
            return;
        }

        btn.disabled = true;
        btn.textContent = "PLACING ORDER...";
        errorEl.textContent = "";

        try {
            // Ensure subtotal loaded
            if (!subtotal || subtotal <= 0) {
                await loadSubtotal();
            }

            if (!subtotal || subtotal <= 0) {
                throw new Error("Your cart is empty.");
            }

            const res = await fetch(`${SB_REST_URL}/rpc/create_order`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({
                    p_total: subtotal,

                    // OPTIONAL: if your RPC supports address fields, pass them
                    // p_first_name: document.getElementById("first-name").value.trim(),
                    // p_last_name: document.getElementById("last-name").value.trim(),
                    // p_address: document.getElementById("address").value.trim(),
                    // p_address2: document.getElementById("address2").value.trim(),
                    // p_city: document.getElementById("city").value.trim(),
                    // p_zip: document.getElementById("zip").value.trim(),
                    // p_country: document.getElementById("country").value.trim(),
                    // p_phone: document.getElementById("phone").value.trim(),
                }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem("sb_session");
                    localStorage.removeItem("sb_user");
                    throw new Error("Session expired. Please login again.");
                }
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message || `Error ${res.status}`);
            }

            // If your create_order RPC already clears cart_items, stop here.
            // If not, clear cart_items explicitly:
            await fetch(`${SB_REST_URL}/cart_items`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            // Update navbar count if components.js provides it
            if (typeof updateBagCount === "function") await updateBagCount();

            window.location.href = "../bag/index.html";
        } catch (err) {
            errorEl.textContent = err?.message || "Something went wrong, please try again.";
            btn.disabled = false;
            btn.textContent = "PLACE ORDER";
        }
    }

    // events
    btn.addEventListener("click", placeOrder);

    // init
    document.addEventListener("DOMContentLoaded", async () => {
        await loadSubtotal();
        // also keep navbar cart count correct
        if (typeof updateBagCount === "function") await updateBagCount();
    });
})();