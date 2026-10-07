import { chromium } from "@playwright/test";
import fs from "node:fs";

fs.mkdirSync("artifacts/ui", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});

async function shot(name) {
  await page.waitForTimeout(220);
  await page.screenshot({
    path: "artifacts/ui/" + name + ".png",
    fullPage: false,
  });
}

async function reset() {
  await page.goto("http://127.0.0.1:19006", { waitUntil: "networkidle" });
}

async function enterManager() {
  await page.getByText("Continua con Google", { exact: true }).click();
  await page.getByText("Sono un capoparanza", { exact: true }).click();
  await page.getByText("Avanti", { exact: true }).click();
  await page.getByText("Avanti", { exact: true }).click();
  await page.getByText("Avanti", { exact: true }).click();
  await page.getByText("Vai alla tua paranza", { exact: true }).click();
}

async function enterCullatore() {
  await page.getByText("Continua con Google", { exact: true }).click();
  await page.getByText("Sono un cullatore", { exact: true }).click();
  await page.getByText("Avanti", { exact: true }).click();
  await page.getByText("Avanti", { exact: true }).click();
  await page.getByText("Unisciti alla paranza", { exact: true }).click();
  await page.getByText("Entra nell’app", { exact: true }).click();
}

await reset();
await shot("01-welcome");
await page.getByText("Continua con Google", { exact: true }).click();
await shot("02-role-selection");
await page.getByText("Sono un capoparanza", { exact: true }).click();
await page.getByText("Avanti", { exact: true }).click();
await shot("03-manager-create-paranza");
await page.getByText("Avanti", { exact: true }).click();
await shot("04-manager-colors");
await page.getByText("Avanti", { exact: true }).click();
await shot("05-manager-success");
await page.getByText("Vai alla tua paranza", { exact: true }).click();
await shot("06-manager-home");

await page.getByRole("button", { name: "Eventi" }).click();
await shot("07-manager-events");
await page.getByRole("button", { name: "add" }).click();
await shot("08-manager-create-event");
await page.getByRole("button", { name: "chevron-back" }).click();

await page.getByRole("button", { name: "Messaggi" }).click();
await shot("09-manager-messages");
await page.getByText("Nuovo messaggio", { exact: true }).click();
await shot("10-manager-new-message");
await page.getByRole("button", { name: "chevron-back" }).click();

await page.getByRole("button", { name: "Eventi" }).click();
await page.getByText("Prova della paranza", { exact: true }).first().click();
await shot("11-manager-participants");
await page.getByRole("button", { name: "chevron-back" }).click();

await page.getByRole("button", { name: "Cullatori" }).click();
await shot("12-manager-members");
await page.getByRole("button", { name: "Altro" }).click();
await shot("13-manager-stats");

await reset();
await page.getByText("Continua con Google", { exact: true }).click();
await page.getByText("Sono un cullatore", { exact: true }).click();
await page.getByText("Avanti", { exact: true }).click();
await shot("14-cullatore-profile-onboarding");
await page.getByText("Avanti", { exact: true }).click();
await shot("15-cullatore-join");
await page.getByText("Unisciti alla paranza", { exact: true }).click();
await shot("16-cullatore-success");
await page.getByText("Entra nell’app", { exact: true }).click();
await shot("17-cullatore-home");

await page.getByRole("button", { name: "Eventi" }).click();
await shot("18-cullatore-events");
await page.getByText("Prova della paranza", { exact: true }).first().click();
await shot("19-cullatore-event-detail");
await page.getByRole("button", { name: "chevron-back" }).click();

await page.getByRole("button", { name: "Messaggi" }).click();
await shot("20-cullatore-messages");
await page.getByRole("button", { name: "Calendario" }).click();
await shot("21-cullatore-calendar");
await page.getByRole("button", { name: "Profilo" }).click();
await shot("22-cullatore-profile");

await page.getByRole("button", { name: "Home" }).click();
await page.getByRole("button", { name: "notifications-outline" }).click();
await shot("23-cullatore-notifications");

await browser.close();
