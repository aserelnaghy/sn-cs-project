const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
const BASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";
const JWT = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjA0YjI1MTg4LWMzZTItNDZkNi05MjRjLWFlZjc4NDU1ZDdkZCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FqdXhidGlmd2lwcW13bXNycWNnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNjk3Nzc3LCJpYXQiOjE3NzE2OTQxNzcsImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MTY5NDE3N31dLCJzZXNzaW9uX2lkIjoiOWVjMGExMjEtZjZlOC00ZTY4LWJmZGYtMDJiNzU1MDMzN2I2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.ZL463ABOFMDyZwKW_XoZx5A0atgYuwtSB2xUHz1t1HKlTvwDsXqLcWbCgDjY0SLpRo5tTkOMk6Z9UlMdzKi-fw";

let token = JWT;
try {
    const raw = localStorage.getItem("zawq-token");
    if (raw) token = JSON.parse(raw)?.access_token ?? JWT;
} catch {}

function formatDate(str) {
    return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function getStatusClass(status) {
    if (!status) return "status-default";
    const s = status.toLowerCase();
    if (s === "pending") return "status-pending";
    if (s === "confirmed") return "status-confirmed";
    if (s === "shipped") return "status-shipped";
    if (s === "delivered") return "status-delivered";
    if (s === "cancelled") return "status-cancelled";
    return "status-default";
}

async function loadOrders() {
    const res = await fetch(`${BASE_URL}/orders?select=*&order=created_at.desc`, {
        headers: {
            "apikey": API_KEY,
            "Authorization": `Bearer ${token}`
        }
    });
    const orders = await res.json();

    const list = document.getElementById("orders-list");

    if (!orders.length) {
        list.innerHTML = `<p class="empty-state mt-2">You have no orders yet.</p>`;
        return;
    }

    orders.forEach(order => {
        const col = document.createElement("div");
        col.className = "col-12 mb-3";
        col.innerHTML = `
            <div class="order-card">
                <div class="order-card-left">
                    <p class="order-id">Order #${order.id}</p>
                    <p class="order-date">${formatDate(order.created_at)}</p>
                </div>
                <div class="order-card-right">
                    <p class="order-total">${order.total_amount}$</p>
                    ${order.status ? `<span class="order-status ${getStatusClass(order.status)}">${order.status}</span>` : ""}
                </div>
            </div>
        `;
        list.appendChild(col);
    });
}

loadOrders();
