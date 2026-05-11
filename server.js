const express = require("express");
const cors = require("cors");
const scrapeProducts = require("./scraper");

const app = express();

app.use(cors());
app.use(express.static("public"));

app.get("/scrape", async (req, res) => {

    try {

        const products = await scrapeProducts();

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