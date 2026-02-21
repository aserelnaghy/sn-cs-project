const API_KEY = "sb_publishable_vzpgbW6T18bn5RyHdx66qw_pdeMQswL";
const BASE_URL = "https://ajuxbtifwipqmwmsrqcg.supabase.co/rest/v1";
const JWT = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjA0YjI1MTg4LWMzZTItNDZkNi05MjRjLWFlZjc4NDU1ZDdkZCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FqdXhidGlmd2lwcW13bXNycWNnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNjk3Nzc3LCJpYXQiOjE3NzE2OTQxNzcsImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoidGVzdDFAemF3cS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiJjOGNhNDAwMC1kNTU1LTQ0NzctOTBhMi04Y2Y4Mzg5N2VhNjQifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3MTY5NDE3N31dLCJzZXNzaW9uX2lkIjoiOWVjMGExMjEtZjZlOC00ZTY4LWJmZGYtMDJiNzU1MDMzN2I2IiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.ZL463ABOFMDyZwKW_XoZx5A0atgYuwtSB2xUHz1t1HKlTvwDsXqLcWbCgDjY0SLpRo5tTkOMk6Z9UlMdzKi-fw";

const HEADERS = {
    "apikey": API_KEY,
    "Authorization": `Bearer ${API_KEY}`
};

// helper function to captilaze
function capitalizeFirst(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

async function loadProduct(id) {
    const res = await fetch(`${BASE_URL}/products?id=eq.${id}&select=*`, { headers: HEADERS });
    const data = await res.json();

    if (data.length === 0) {
        document.querySelector("main").innerHTML = `<div class="container py-5"><p>Product not found.</p></div>`;
        return;
    }

    const [product] = data;

    document.title = `ZAWQ | ${product.title}`;

    document.getElementById("breadcrumb-gender").textContent = product.gender == "kids" || product.gender == "unisex" ? capitalizeFirst(product.gender) : `${capitalizeFirst(product.gender)}'s`
    document.getElementById("breadcrumb-category").textContent = capitalizeFirst(product.category);
    document.getElementById("breadcrumb-title").textContent = product.title;
    document.getElementById("product-image").src = product.image_url;
    document.getElementById("product-image").alt = product.title;
    document.getElementById("product-series").textContent = `${product.series.toUpperCase()} SERIES`;
    document.getElementById("product-title").textContent = product.title;

    const currency_symbol = { USD: "$", EUR: "€", GBP: "£", EGP: "£"};
    let symbol = currency_symbol[product.currency] ?? product.currency;
    document.getElementById("product-price").textContent = `${product.price} ${symbol}`;
    document.getElementById("product-description").textContent = product.description;
}

async function loadSizes(id) {
    const res = await fetch(`${BASE_URL}/product_sizes?product_id=eq.${id}&select=*`, { headers: HEADERS });
    const sizes = await res.json();

    const size_order = ["XS", "S", "M", "L", "XL"];
    sizes.sort((a, b) => size_order.indexOf(a.size) - size_order.indexOf(b.size));

    const container = document.getElementById("size-options");

    if (sizes.length === 0) {
        document.querySelector(".size-header").style.display = "none";
        container.style.display = "none";
        return;
    }

    sizes.forEach(({ size, quantity }) => {
        const btn = document.createElement("button");
        btn.textContent = size;
        btn.classList.add("size-btn");

        if (quantity === 0) {
            btn.classList.add("disabled");
            btn.disabled = true;
        }

        btn.addEventListener("click", () => {
            container.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });

        container.appendChild(btn);
    });
}

async function addToBag(redirectToBag) {
    const selectedSizeBtn = document.querySelector("#size-options .size-btn.active");
    const hasSizeOptions = document.querySelector("#size-options .size-btn");

    if (hasSizeOptions && !selectedSizeBtn) {
        document.getElementById("size-error").style.display = "block";
        return;
    }
    document.getElementById("size-error").style.display = "none";

    // get token from local storage, fall back to JWT if not found
    let token = JWT;
    try {
        const raw = localStorage.getItem("zawq-token");
        if (raw) {
            const parsed = JSON.parse(raw);
            token = parsed?.access_token ?? JWT;
        }
    } catch {}

    const size = selectedSizeBtn ? selectedSizeBtn.textContent : null;

    const body = {
        p_product_id: Number(id),
        p_qty: 1,
        ...(size && { p_size: size })
    };

    try {
        const res = await fetch(`${BASE_URL}/rpc/add_to_cart`, {
            method: "POST",
            headers: {
                "apikey": API_KEY,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message);
        }

        if (redirectToBag) window.location.href = "../bag/index.html";

    } catch (err) {
        console.error(err);
    }
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id") ?? 1;

loadProduct(id);
loadSizes(id);

document.querySelector(".btn-add-to-bag").addEventListener("click", () => addToBag());
document.querySelector(".btn-add-view-bag").addEventListener("click", () => addToBag(true));
