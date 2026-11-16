const trackOrderForm = document.getElementById("track-order-form");
const orderIdInput = document.getElementById("order-id-input");
const trackMessage = document.getElementById("track-message");
const orderResult = document.getElementById("order-result");

function findOrder(orderId) {
    const savedOrders = JSON.parse(localStorage.getItem("sweetifyOrders") || "[]");

    if (!Array.isArray(savedOrders)) {
        throw new Error("Saved orders are not available in this browser.");
    }

    return savedOrders.find((order) =>
        order && typeof order.orderId === "string" &&
        order.orderId.toLowerCase() === orderId.toLowerCase()
    );
}

function displayOrder(order) {
    document.getElementById("result-order-id").textContent = order.orderId;
    const orderDate = order.orderDate ? new Date(order.orderDate) : null;
    document.getElementById("result-order-date").textContent =
        orderDate && !Number.isNaN(orderDate.getTime()) ? orderDate.toLocaleString() : "";

    const total = Number(order.totalAmount);
    document.getElementById("result-order-total").textContent =
        Number.isFinite(total) ? `₹${total.toFixed(2)}` : "";

    const paymentStatus = document.getElementById("result-payment-status");
    paymentStatus.textContent = order.paymentStatus ? `Payment: ${order.paymentStatus}` : "";
    paymentStatus.hidden = !order.paymentStatus;

    orderResult.hidden = false;
    trackMessage.textContent = "";
}

async function trackOrder(orderId) {
    orderResult.hidden = true;

    try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);

        if (response.ok) {
            const result = await response.json();
            displayOrder(result.order);
            return;
        }

        if (response.status !== 404) {
            const result = await response.json();
            throw new Error(result.message || "Unable to retrieve this order.");
        }
    } catch (error) {
        try {
            const localOrder = findOrder(orderId);
            if (localOrder) {
                displayOrder(localOrder);
                trackMessage.textContent =
                    "Showing the saved browser copy; payment status may be out of date.";
                return;
            }
        } catch (localError) {
            trackMessage.textContent =
                localError instanceof Error ? localError.message : "Unable to load saved orders.";
            return;
        }

        trackMessage.textContent =
            error instanceof Error ? error.message : "Unable to retrieve this order.";
        return;
    }

    try {
        const localOrder = findOrder(orderId);
        if (localOrder) {
            displayOrder(localOrder);
            return;
        }

        trackMessage.textContent =
            "We couldn't find that order. Check the ID and try again.";
    } catch (error) {
        trackMessage.textContent =
            error instanceof Error ? error.message : "Unable to load saved orders.";
    }
}

trackOrderForm.addEventListener("submit", function(event) {
    event.preventDefault();
    trackOrder(orderIdInput.value.trim());
});

const requestedOrderId = new URLSearchParams(window.location.search).get("orderId");

if (requestedOrderId) {
    orderIdInput.value = requestedOrderId;
    trackOrder(requestedOrderId);
}
