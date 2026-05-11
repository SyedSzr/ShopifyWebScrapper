const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const BASE_URL = "https://thestylenstuff.com";

async function scrapeProducts(progress) {

    let page = 1;
    let allProducts = [];

    while (true) {

        progress.currentPage = page;
        progress.status = `Scraping Page ${page}`;

        const url = `${BASE_URL}/products.json?limit=250&page=${page}`;

        console.log("Scraping:", url);

        const response = await axios.get(url);

        const products = response.data.products;

        if (!products.length) break;

        for (const product of products) {

            progress.currentProduct = product.title;

            const item = {
                title: product.title,
                category: product.product_type,
                images: []
            };

            console.log("Product:", product.title);

            for (const image of product.images) {

                item.images.push(image.src);

                try {

                    const imageResponse = await axios({
                        url: image.src,
                        method: "GET",
                        responseType: "stream"
                    });

                    const fileName = path.basename(image.src.split("?")[0]);

                    const savePath = path.join(
                        __dirname,
                        "downloads",
                        fileName
                    );

                    await fs.ensureDir(path.dirname(savePath));

                    imageResponse.data.pipe(
                        fs.createWriteStream(savePath)
                    );

                } catch (err) {

                    console.log("Image download failed");
                }
            }

            allProducts.push(item);

            progress.totalProducts = allProducts.length;
        }

        page++;
    }

    await fs.ensureDir("./data");

    await fs.writeJson("./data/products.json", allProducts, {
        spaces: 2
    });

    return allProducts;
}

module.exports = scrapeProducts;