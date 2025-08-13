/** @format */

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const keywordInput = document.getElementById("keyword-input");
  const scrapeButton = document.getElementById("scrape-button");
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error-message");
  const resultsContainer = document.getElementById("results-container");

  // Handle button click
  scrapeButton.addEventListener("click", async () => {
    const keyword = keywordInput.value.trim();

    // Validate input
    if (!keyword) {
      errorDiv.textContent = "Please enter a search keyword";
      resultsContainer.innerHTML = "";
      loadingDiv.style.display = "none";
      return;
    }

    // Show loading, clear previous content
    loadingDiv.style.display = "block";
    errorDiv.textContent = "";
    resultsContainer.innerHTML = "";

    try {
      // Make AJAX call to backend
      const response = await fetch(
        `http://localhost:3000/api/scrape?keyword=${encodeURIComponent(
          keyword
        )}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      // Check response status
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // Check for backend errors
      if (data.error) {
        throw new Error(data.error);
      }

      // Render products
      data.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
          <img src="${
            product.imageUrl || "https://via.placeholder.com/120"
          }" alt="${product.title || "Product"}" />
          <div class="product-info">
            <h3>${product.title || "No title"}</h3>
            <p>Rating: ${product.rating || "N/A"}</p>
            <p>Reviews: ${product.reviews || "N/A"}</p>
          </div>
        `;
        resultsContainer.appendChild(productCard);
      });
    } catch (error) {
      errorDiv.textContent = `Error: ${error.message}`;
    } finally {
      loadingDiv.style.display = "none";
    }
  });
});
