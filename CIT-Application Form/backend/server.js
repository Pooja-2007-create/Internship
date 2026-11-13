const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const loginRoutes = require("./routes/loginRoutes");

app.use("/api", loginRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

async function startServer() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required in backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start the server:", error.message);
    process.exitCode = 1;
});