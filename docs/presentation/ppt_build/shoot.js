const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.25 });

  // Start the Spring Boot app first: .\mvnw.cmd spring-boot:run
  await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  const out = "C:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/ppt_build";
  await page.screenshot({ path: path.join(out, "shot_overview.png") });

  await page.click('button[data-page="books"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "shot_books.png") });

  await page.click('button[data-page="loans"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "shot_loans.png") });

  // Modal screenshot: check-out dialog from overview page
  await page.click('button[data-page="overview"]');
  await page.waitForTimeout(400);
  await page.evaluate(() => openModal("borrow"));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "shot_modal.png") });

  await browser.close();
  console.log("screenshots done");
})();

