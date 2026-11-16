const signinForm = document.getElementById("signin-form");
const toggleAuthModeButton = document.getElementById("toggle-auth-mode");
let isCreatingAccount = false;

if (toggleAuthModeButton) {
    toggleAuthModeButton.addEventListener("click", function() {
        isCreatingAccount = !isCreatingAccount;

        document.getElementById("signin-eyebrow").textContent =
            isCreatingAccount ? "JOIN SWEETIFY" : "WELCOME BACK";
        document.getElementById("signin-title").textContent =
            isCreatingAccount ? "Create your account." : "A little sweetness awaits.";
        document.getElementById("signin-intro").textContent =
            isCreatingAccount
                ? "Create an account to enjoy every sweet moment."
                : "Sign in to pick up where your cravings left off.";
        document.getElementById("signin-submit-label").textContent =
            isCreatingAccount ? "Create Account" : "Sign In";
        document.getElementById("signin-mode-prompt").textContent =
            isCreatingAccount ? "Already have an account?" : "New to Sweetify?";
        toggleAuthModeButton.textContent =
            isCreatingAccount ? "Sign in" : "Create an account";
        toggleAuthModeButton.setAttribute("aria-pressed", String(isCreatingAccount));
    });
}

if (signinForm) {
    signinForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("signin-email").value.trim();
        const password = document.getElementById("signin-password").value;

        try {
            const response = await fetch(
                isCreatingAccount ? "/api/users/create-user" : "/api/auth/signin",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || (isCreatingAccount ? "Account creation failed." : "Sign in failed."));
            }

            sessionStorage.setItem("sweetifySignedIn", "true");
            sessionStorage.setItem("sweetifyUserEmail", data.user.email);
            alert(isCreatingAccount ? "Account created successfully!" : "Sign in successful!");
            window.location.replace("index.html");
        } catch (error) {
            alert(error.message || (isCreatingAccount ? "Unable to create your account." : "Unable to sign in."));
        }
    });
}
