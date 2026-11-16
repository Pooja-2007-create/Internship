const lookupForm = document.getElementById("admin-order-lookup");
const verifyForm = document.getElementById("admin-verify-form");
const orderDetails = document.getElementById("admin-order-details");
const adminMessage = document.getElementById("admin-message");
const verifyButton = document.getElementById("admin-verify-button");
let currentOrder = null;

function displayAdminOrder(order) {
    currentOrder = order;
    document.getElementById("admin-result-order-id").textContent = order.orderId;
    document.getElementById("admin-result-total").textContent =
        `₹${Number(order.totalAmount).toFixed(2)}`;
    document.getElementById("admin-result-method").textContent = order.paymentMethod;
    document.getElementById("admin-result-status").textContent = order.paymentStatus;
    document.getElementById("admin-result-reference").textContent =
        order.transactionReference || "Not submitted";
    document.getElementById("admin-transaction-reference").value =
        order.transactionReference || "";
    verifyButton.disabled = order.paymentStatus !== "Pending";
    orderDetails.hidden = false;
}

lookupForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    orderDetails.hidden = true;
    adminMessage.textContent = "";
    currentOrder = null;

    const orderId = document.getElementById("admin-order-id").value.trim();
    try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Unable to find this order.");
        }
        displayAdminOrder(result.order);
    } catch (error) {
        adminMessage.textContent =
            error instanceof Error ? error.message : "Unable to find this order.";
    }
});

verifyForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    if (!currentOrder) {
        adminMessage.textContent = "Find an order before verifying payment.";
        return;
    }

    adminMessage.textContent = "";
    verifyButton.disabled = true;
    const transactionReference =
        document.getElementById("admin-transaction-reference").value.trim();
    const verificationKey = document.getElementById("admin-verification-key").value;

    try {
        const response = await fetch(
            `/api/orders/${encodeURIComponent(currentOrder.orderId)}/verify-payment`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-payment-verification-key": verificationKey
                },
                body: JSON.stringify({
                    transactionReference: transactionReference || undefined
                })
            }
        );
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Unable to verify this payment.");
        }

        displayAdminOrder(result.order);
        adminMessage.textContent = result.message;
        document.getElementById("admin-verification-key").value = "";
    } catch (error) {
        adminMessage.textContent =
            error instanceof Error ? error.message : "Unable to verify this payment.";
        verifyButton.disabled = currentOrder.paymentStatus !== "Pending";
    }
});
