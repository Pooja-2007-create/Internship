// GET CART DATA FROM LOCAL STORAGE

let cart = JSON.parse(localStorage.getItem("sweetifyCart")) || [];

const checkoutItems = document.getElementById("checkout-items");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");
const upiReferenceForm = document.getElementById("upi-reference-form");


// DISPLAY ORDER SUMMARY

function displayCheckout() {

    checkoutItems.innerHTML = "";

    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <div class="empty-checkout">
                <i class="fas fa-shopping-basket"></i>
                <h3>Your cart is empty!</h3>
                <p>Add some delicious sweets before checking out.</p>
                <a href="index.html" class="back-home">Browse Sweets</a>
            </div>
        `;

        checkoutForm.querySelector(".place-order-btn").disabled = true;
        checkoutForm.querySelector(".place-order-btn").style.opacity = "0.5";

        checkoutTotal.textContent = "₹0";
        return;
    }

    let total = 0;

    cart.forEach(item => {

        let itemTotal = item.unitPrice * item.quantity;

        total += itemTotal;

        let div = document.createElement("div");

        div.className = "checkout-item";

        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">

            <div class="checkout-item-info">
                <h3>${item.name}</h3>
                <p>Weight: ${item.weight}g</p>
                <p>Quantity: ${item.quantity}</p>
            </div>

            <div class="checkout-item-price">
                ₹${itemTotal.toFixed(2)}
            </div>
        `;

        checkoutItems.appendChild(div);

    });

    checkoutTotal.textContent = "₹" + total.toFixed(2);

}


// CALCULATE TOTAL

function calculateTotal() {

    return cart.reduce((sum, item) => {

        return sum + (item.unitPrice * item.quantity);

    }, 0);

}

function saveOrderLocally(order) {
    let orders = JSON.parse(localStorage.getItem("sweetifyOrders")) || [];
    orders.push(order);
    localStorage.setItem("sweetifyOrders", JSON.stringify(orders));
}

function createWhatsAppMessage(order) {
    const itemLines = order.items.map((item) =>
        `- ${item.name} (${item.weight}g) x ${item.quantity}`
    );

    return [
        "Hello Sweetify, I placed an order and would like to coordinate UPI payment.",
        `Order ID: ${order.orderId}`,
        `Name: ${order.customerName}`,
        `Phone: ${order.phone}`,
        `Email: ${order.email}`,
        "Items:",
        ...itemLines,
        `Total: ₹${Number(order.totalAmount).toFixed(2)}`,
        `Delivery address: ${order.address}, ${order.city} - ${order.pincode}`,
        "Please share the UPI payment details. I understand the order will remain pending until payment is verified."
    ].join("\n");
}

function showOrderConfirmation(order, whatsappUrl, upiPayment) {
    document.getElementById("success-message").textContent =
        `Thank you, ${order.customerName}! Your order has been saved. Order ID: ${order.orderId}. ` +
        `Total: ₹${Number(order.totalAmount).toFixed(2)}. ` +
        `Payment: ${order.paymentMethod}${order.paymentStatus ? ` - ${order.paymentStatus}` : ""}.`;

    document.getElementById("track-order-link").href =
        `track-order.html?orderId=${encodeURIComponent(order.orderId)}`;

    const whatsappLink = document.getElementById("whatsapp-order-link");
    whatsappLink.href = whatsappUrl;
    whatsappLink.hidden = !whatsappUrl;

    const upiDetails = document.getElementById("upi-payment-details");
    upiDetails.hidden = !upiPayment;
    if (upiPayment) {
        document.getElementById("upi-qr-code").src = upiPayment.qrCodeDataUrl;
        document.getElementById("upi-id-value").textContent = upiPayment.upiId;
        document.getElementById("upi-amount-value").textContent =
            `₹${Number(upiPayment.amount).toFixed(2)}`;
        document.getElementById("upi-app-link").href = upiPayment.paymentUri;
        upiReferenceForm.dataset.orderId = order.orderId;
        document.getElementById("upi-transaction-reference").value = "";
        document.getElementById("upi-reference-message").textContent = "";
    }

    document.getElementById("success-overlay").style.display = "flex";
}


