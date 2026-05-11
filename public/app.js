window.onload = function () {

    const scrapeBtn =
        document.getElementById("scrapeBtn");

    scrapeBtn.addEventListener("click", startScraping);

    async function startScraping() {

        scrapeBtn.disabled = true;

        document.getElementById("status")
            .innerText = "Starting...";

        try {

            fetch("/scrape");

            startProgressWatcher();

        } catch (err) {

            console.log(err);

            scrapeBtn.disabled = false;
        }
    }

    function startProgressWatcher() {

        const interval = setInterval(async () => {

            try {

                const response =
                    await fetch("/progress");

                const data =
                    await response.json();

                document.getElementById("status")
                    .innerText = data.status;

                document.getElementById("page")
                    .innerText = data.currentPage;

                document.getElementById("total")
                    .innerText = data.totalProducts;

                document.getElementById("product")
                    .innerText = data.currentProduct;

                if (
                    data.status === "Completed" ||
                    data.status === "Error"
                ) {

                    clearInterval(interval);

                    scrapeBtn.disabled = false;
                }

            } catch (err) {

                console.log(err);

                clearInterval(interval);

                scrapeBtn.disabled = false;
            }

        }, 1000);
    }
};