import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page, username: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/articles$/);
}

test("co-author can edit and lock blocks another editor", async ({ browser, page }) => {
  await signIn(page, "Zolly");
  await page.goto("/articles/new");
  await page.getByLabel("Title").fill("Playwright shared article");
  await page.getByLabel("Body").fill("Initial body");
  await page.getByText("John").click();
  await page.getByRole("button", { name: "Save article" }).click();
  await expect(page).toHaveURL(/\/articles\/(?!new$)[^/]+$/);

  const articleUrl = page.url().replace(/\/$/, "");

  const johnContext = await browser.newContext();
  const johnPage = await johnContext.newPage();
  await signIn(johnPage, "John");
  await johnPage.goto(`${articleUrl}/edit`);
  await expect(johnPage.getByLabel("Body")).toBeEnabled({ timeout: 10_000 });
  await johnPage.getByLabel("Body").fill("John was here");

  const zollyContext = await browser.newContext();
  const zollyPage = await zollyContext.newPage();
  await signIn(zollyPage, "Zolly");
  await zollyPage.goto(`${articleUrl}/edit`);
  await expect(zollyPage.getByText("currently being edited by John")).toBeVisible();
});