const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
const BASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";
const JWT = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjA0YjI1MTg4LWMzZTItNDZkNi05MjRjLWFlZjc4NDU1ZDdkZCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FqdXhidGlmd2lwcW13bXNycWNnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNjk3Nzc3LCJpYXQiOjE3NzE2OTQxNzcsImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MTY5NDE3N31dLCJzZXNzaW9uX2lkIjoiOWVjMGExMjEtZjZlOC00ZTY4LWJmZGYtMDJiNzU1MDMzN2I2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.ZL463ABOFMDyZwKW_XoZx5A0atgYuwtSB2xUHz1t1HKlTvwDsXqLcWbCgDjY0SLpRo5tTkOMk6Z9UlMdzKi-fw";

async function loadBag() {
    let token = JWT;
    try {
        const raw = localStorage.getItem("zawq-token");
        if (raw) token = JSON.parse(raw)?.access_token ?? JWT;
    } catch {}

    const headers = {
        "apikey": API_KEY,
        "Authorization": `Bearer ${token}`
    };

    const itemsRes = await fetch(
        `${BASE_URL}/cart_items?select=id,product_id,quantity,size&order=created_at.desc`,
        { headers }
    );
    const items = await itemsRes.json();

    // get unique product ids then fetch each one
    const productIds = [...new Set(items.map(item => item.product_id))];
    const productFetches = productIds.map(id =>
        fetch(`${BASE_URL}/products?id=eq.${id}&select=id,title,price,image_url`, { headers })
            .then(res => res.json())
            .then(data => data[0])
    );
    const productsArr = await Promise.all(productFetches);
    const products = Object.fromEntries(productsArr.map(p => [p.id, p]));

    const list = document.getElementById("bag-items-list");
    const countEl = document.getElementById("items-count");
    const subtotalEl = document.getElementById("order-subtotal");
    const checkoutBtn = document.querySelector(".order-summary-checkout-btn");

    if (!items.length) {
        list.innerHTML = `<p class="text-muted">Your bag is empty.</p>`;
        countEl.textContent = "0 ITEMS";
        subtotalEl.textContent = "0$";
        checkoutBtn.disabled = true;
        return;
    }

    checkoutBtn.disabled = false;

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + products[item.product_id].price * item.quantity, 0);

    countEl.textContent = `${totalItems} ${totalItems === 1 ? "ITEM" : "ITEMS"}`;
    subtotalEl.textContent = `${subtotal}$`;

    list.innerHTML = "";
    items.forEach(item => {
        const { id, quantity, size, product_id } = item;
        const product = products[product_id];

        const el = document.createElement("div");
        el.className = "bag-item";
        el.innerHTML = `
            <div class="bag-item-image-container">
                <img class="bag-item-image" src="${product.image_url}" alt="${product.title}">
            </div>
            <div class="bag-item-details">
                <div class="bag-item-info">
                    <div>
                        <p class="bag-item-title">${product.title}</p>
                        ${size ? `<p class="bag-item-size">SIZE ${size}</p>` : ""}
                    </div>
                    <div class="bag-item-bottom">
                        <div class="bag-item-qty">
                            ${quantity > 1 ? `<button class="qty-btn qty-decrease">-</button>` : `<span class="qty-btn"></span>`}
                            <span class="qty-value">${quantity}</span>
                            <button class="qty-btn qty-increase">+</button>
                        </div>
                        <button class="bag-item-remove">REMOVE</button>
                    </div>
                </div>
                <div class="bag-item-price-col">
                    <p class="bag-item-price">${product.price * quantity}$</p>
                </div>
            </div>
        `;

        const rpcHeaders = {
            "apikey": API_KEY,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };
        const rpcBody = JSON.stringify({ p_product_id: product_id, p_size: size, p_qty: 1 });

        el.querySelector(".qty-increase").addEventListener("click", async () => {
            await fetch(`${BASE_URL}/rpc/add_to_cart`, { method: "POST", headers: rpcHeaders, body: rpcBody });
            loadBag();
        });

        el.querySelector(".qty-decrease")?.addEventListener("click", async () => {
            await fetch(`${BASE_URL}/rpc/remove_from_cart`, { method: "POST", headers: rpcHeaders, body: rpcBody });
            loadBag();
        });

        el.querySelector(".bag-item-remove").addEventListener("click", async () => {
            await fetch(`${BASE_URL}/cart_items?product_id=eq.${product_id}&size=eq.${size}`, {
                method: "DELETE",
                headers: rpcHeaders
            });
            loadBag();
        });

        list.appendChild(el);
    });
}

loadBag();
