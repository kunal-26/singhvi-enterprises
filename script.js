/* ---------- ELEMENTS ---------- */

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanel = document.getElementById("adminPanel");

const search = document.getElementById("search");
const categoryFilter = document.getElementById("categoryFilter");
const productsDiv = document.getElementById("products");
const categoryCards = document.getElementById("categoryCards");

const imageFile = document.getElementById("imageFile");
const preview = document.getElementById("preview");

/* INPUTS */

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const colorInput = document.getElementById("color");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");

/* ---------- ADMIN LOGIN ---------- */

loginBtn.onclick = () => {
    const u = prompt("Username");
    const p = prompt("Password");

    if (u === "admin" && p === "1234") {
        localStorage.setItem("admin", "true");
        location.reload();
    } else alert("Wrong login");
};

logoutBtn.onclick = () => {
    localStorage.removeItem("admin");
    location.reload();
};

function isAdmin() {
    return localStorage.getItem("admin") === "true";
}

function checkAdmin() {
    adminPanel.style.display = isAdmin() ? "block" : "none";
    logoutBtn.style.display = isAdmin() ? "inline" : "none";
    loginBtn.style.display = isAdmin() ? "none" : "inline";
}
checkAdmin();

/* ---------- IMAGE PREVIEW ---------- */

imageFile.onchange = function() {
    const reader = new FileReader();
    reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" width="120">`;
    };
    reader.readAsDataURL(imageFile.files[0]);
};

/* ---------- DATA FROM SUPABASE ---------- */

let allProducts = [];

/* LOAD PRODUCTS */

async function loadProducts() {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    allProducts = data;

    buildCategories();
    renderProducts();
}

/* ---------- ADD PRODUCT ---------- */

async function addProduct() {

    const name = nameInput.value;
    const price = priceInput.value;
    const color = colorInput.value;
    const description = descriptionInput.value;
    const category = categoryInput.value;

    const file = imageFile.files[0];

    if (!file) {
        alert("Upload image");
        return;
    }

    const fileName = Date.now() + "_" + file.name;

    /* UPLOAD IMAGE */
    const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

    if (uploadError) {
        console.error(uploadError);
        alert("Image upload failed");
        return;
    }

    /* GET PUBLIC URL */
    const { data } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    /* INSERT PRODUCT */
    const { error } = await supabase
        .from("products")
        .insert([{
            name,
            price,
            color,
            description,
            category,
            image: imageUrl
        }]);

    if (error) {
        console.error(error);
        alert("Database insert failed");
        return;
    }

    alert("Product Added ✅");

    nameInput.value = "";
    priceInput.value = "";
    colorInput.value = "";
    descriptionInput.value = "";
    categoryInput.value = "";
    imageFile.value = "";
    preview.innerHTML = "";

    loadProducts();
}

/* ---------- DELETE PRODUCT ---------- */

async function deleteProduct(id) {

    if (!confirm("Delete product?")) return;

    await supabase
        .from("products")
        .delete()
        .eq("id", id);

    loadProducts();
}

/* ---------- CATEGORY UI ---------- */

function buildCategories() {

    categoryFilter.innerHTML = `<option value="all">All</option>`;
    categoryCards.innerHTML = "";

    const categories = {};

    allProducts.forEach(p => {
        if (!categories[p.category])
            categories[p.category] = p.image;
    });

    Object.keys(categories).forEach(cat => {

        categoryFilter.innerHTML +=
            `<option value="${cat}">${cat}</option>`;

        categoryCards.innerHTML += `
        <div class="category-card">
            <img src="${categories[cat]}"
                 onclick="filterCategory('${cat}')">
            <p>${cat}</p>
        </div>`;
    });
}

function filterCategory(cat) {
    categoryFilter.value = cat;
    renderProducts();
}

/* ---------- RENDER PRODUCTS ---------- */

function renderProducts() {

    const s = (search.value || "").toLowerCase();
    const cat = categoryFilter.value || "all";

    productsDiv.innerHTML = "";

    allProducts
        .filter(p =>
            p.name.toLowerCase().includes(s) &&
            (cat === "all" || p.category === cat)
        )
        .forEach(p => {

                productsDiv.innerHTML += `
            <div class="card">

                <img src="${p.image}">
                <h3>${p.name}</h3>
                <p class="price">₹${p.price}</p>
                <p>${p.description}</p>
                <small>${p.color}</small>

                ${isAdmin() ? `
                <button onclick="deleteProduct(${p.id})">
                    Delete
                </button>` : ""}

            </div>`;
        });
}

search.oninput = renderProducts;
categoryFilter.onchange = renderProducts;

/* ---------- INIT ---------- */

loadProducts();