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
});

function updateBagCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

    const el = document.getElementById("bagCount");
    if (el) el.textContent = `(${count})`;
}