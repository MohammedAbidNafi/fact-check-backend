import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import * as fs from "fs";
import askAI from "./askAI";

const scanForLinks = (page: any) => {
  console.log("Scanning for links");
  return page.evaluate(() => {
    const aWithBr = document.querySelectorAll("a:has(br)");
    const hrefs = [];

    for (const anchor of Array.from(aWithBr)) {
      if (anchor.hasAttribute("href")) {
        hrefs.push(anchor.getAttribute("href"));
      }
    }

    return hrefs;
  });
};

async function scrapeGoogle(query: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log("Scraping Google for query:", query);

  let screenshotPath = null;
  let hrefs = null;
  let textContent = null;

  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    hrefs = await scanForLinks(page);
    console.log("Found links:", hrefs);

    await page.evaluate(() => {
      const styleElements = document.querySelectorAll(
        "style, link[rel='stylesheet']"
      );
      styleElements.forEach((element) => element.remove());
    });

    // Get only plain text content from the page
    textContent = await page.evaluate(() => {
      const textNodes = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      let footerReached = false;
      while (walker.nextNode() && !footerReached) {
        const node = walker.currentNode;
        if (
          node.parentElement &&
          node.parentElement.nodeName !== "SCRIPT" &&
          node.parentElement.nodeName !== "STYLE"
        ) {
          const text = node.textContent?.trim();
          if (text === "Related searches") {
            footerReached = true;
          } else if (text) {
            textNodes.push(text);
          }
        }
      }
      return textNodes.join("\n");
    });

    // Create the screenshots directory if it doesn't exist
    const screenshotsDir = path.resolve(__dirname, "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    // Take a screenshot of the entire page
    screenshotPath = path.resolve(screenshotsDir, `${uuidv4()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log("Screenshot saved:", screenshotPath);
    console.log("Entire text content:", textContent);
  } catch (error) {
    console.error("Error scraping Google:", error);
  } finally {
    await browser.close();
  }

  return { screenshotPath, hrefs, textContent };
}

export const runScraper = async (query: string) => {
  const { screenshotPath, hrefs, textContent } = await scrapeGoogle(query);
  const response = await askAI({ phrase: query, textContent });
  return { response };
};
