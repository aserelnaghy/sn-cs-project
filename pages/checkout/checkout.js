const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
const BASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";
const JWT = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjA0YjI1MTg4LWMzZTItNDZkNi05MjRjLWFlZjc4NDU1ZDdkZCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FqdXhidGlmd2lwcW13bXNycWNnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNjk3Nzc3LCJpYXQiOjE3NzE2OTQxNzcsImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MTY5NDE3N31dLCJzZXNzaW9uX2lkIjoiOWVjMGExMjEtZjZlOC00ZTY4LWJmZGYtMDJiNzU1MDMzN2I2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.ZL463ABOFMDyZwKW_XoZx5A0atgYuwtSB2xUHz1t1HKlTvwDsXqLcWbCgDjY0SLpRo5tTkOMk6Z9UlMdzKi-fw";

let token = JWT;
try {
    const raw = localStorage.getItem("zawq-token");
    if (raw) token = JSON.parse(raw)?.access_token ?? JWT;
} catch {}

const headers = {
    "apikey": API_KEY,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
};

let subtotal = 0;

async function loadSubtotal() {
    const itemsRes = await fetch(`${BASE_URL}/cart_items?select=id,product_id,quantity`, { headers });
    const items = await itemsRes.json();

    if (!items.length) return;

    const productIds = [...new Set(items.map(i => i.product_id))];
    const productsArr = await Promise.all(
        productIds.map(id =>
            fetch(`${BASE_URL}/products?id=eq.${id}&select=id,price`, { headers })
                .then(res => res.json())
                .then(data => data[0])
        )
    );

    const products = Object.fromEntries(productsArr.map(p => [p.id, p]));
    subtotal = items.reduce((sum, item) => sum + products[item.product_id].price * item.quantity, 0);
    document.getElementById("order-subtotal").textContent = `${subtotal}$`;
}

const fields = ["first-name", "last-name", "address", "city", "zip", "country", "phone"];

function validateForm() {
    let valid = true;
    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const error = document.getElementById(`${fieldId}-error`);
        if (!input.value.trim()) {
            input.classList.add("invalid");
            error.style.display = "block";
            valid = false;
        } else {
            input.classList.remove("invalid");
            error.style.display = "none";
        }
    });
    return valid;
}

// clear error on each field as user types
fields.forEach(fieldId => {
    document.getElementById(fieldId).addEventListener("input", () => {
        const input = document.getElementById(fieldId);
        if (input.value.trim()) {
            input.classList.remove("invalid");
            document.getElementById(`${fieldId}-error`).style.display = "none";
        }
    });
});

document.getElementById("place-order-btn").addEventListener("click", async () => {
    if (!validateForm()) return;

    const btn = document.getElementById("place-order-btn");
    const errorEl = document.getElementById("order-error");

    btn.disabled = true;
    btn.textContent = "PLACING ORDER...";
    errorEl.textContent = "";

    try {
        const res = await fetch(`${BASE_URL}/rpc/create_order`, {
            method: "POST",
            headers,
            body: JSON.stringify({ p_total: subtotal })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message ?? `Error ${res.status}`);
        }

        // clear the cart after order is placed
        const cartRes = await fetch(`${BASE_URL}/cart_items?select=id`, { headers });
        const cartItems = await cartRes.json();

        await Promise.all(
            cartItems.map(item =>
                fetch(`${BASE_URL}/cart_items?id=eq.${item.id}`, { method: "DELETE", headers })
            )
        );

        window.location.href = "../bag/index.html";

    } catch (err) {
        errorEl.textContent = err.message ?? "Something went wrong, please try again.";
        btn.disabled = false;
        btn.textContent = "PLACE ORDER";
    }
});

loadSubtotal();
