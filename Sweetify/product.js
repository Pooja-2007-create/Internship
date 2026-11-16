// PRODUCT INFORMATION

const productData = {

    1: {
        name: "Motichoor Laddu",
        price: 250,
        rating: 4.8,
        image: "images/laddu.jpg",
        description: "Enjoy the authentic taste of traditional Motichoor Laddu. These delicious, soft and flavourful sweets are prepared with care using traditional methods.",
        ingredients: "Gram flour, sugar, ghee and cardamom."
    },

    2: {
        name: "Gulab Jamun",
        price: 180,
        rating: 4.9,
        image: "images/gulab-jamun.jpg",
        description: "Soft, juicy and delicious Gulab Jamun soaked in fragrant sugar syrup. A timeless Indian favourite.",
        ingredients: "Milk solids, sugar, cardamom and ghee."
    },

    3: {
        name: "Kaju Katli",
        price: 450,
        rating: 4.9,
        image: "images/kaju-katli.jpg",
        description: "Experience the richness of premium Kaju Katli, crafted with finely ground cashews and a delicate sweetness.",
        ingredients: "Cashews, sugar and cardamom."
    },

    4: {
        name: "Badam Halwa",
        price: 350,
        rating: 4.7,
        image: "images/badam-halwa.jpg",
        description: "A rich and aromatic almond delicacy prepared with traditional ingredients.",
        ingredients: "Almonds, ghee, sugar and saffron."
    },

    5: {
        name: "Mysore Pak",
        price: 280,
        rating: 4.8,
        image: "images/mysore-pak.jpg",
        description: "Taste the authentic South Indian Mysore Pak, known for its rich texture and irresistible flavour.",
        ingredients: "Gram flour, ghee and sugar."
    },

    6: {
        name: "Rasmalai",
        price: 300,
        rating: 4.9,
        image: "images/rasmalai.jpg",
        description: "Soft and creamy Rasmalai immersed in delicious saffron-flavoured milk.",
        ingredients: "Milk, sugar, saffron, cardamom and nuts."
    },

    7: {
        name: "Malai Peda",
        price: 320,
        rating: 4.8,
        image: "images/milkpeda.webp",
        description: "Soft, rich and melt-in-the-mouth milk peda with a delicate sweetness and creamy finish.",
        ingredients: "Milk solids, sugar, saffron, cardamom and condensed milk."
    },
  
    8: {
        name: "Jalebi",
        price: 220,
        rating: 4.7,
        image: "images/jalebi.webp",
        description: "Crispy golden spirals soaked in fragrant sugar syrup for a festive, indulgent bite.",
        ingredients: "Flour, yogurt, sugar, saffron and cardamom."
    },

    9: {
        name: "Soan Papdi",
        price: 260,
        rating: 4.6,
        image: "images/soanpapdi.png",
        description: "Flaky, light and buttery Soan Papdi that melts gently with a rich traditional taste.",
        ingredients: "Besan, ghee, sugar, milk solids and nuts."
    },

    10: {
        name: "Kaju Roll",
        price: 480,
        rating: 4.9,
        image: "images/kajuroll.webp",
        description: "Rich and luxurious cashew rolls with a smooth finish and indulgent premium flavour.",
        ingredients: "Cashews, sugar, cardamom and ghee."
    },

    11: {
        name: "Coconut Barfi",
        price: 340,
        rating: 4.8,
        image: "images/barfi.webp",
        description: "A soft and delicious coconut barfi with balanced sweetness and a lovely nutty texture.",
        ingredients: "Coconut, milk, sugar, cardamom and nuts."
    },

    27: {
        name: "Rasagulla",
        price: 260,
        rating: 4.9,
        image: "images/rasmalai.jpg",
        description: "Soft, spongy and syrup-soaked classic Rasagulla.",
        ingredients: "Milk, sugar, cardamom and ghee."
    }
     
};

regionalSweets.forEach(sweet => {
    productData[sweet.id] = sweet;
});


// GET PRODUCT ID FROM URL

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

const product = productData[productId];


// CHECK PRODUCT

if (!product) {

    document.querySelector(".product-information").innerHTML =
        "<h1>Product not found!</h1><a href='index.html'>Back to Shop</a>";

} else {

    // DISPLAY PRODUCT

    document.getElementById("product-name").textContent =
        product.name;

    document.getElementById("product-rating").textContent =
        product.rating;

    document.getElementById("product-description").textContent =
        product.description;

    document.getElementById("product-ingredients").textContent =
        product.ingredients;

    document.getElementById("product-image").src =
        product.image;

    document.getElementById("product-image").alt =
        product.name;


    // PRICE CALCULATION

    const weightSelect =
        document.getElementById("detail-weight");

    const priceDisplay =
        document.getElementById("product-price");


    function calculatePrice(weight) {

        const multipliers = {

            250: 1,

            500: 1.9,

            1000: 3.6

        };

        return Math.round(product.price * multipliers[weight]);

    }


    function updatePrice() {

        priceDisplay.textContent =
            "₹" + calculatePrice(Number(weightSelect.value));

    }


    weightSelect.addEventListener("change", updatePrice);

    updatePrice();


    // QUANTITY

    let quantity = 1;

    const quantityDisplay =
        document.getElementById("quantity");


    document.getElementById("increase")
    .addEventListener("click", function() {

        quantity++;

        quantityDisplay.textContent = quantity;

    });


    document.getElementById("decrease")
    .addEventListener("click", function() {

        if (quantity > 1) {

            quantity--;

            quantityDisplay.textContent = quantity;

        }

    });


    // ADD TO CART

    document.getElementById("detail-add-cart")
    .addEventListener("click", function() {

        let cart =
            JSON.parse(localStorage.getItem("sweetifyCart")) || [];

        const weight = Number(weightSelect.value);

        const price = calculatePrice(weight);

        const existing = cart.find(item =>
            item.id === Number(productId) &&
            item.weight === weight
        );


        if (existing) {

            existing.quantity += quantity;

        } else {

            cart.push({

                id: Number(productId),

                name: product.name,

                image: product.image,

                weight: weight,

                unitPrice: price,

                quantity: quantity

            });

        }


        localStorage.setItem(
            "sweetifyCart",
            JSON.stringify(cart)
        );


        alert(product.name + " added to your cart!");

        quantity = 1;

        quantityDisplay.textContent = quantity;

    });

}