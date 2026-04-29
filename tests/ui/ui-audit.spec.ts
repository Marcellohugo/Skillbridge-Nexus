import { test, expect, type Page } from "@playwright/test";

const baseURL = process.env.UI_AUDIT_BASE_URL ?? "http://localhost:3000";

type Role = "public" | "learner" | "mentor" | "admin" | "institution";

const accounts: Record<Exclude<Role, "public">, string> = {
  learner: "learner@skillbridge.id",
  mentor: "mentor@skillbridge.id",
  admin: "admin@skillbridge.id",
  institution: "institution@skillbridge.id",
};

const routes: Array<{ role: Role; path: string; name: string }> = [
  { role: "public", path: "/", name: "public-home" },
  { role: "public", path: "/login", name: "login" },
  { role: "public", path: "/register", name: "register" },
  { role: "public", path: "/forgot-password", name: "forgot-password" },
  { role: "learner", path: "/dashboard", name: "learner-dashboard" },
  { role: "learner", path: "/learning-path", name: "learner-learning-path" },
  { role: "learner", path: "/mentors", name: "learner-mentors" },
  { role: "learner", path: "/portfolio", name: "learner-portfolio" },
  { role: "learner", path: "/assessment", name: "learner-assessment" },
  { role: "learner", path: "/skill-tree", name: "learner-skill-tree" },
  { role: "learner", path: "/resume", name: "learner-resume" },
  { role: "mentor", path: "/mentor/dashboard", name: "mentor-dashboard" },
  { role: "mentor", path: "/mentor/learners", name: "mentor-learners" },
  { role: "mentor", path: "/mentor/sessions", name: "mentor-sessions" },
  { role: "admin", path: "/admin/dashboard", name: "admin-dashboard" },
  { role: "admin", path: "/admin/users", name: "admin-users" },
  { role: "admin", path: "/admin/skills", name: "admin-skills" },
  { role: "institution", path: "/institution/dashboard", name: "institution-dashboard" },
  { role: "institution", path: "/institution/cohorts", name: "institution-cohorts" },
  { role: "institution", path: "/institution/members", name: "institution-members" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 950 },
  { name: "mobile", width: 390, height: 844 },
];

async function login(page: Page, role: Exclude<Role, "public">) {
  await page.goto(`${baseURL}/login`, { waitUntil: "networkidle" });
  await page.locator("#email").fill(accounts[role]);
  await page.locator("#password").fill("password123");
  await page.getByRole("button", { name: /^Masuk|^Sign in/i }).click();
  await page.waitForURL((url) => url.pathname !== "/login", { timeout: 15_000 });
  await page.waitForLoadState("networkidle");

  const cookies = await page.context().cookies(baseURL);
  expect(cookies.some((cookie) => cookie.name === "auth_token"), `${role} auth cookie`).toBe(true);
}

async function auditPage(page: Page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const horizontalOverflow = root.scrollWidth - root.clientWidth;
    return { horizontalOverflow };
  });
}

async function captureRuntimeIssues(page: Page) {
  const consoleIssues: string[] = [];
  const pageIssues: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleIssues.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => pageIssues.push(error.message));
  return { consoleIssues, pageIssues };
}

for (const viewport of viewports) {
  test.describe(`ui smoke ${viewport.name}`, () => {
    test.use({ viewport });

    for (const role of ["public", "learner", "mentor", "admin", "institution"] as Role[]) {
      test(`renders ${role} routes without visual/runtime regressions`, async ({ page }) => {
        const { consoleIssues, pageIssues } = await captureRuntimeIssues(page);

        if (role !== "public") {
          await login(page, role);
        }

        for (const route of routes.filter((item) => item.role === role)) {
          await page.goto(`${baseURL}${route.path}`, { waitUntil: "networkidle" });
          expect(new URL(page.url()).pathname, `${route.name} resolved path`).toBe(route.path);
          await expect(page.locator("body")).toBeVisible();
          const metrics = await auditPage(page);
          expect(metrics.horizontalOverflow, `${route.name} horizontal overflow`).toBeLessThanOrEqual(4);
        }

        expect(pageIssues, "page errors").toEqual([]);
        expect(consoleIssues, "console errors/warnings").toEqual([]);
      });
    }
  });
}

test.describe("shell interactions", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile drawer and accessibility panel stay stable", async ({ page }) => {
    const { consoleIssues, pageIssues } = await captureRuntimeIssues(page);

    await login(page, "learner");
    await page.goto(`${baseURL}/dashboard`, { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /Buka menu|Open menu/i }).click();
    await expect(page.getByRole("dialog", { name: /Navigasi mobile|Mobile navigation/i })).toBeVisible();
    expect((await auditPage(page)).horizontalOverflow, "mobile drawer horizontal overflow").toBeLessThanOrEqual(4);

    await page.getByRole("button", { name: /Aksesibilitas|Accessibility/i }).click();
    await expect(page.getByRole("dialog", { name: /Aksesibilitas|Accessibility/i })).toBeVisible();
    expect((await auditPage(page)).horizontalOverflow, "a11y panel horizontal overflow").toBeLessThanOrEqual(4);

    await page.getByRole("button", { name: /Selesai|Done/i }).click();

    expect(pageIssues, "page errors").toEqual([]);
    expect(consoleIssues, "console errors/warnings").toEqual([]);
  });
});