// PLACE ORDER

checkoutForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const email = document.getElementById("customer-email").value.trim();
    const address = document.getElementById("customer-address").value.trim();
    const city = document.getElementById("customer-city").value.trim();
    const pincode = document.getElementById("customer-pincode").value.trim();

    const payment = document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    if (payment === "Pay via WhatsApp" || payment === "Pay via UPI") {
        const isWhatsAppPayment = payment === "Pay via WhatsApp";
        const whatsappWindow = isWhatsAppPayment ? window.open("about:blank", "_blank") : null;
        const submitButton = checkoutForm.querySelector(".place-order-btn");
        submitButton.disabled = true;

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: name,
                    phone,
                    email,
                    address,
                    city,
                    pincode,
                    paymentMethod: payment,
                    items: cart
                })
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to save your order.");
            }

            const order = result.order;
            const localOrder = {
                ...order,
                orderDate: new Date(order.orderDate).toLocaleString()
            };
            let browserStorageWarning = "";
            try {
                saveOrderLocally(localOrder);
            } catch (error) {
                console.error("WhatsApp order was saved, but browser order history could not be updated:", error);
                browserStorageWarning = "Your order was saved, but this browser could not update its local order history.";
            }
            try {
                localStorage.removeItem("sweetifyCart");
            } catch (error) {
                console.error("WhatsApp order was saved, but the browser cart could not be cleared:", error);
                browserStorageWarning = "Your order was saved, but this browser could not clear its saved cart.";
            }
            cart = [];
            displayCheckout();

            const message = createWhatsAppMessage(order);
            const phoneNumber = String(result.whatsappPhoneNumber || "").replace(/\D/g, "");
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            if (whatsappWindow) {
                whatsappWindow.location.href = whatsappUrl;
            }

            showOrderConfirmation(order, isWhatsAppPayment ? whatsappUrl : "", result.upiPayment);
            if (browserStorageWarning) {
                alert(browserStorageWarning);
            }
        } catch (error) {
            if (whatsappWindow) {
                whatsappWindow.close();
            }
            alert(error instanceof Error ? error.message : "Unable to save your order.");
        } finally {
            submitButton.disabled = cart.length === 0;
        }

        return;
    }

    const total = calculateTotal();

    // GENERATE ORDER ID

    const orderId = "SW" + Date.now().toString().slice(-8);

    // CREATE ORDER DETAILS

    const order = {
        orderId: orderId,
        customerName: name,
        phone: phone,
        email: email,
        address: address,
        city: city,
        pincode: pincode,
        paymentMethod: payment,
        items: cart,
        totalAmount: total,
        orderDate: new Date().toLocaleString()
    };

    // SAVE ORDER HISTORY

    saveOrderLocally(order);

    // CLEAR CART

    localStorage.removeItem("sweetifyCart");

    cart = [];

    // SHOW SUCCESS MESSAGE

    showOrderConfirmation(order, "");

});

upiReferenceForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const orderId = upiReferenceForm.dataset.orderId;
    const transactionReference =
        document.getElementById("upi-transaction-reference").value.trim();
    const message = document.getElementById("upi-reference-message");
    const submitButton = upiReferenceForm.querySelector("button");
    submitButton.disabled = true;
    message.textContent = "";

    try {
        const response = await fetch(
            `/api/orders/${encodeURIComponent(orderId)}/transaction-reference`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactionReference })
            }
        );
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to submit the transaction reference.");
        }

        message.textContent =
            "Reference received. Payment remains Pending until an admin verifies it.";
        submitButton.textContent = "Reference submitted";
    } catch (error) {
        message.textContent =
            error instanceof Error ? error.message : "Unable to submit the transaction reference.";
        submitButton.disabled = false;
    }
});


// LOAD CHECKOUT PAGE

displayCheckout();