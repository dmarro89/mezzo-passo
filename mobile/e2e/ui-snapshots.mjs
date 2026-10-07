import { chromium } from "@playwright/test";
import fs from "node:fs";

fs.mkdirSync("artifacts/ui", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

async function shot(name) {
  await page.screenshot({ path: "artifacts/ui/" + name + ".png", fullPage: true });
}

await page.goto("http://127.0.0.1:19006", { waitUntil: "networkidle" });
await shot("01-welcome");

await page.getByText("Continua con Google").click();
await page.getByText("Sono un capoparanza").click();
await page.getByText("Avanti").click();
await page.getByText("Avanti").click();
await page.getByText("Avanti").click();
await page.getByText("Vai alla tua paranza").click();
await page.waitForTimeout(300);
await shot("02-capoparanza-home");

await page.getByText("Altro").click();
await page.getByText("Esci dalla demo").click();
await page.getByText("Continua con Google").click();
await page.getByText("Sono un cullatore").click();
await page.getByText("Avanti").click();
await page.getByText("Avanti").click();
await page.getByText("Unisciti alla paranza").click();
await page.getByText("Entra nell’app").click();
await page.waitForTimeout(300);
await shot("03-cullatore-home");

await browser.close();
