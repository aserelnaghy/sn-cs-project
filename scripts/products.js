// =====    Full Data Seeding Script   =====
const PRODUCTS = [
  // MEN
  {
    id: 1,
    cat: "men",
    type: "tops",
    series: "WINTER SERIES",
    name: "Slate Utility Overshirt",
    price: 79,
    img: "assets/products/men-overshirt.jpg",
  },
  {
    id: 2,
    cat: "men",
    type: "tops",
    series: "ESSENTIALS SERIES",
    name: "Noir Essential Crewneck",
    price: 49,
    img: "assets/products/men-crewneck.png",
  },
  {
    id: 3,
    cat: "men",
    type: "tops",
    series: "WARM-WEATHER SERIES",
    name: "Sandstone Core Tee",
    price: 29,
    img: "assets/products/men-tee.png",
  },
  {
    id: 4,
    cat: "men",
    type: "accessories",
    series: "SIGNATURE SERIES",
    name: "Tailored Blazer — Graphite",
    price: 139,
    img: "assets/products/men-blazer.png",
  },

  // WOMEN
  {
    id: 11,
    cat: "women",
    type: "tops",
    series: "ESSENTIALS",
    name: "Ivory Knit Top",
    price: 55,
    img: "assets/products/women-knit.jpg",
  },
  {
    id: 12,
    cat: "women",
    type: "bottoms",
    series: "CORE",
    name: "Soft Pleat Trousers",
    price: 75,
    img: "assets/products/women-trousers.jpg",
  },

  // KIDS
  {
    id: 21,
    cat: "kids",
    type: "tops",
    series: "DAILY",
    name: "Cloud Tee",
    price: 18,
    img: "assets/products/kids-tee.jpg",
  },
];

// ===== Helpers =====
function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
// ===== Navigation Category Function =====
function titleCaseCat(cat) {
  if (cat === "men") return "Men’s";
  if (cat === "women") return "Women’s";
  if (cat === "kids") return "Kids";
  return "Shop";
}
// ===== Currency Formatting =====
function money(n) {
  return `${n}$`;
}
// ===== Dynamic Product Cards Rendering =====
function renderProducts(list) {
  //HTML Clear
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  //LOOP PRODUCTS
  list.forEach((p) => {
    //CREATE COLUMN BS
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";
    //GENERATE
    col.innerHTML = `
      <a href="#" class="z-prod-link">
        <div class="z-prod-card">
          <img class="z-prod-img" src="${p.img}" alt="${p.name}">
          <div class="z-prod-meta">
            <div class="z-prod-series">${p.series}</div>
            <div class="z-prod-name-row">
              <div class="z-prod-name">${p.name}</div>
              <div class="z-prod-price">${money(p.price)}</div>
            </div>
          </div>
        </div>
      </a>
    `;
    //ADD COLUMN TO GRID
    grid.appendChild(col);
  });
  //UPDATE PRODUCT COUNT
  document.getElementById("productCount").textContent =
    `${list.length} products`;
}

// ===== Initialization =====
const cat = (getQueryParam("cat") || "men").toLowerCase();
const title = titleCaseCat(cat);

document.getElementById("pageTitle").textContent = title;
document.getElementById("crumbCat").textContent = title;

// filter state
let activeFilter = "all";

// chips click
document.querySelectorAll(".z-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".z-chip")
      .forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.filter;
    apply();
  });
});
// apply filtering
function apply() {
  let list = PRODUCTS.filter((p) => p.cat === cat);
  if (activeFilter !== "all")
    list = list.filter((p) => p.type === activeFilter);
  renderProducts(list);
}

apply();
