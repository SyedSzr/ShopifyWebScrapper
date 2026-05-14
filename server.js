const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const scrapeProducts = require("./scraper");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public"));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/index.html", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/pricing", (req, res) => res.sendFile(path.join(__dirname, "pricing.html")));
app.get("/pricing.html", (req, res) => res.sendFile(path.join(__dirname, "pricing.html")));
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "about.html")));
app.get("/about.html", (req, res) => res.sendFile(path.join(__dirname, "about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "contact.html")));
app.get("/contact.html", (req, res) => res.sendFile(path.join(__dirname, "contact.html")));

app.post("/upload", async (req, res) => {

    const { store, token, product } = req.body;

    if (!store || !token || !product) {
        return res.status(400).json({
            success: false,
            error: "Missing store, token or product data"
        });
    }

    try {

        const response = await axios.post(
            `https://${store}/admin/api/2025-01/products.json`,
            { product },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": token
                }
            }
        );

        res.json({
            success: true,
            data: response.data
        });

    } catch (err) {

        console.error("Shopify Upload Error:", err.response ? err.response.data : err.message);

        res.status(err.response ? err.response.status : 500).json({
            success: false,
            error: err.response ? err.response.data : err.message
        });
    }
});

app.get("/scrape", async (req, res) => {

    try {

        const products = await scrapeProducts({
            currentPage: 0,
            status: "",
            currentProduct: "",
            totalProducts: 0
        });

        res.json({
            success: true,
            total: products.length,
            products
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
