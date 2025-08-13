/** @format */

import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";

const app = express();
const PORT = 3000;

// Endpoint: /api/scrape?keyword=yourKeyword
app.get("/api/scrape", async (req, res) => {
  const keyword = req.query.keyword as string;

  if (!keyword) {
    return res
      .status(400)
      .json({ error: "Keyword query parameter is required" });
  }

  try {
    // Construct Amazon search URL
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    // Fetch the page content with Axios (add User-Agent to mimic browser and avoid blocking)
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch Amazon page");
    }

    // Parse HTML with JSDOM
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Select product listings (Amazon uses .s-result-item for each product)
    const products = Array.from(
      document.querySelectorAll("[data-component-type='s-search-result']")
    );
    const results: any[] = [];

    products.forEach((product) => {
      // Extract title
      const titleElement = product.querySelector("[data-cy='title-recipe']");
      const title = titleElement ? titleElement.textContent?.trim() : null;
      console.log(title);
      // Extract rating (e.g., "4.5 out of 5 stars")
      const ratingElement = product.querySelector(".a-icon-alt");
      const rating = ratingElement ? ratingElement.textContent?.trim() : null;

      // Extract number of reviews
      const reviewsElement = product.querySelector(
        ".a-size-base.s-underline-text"
      );
      const reviews = reviewsElement
        ? reviewsElement.textContent?.trim()
        : null;

      // Extract image URL
      const imageElement = product.querySelector(".s-image");
      const imageUrl = imageElement
        ? (imageElement as HTMLImageElement).src
        : null;

      // Only add if title exists (filter out non-product items)
      if (title) {
        results.push({
          title,
          rating,
          reviews,
          imageUrl,
        });
      }
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while scraping Amazon" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
