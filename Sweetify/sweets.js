const productContainer = document.getElementById("product-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("filter-category");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartOverlay = document.getElementById("cart-overlay");
let cart = JSON.parse(localStorage.getItem("sweetifyCart")) || [];

function calculatePrice(basePrice, weight) {
    const multipliers = { 250: 1, 500: 1.9, 1000: 3.6 };
    return Math.round(basePrice * multipliers[weight]);
}

function displayProducts(items) {
    productContainer.innerHTML = "";

    if (items.length === 0) {
        productContainer.innerHTML = "<p>No regional sweets found.</p>";
        return;
    }

    items.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.dataset.productId = product.id;
        card.style.cursor = "pointer";
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <span class="product-badge">${product.badge}</span>
            </div>
            <div class="product-info">
                <div class="rating">
                    <span>★★★★★</span>
                    <small>${product.rating}</small>
                </div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="weight-section">
                    <label for="weight-${product.id}">Select Weight</label>
                    <select id="weight-${product.id}" class="weight-select">
                        <option value="250">250g</option>
                        <option value="500">500g</option>
                        <option value="1000">1kg</option>
                    </select>
                </div>
                <div class="product-bottom">
                    <span class="price" id="price-${product.id}">₹${product.price}</span>
                    <button class="add-btn" data-id="${product.id}" type="button">
                        <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
                        Add
                    </button>
                </div>
            </div>
        `;
        productContainer.appendChild(card);
    });
}

function updateCart() {
    cartItems.innerHTML = "";
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.unitPrice * item.quantity;
        count += item.quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";
        cartItem.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>${item.weight}g - ₹${item.unitPrice}</p>
                <div class="quantity-controls">
                    <button data-action="decrease" data-id="${item.id}" data-weight="${item.weight}" type="button">-</button>
                    <span>${item.quantity}</span>
                    <button data-action="increase" data-id="${item.id}" data-weight="${item.weight}" type="button">+</button>
                </div>
            </div>
            <button class="remove-btn" data-action="remove" data-id="${item.id}" data-weight="${item.weight}" type="button" aria-label="Remove ${item.name}">
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    }

    localStorage.setItem("sweetifyCart", JSON.stringify(cart));
    cartCount.textContent = count;
    cartTotal.textContent = total;
}

function filterProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const filteredProducts = regionalSweets.filter(product => {
        const matchesSearch = `${product.name} ${product.region}`.toLowerCase().includes(query);
        const categories = product.categories || [product.category];
        const matchesCategory = category === "All" || categories.includes(category);
        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);

productContainer.addEventListener("change", function(event) {
    if (!event.target.classList.contains("weight-select")) return;

    const productId = Number(event.target.id.replace("weight-", ""));
    const product = regionalSweets.find(item => item.id === productId);
    const price = calculatePrice(product.price, Number(event.target.value));
    document.getElementById(`price-${productId}`).textContent = `₹${price}`;
});

productContainer.addEventListener("click", function(event) {
    const addButton = event.target.closest(".add-btn");

    if (addButton) {
        const product = regionalSweets.find(item => item.id === Number(addButton.dataset.id));
        const weight = Number(document.getElementById(`weight-${product.id}`).value);
        const unitPrice = calculatePrice(product.price, weight);
        const existingItem = cart.find(item => item.id === product.id && item.weight === weight);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                image: product.image,
                weight,
                unitPrice,
                quantity: 1
            });
        }

        updateCart();
        return;
    }

    if (event.target.closest("button, select")) return;

    const card = event.target.closest(".product-card");
    if (card) {
        window.location.href = `product.html?id=${card.dataset.productId}`;
    }
});

cartItems.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const weight = Number(button.dataset.weight);
    const item = cart.find(product => product.id === id && product.weight === weight);
    if (!item) return;

    if (button.dataset.action === "increase") {
        item.quantity++;
    } else if (button.dataset.action === "decrease") {
        item.quantity--;
        if (item.quantity <= 0) {
            cart = cart.filter(product => !(product.id === id && product.weight === weight));
        }
    } else if (button.dataset.action === "remove") {
        cart = cart.filter(product => !(product.id === id && product.weight === weight));
    }

    updateCart();
});

document.getElementById("cart-btn").addEventListener("click", function() {
    cartOverlay.classList.add("active");
});

document.getElementById("close-cart").addEventListener("click", function() {
    cartOverlay.classList.remove("active");
});

cartOverlay.addEventListener("click", function(event) {
    if (event.target === cartOverlay) {
        cartOverlay.classList.remove("active");
    }
});

document.getElementById("checkout-btn").addEventListener("click", function() {
    if (cart.length === 0) {
        alert("Your shopping cart is empty!");
        return;
    }

    window.location.href = "checkout.html";
});

displayProducts(regionalSweets);
updateCart();
