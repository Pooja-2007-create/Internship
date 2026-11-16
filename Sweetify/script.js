// PRODUCT DATA

const products = [

    {
        id: 1,
        name: "Motichoor Laddu",
        category: "Traditional",
        price: 250,
        rating: 4.8,
        badge: "BESTSELLER",
        image: "images/laddu.jpg",
        description: "Traditional soft and delicious laddus."
    },

    {
        id: 2,
        name: "Gulab Jamun",
        category: "Traditional",
        price: 180,
        rating: 4.9,
        badge: "POPULAR",
        image: "images/gulab-jamun.jpg",
        description: "Soft and juicy milk-based sweet."
    },

    {
        id: 3,
        name: "Kaju Katli",
        category: "Special",
        price: 450,
        rating: 4.9,
        badge: "PREMIUM",
        image: "images/kaju-katli.jpg",
        description: "Premium cashew sweet with rich flavour."
    },

    {
        id: 4,
        name: "Badam Halwa",
        category: "Special",
        price: 350,
        rating: 4.7,
        badge: "SPECIAL",
        image: "images/badam-halwa.jpg",
        description: "Rich almond halwa made with love."
    },

    {
        id: 5,
        name: "Mysore Pak",
        category: "Traditional",
        price: 280,
        rating: 4.8,
        badge: "TRADITIONAL",
        image: "images/mysore-pak.jpg",
        description: "Authentic traditional Mysore Pak."
    },

    {
        id: 6,
        name: "Rasmalai",
        category: "Milk",
        price: 300,
        rating: 4.9,
        badge: "FAVOURITE",
        image: "images/rasmalai.jpg",
        description: "Creamy and delicious milk dessert."
    },

    {
        id: 7,
        name: "Malai Peda",
        category: "Milk",
        price: 320,
        rating: 4.8,
        badge: "CREAMY",
        image: "images/milkpeda.webp",
        description: "Soft, rich and melt-in-the-mouth milk peda with a delicate sweetness."
    },

    {
        id: 8,
        name: "Jalebi",
        category: "Traditional",
        price: 220,
        rating: 4.7,
        badge: "CRISPY",
        image: "images/jalebi.webp",
        description: "Crispy golden spirals soaked in fragrant sugar syrup for a festive feel."
    },

    {
        id: 9,
        name: "Soan Papdi",
        category: "Traditional",
        price: 260,
        rating: 4.6,
        badge: "FAMOUS",
        image: "images/soanpapdi.png",
        description: "Flaky, light and buttery traditional Soan Papdi made for gifting and sharing."
    },

    {
        id: 10,
        name: "Kaju Roll",
        category: "Special",
        price: 480,
        rating: 4.9,
        badge: "PREMIUM",
        image: "images/kajuroll.webp",
        description: "Rich cashew rolls with a smooth and luxurious finishing touch."
    },

    {
        id: 11,
        name: "Coconut Barfi",
        category: "Milk",
        price: 340,
        rating: 4.8,
        badge: "FRESH",
        image: "images/barfi.webp",
        description: "A soft coconut-based barfi with the perfect balance of sweetness and texture."
    },

    {
        id: 27,
        name: "Rasagulla",
        category: "Milk",
        price: 260,
        rating: 4.9,
        badge: "BESTSELLER",
        image: "https://img.freepik.com/premium-photo/photo-indian-sweet-dessert-rasgulla-famous-bengali-sweet-clay-bowl-generated-by-ai_1050153-36418.jpg",
        description: "Soft, spongy and syrup-soaked classic Rasagulla."
    }

];


// CART ARRAY

let cart = JSON.parse(localStorage.getItem("sweetifyCart")) || [];


// PRODUCT DISPLAY

const productContainer =
    document.getElementById("product-container");


function displayProducts(items) {

    productContainer.innerHTML = "";

    if (items.length === 0) {

        productContainer.innerHTML =
            "<p>No sweets found.</p>";

        return;

    }

    items.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";
        card.dataset.productId = product.id;
        card.style.cursor = "pointer";

        card.innerHTML = `

            <div class="product-image">

                <img src="${product.image}"
                     alt="${product.name}">

                <span class="product-badge">
                    ${product.badge}
                </span>

            </div>

            <div class="product-info">

                <div class="rating">

                    <span>★★★★★</span>

                    <small>${product.rating}</small>

                </div>

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <div class="weight-section">

                    <label for="weight-${product.id}">
                        Select Weight
                    </label>

                    <select id="weight-${product.id}"
                            class="weight-select">

                        <option value="250">250g</option>

                        <option value="500">500g</option>

                        <option value="1000">1kg</option>

                    </select>

                </div>

                <div class="product-bottom">

                    <span class="price"
                          id="price-${product.id}">

                        ₹${product.price}

                    </span>

                    <button class="add-btn"
                            data-id="${product.id}">

                        <i class="fa-solid fa-bag-shopping"></i>

                        Add

                    </button>

                </div>

            </div>

        `;

        productContainer.appendChild(card);

    });

}


displayProducts(products);
updateCart();

// PRICE CALCULATION

function calculatePrice(basePrice, weight) {

    const multipliers = {

        250: 1,

        500: 1.9,

        1000: 3.6

    };

    return Math.round(basePrice * multipliers[weight]);

}


// UPDATE PRICE WHEN WEIGHT CHANGES

