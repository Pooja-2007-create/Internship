const readline = require("node:readline");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const User = require("../models/user");

function ask(question) {
    const interface_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        interface_.question(question, (answer) => {
            interface_.close();
            resolve(answer.trim());
        });
    });
}

function askPassword(question) {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
        throw new Error("Run this command in an interactive terminal.");
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write(question);

    return new Promise((resolve, reject) => {
        let password = "";

        function finish(error) {
            process.stdin.removeListener("keypress", onKeypress);
            process.stdin.setRawMode(false);
            process.stdout.write("\n");
            if (error) {
                reject(error);
            } else {
                resolve(password);
            }
        }

        function onKeypress(character, key) {
            if (key.ctrl && key.name === "c") {
                finish(new Error("User creation cancelled."));
            } else if (key.name === "return" || key.name === "enter") {
                finish();
            } else if (key.name === "backspace") {
                password = password.slice(0, -1);
            } else if (character && !key.ctrl && !key.meta) {
                password += character;
            }
        }

        process.stdin.on("keypress", onKeypress);
    });
}

async function createUser() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required in backend/.env");
    }

    const email = await ask("Account email: ");
    const password = await askPassword("Account password (input is hidden): ");

    if (!email || !email.includes("@") || !password) {
        throw new Error("Enter a valid email address and a non-empty password.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new Error("An account already exists for that email.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash });
    console.log(`Created account for ${email.toLowerCase()}.`);
}

createUser()
    .catch((error) => {
        console.error("Could not create account:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