productContainer.addEventListener("change", function(event) {

    if (!event.target.classList.contains("weight-select")) {
        return;
    }

    const id = Number(
        event.target.id.replace("weight-", "")
    );

    const product = products.find(item => item.id === id);

    const weight = Number(event.target.value);

    const price = calculatePrice(product.price, weight);

    document.getElementById(`price-${id}`).textContent =
        `₹${price}`;

});


// ADD TO CART

productContainer.addEventListener("click", function(event) {

    const button = event.target.closest(".add-btn");

    if (!button) return;

    const id = Number(button.dataset.id);

    const product = products.find(item => item.id === id);

    const weight = Number(
        document.getElementById(`weight-${id}`).value
    );

    const price = calculatePrice(product.price, weight);

    const existingProduct = cart.find(item =>
        item.id === id && item.weight === weight
    );

    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push({

            ...product,

            weight: weight,

            unitPrice: price,

            quantity: 1

        });

    }

    updateCart();

});


// UPDATE CART

function updateCart() {

    const cartItems =
        document.getElementById("cart-items");

    const cartCount =
        document.getElementById("cart-count");

    const cartTotal =
        document.getElementById("cart-total");

    const checkoutButton =
        document.getElementById("checkout-btn");

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

                    <button data-action="decrease"
                            data-id="${item.id}"
                            data-weight="${item.weight}">
                        -
                    </button>

                    <span>${item.quantity}</span>

                    <button data-action="increase"
                            data-id="${item.id}"
                            data-weight="${item.weight}">
                        +
                    </button>

                </div>

            </div>

            <button class="remove-btn"
                    data-action="remove"
                    data-id="${item.id}"
                    data-weight="${item.weight}">

                <i class="fa-solid fa-trash"></i>

            </button>

        `;

        cartItems.appendChild(cartItem);
    });

    localStorage.setItem("sweetifyCart", JSON.stringify(cart));

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

        if (checkoutButton) {
            checkoutButton.disabled = true;
            checkoutButton.style.opacity = "0.5";
            checkoutButton.style.cursor = "not-allowed";
        }

    } else {

        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.style.opacity = "1";
            checkoutButton.style.cursor = "pointer";
        }

    }

    cartCount.textContent = count;

    cartTotal.textContent = total;

}


// CART QUANTITY AND REMOVE

document.getElementById("cart-items")
.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    const weight = Number(button.dataset.weight);

    const action = button.dataset.action;

    const item = cart.find(product =>
        product.id === id && product.weight === weight
    );

    if (!item) return;

    if (action === "increase") {

        item.quantity++;

    }

    else if (action === "decrease") {

        item.quantity--;

        if (item.quantity <= 0) {

            cart = cart.filter(product =>
                !(product.id === id && product.weight === weight)
            );

        }

    }

    else if (action === "remove") {

        cart = cart.filter(product =>
            !(product.id === id && product.weight === weight)
        );

    }

    updateCart();

});


// OPEN AND CLOSE CART

const cartOverlay =
    document.getElementById("cart-overlay");


document.getElementById("cart-btn")
.addEventListener("click", function() {

    cartOverlay.classList.add("active");

});


document.getElementById("close-cart")
.addEventListener("click", function() {

    cartOverlay.classList.remove("active");

});


cartOverlay.addEventListener("click", function(event) {

    if (event.target === cartOverlay) {

        cartOverlay.classList.remove("active");

    }

});


// SEARCH

const searchInput =
    document.getElementById("search-input");

const categoryFilter =
    document.getElementById("filter-category");


function filterProducts() {

    const searchValue =
        searchInput.value.toLowerCase();

    const selectedCategory =
        categoryFilter.value;

    const filteredProducts = products.filter(product => {

        const matchesSearch =
            product.name.toLowerCase().includes(searchValue);

        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });

    displayProducts(filteredProducts);

}


searchInput.addEventListener("input", filterProducts);

categoryFilter.addEventListener("change", filterProducts);


// CATEGORY CARDS

document.querySelectorAll(".category-card")
.forEach(button => {

    button.addEventListener("click", function() {

        categoryFilter.value = this.dataset.category;

        searchInput.value = "";

        filterProducts();

        document.getElementById("products")
        .scrollIntoView({

            behavior: "smooth"

        });

    });

});


// CONTACT FORM

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const payload = {
            name: document.getElementById("customer-name").value.trim(),
            email: document.getElementById("customer-email").value.trim(),
            phone: document.getElementById("customer-phone").value.trim(),
            message: document.getElementById("customer-message").value.trim()
        };

        if (!payload.name || !payload.email || !payload.phone || !payload.message) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Message not sent.");
            }

            alert("Thank you, " + payload.name + "! Your message has been received.");
            this.reset();
        } catch (error) {
            alert(error.message || "Unable to send your message.");
        }

    });
}


// CHECKOUT
document.getElementById("checkout-btn")
.addEventListener("click", function() {

    if (cart.length === 0) {

        alert("Your shopping cart is empty!");

        return;

    }

    window.location.href = "checkout.html";

});
// OPEN INDIVIDUAL PRODUCT PAGE

productContainer.addEventListener("click", function(event) {

    if (
        event.target.closest("button") ||
        event.target.closest("select")
    ) {
        return;
    }

    const card = event.target.closest(".product-card");

    if (!card) return;

    const productId = card.dataset.productId;

    window.location.href = `product.html?id=${productId}`;

});
// LOAD SAVED CART WHEN HOME PAGE OPENS

updateCart();