import { chromium } from "file:///C:/Users/User/.workbuddy-ai/binaries/node/workspace/node_modules/playwright-core/index.mjs";

const CHROME = "C:/Users/User/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://127.0.0.1:8731";
const OUT = "C:/Users/User/WorkBuddy AI/2026-09-25-12-28-37/.verify";

const ROUTES = [
  ["utama", ["Sekolah Kebangsaan", "Seiring Melangkah Ke Hadapan", "Sekilas Pandang"], 400],
  ["profil", ["Profil & Sejarah Sekolah", "Empat Dekad Mendidik", "Garis Masa"], 400],
  ["pentadbiran", ["Pentadbiran & Tenaga Pengajar", "Carta Organisasi", "Panitia Mata Pelajaran"], 400],
  ["pencapaian", ["Pencapaian & Pengiktirafan", "Rekod Penyertaan", "Komposisi Enrolmen"], 400],
  ["berita", ["Berita & Pengumuman", "Yayasan Bank Rakyat", "Bantuan"], 400],
  ["galeri", ["Galeri Media", "Nota galeri"], 400],
  ["hubungi", ["Hubungi Kami", "Hantar Mesej", "Butiran Rasmi"], 400],
  ["pegawai", ["Portal Pegawai", "Kod akses sekolah"], 250],
];

const problems = [];
const notes = [];

function log(...a) { console.log(...a); }

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

page.on("console", (m) => {
  if (m.type() === "error") problems.push(`[console] ${m.text()}`);
});
page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => {
  const u = r.url();
  if (u.includes("google.com/maps") || u.includes("fonts.g")) { notes.push(`network (external): ${u.slice(0, 90)}`); return; }
  problems.push(`[requestfailed] ${u.slice(0, 140)} — ${r.failure()?.errorText}`);
});

// ---------- walk every route ----------
for (const [route, needles, minChars] of ROUTES) {
  await page.goto(`${BASE}/index.html#/${route}`, { waitUntil: "load" });
  await page.waitForTimeout(900);

  const view = page.locator(`.view[data-view="${route}"]`);
  if (!(await view.isVisible())) { problems.push(`route ${route}: view not visible`); continue; }

  const text = (await view.innerText()).replace(/\s+/g, " ");
  if (text.length < minChars) problems.push(`route ${route}: rendered only ${text.length} chars (min ${minChars})`);

  for (const n of needles) {
    if (!text.toLowerCase().includes(n.toLowerCase())) problems.push(`route ${route}: missing text "${n}"`);
  }

  const activeCount = await page.locator(".view.is-active").count();
  if (activeCount !== 1) problems.push(`route ${route}: ${activeCount} active views (expected 1)`);

  const h = await page.evaluate(() => document.body.scrollHeight);
  log(`  ${route.padEnd(13)} chars=${String(text.length).padStart(5)}  pageH=${h}px`);
  await page.screenshot({ path: `${OUT}/${route}.png`, fullPage: false });
}

// ---------- hero / count-up ----------
await page.goto(`${BASE}/index.html#/utama`, { waitUntil: "load" });
await page.waitForTimeout(2600);
const counters = await page.locator(".hero-facts [data-count]").allInnerTexts();
log("\nhero counters:", counters.join(" | "));
if (!counters.some((c) => c.includes("302"))) problems.push("count-up did not reach 302");
if (!counters.some((c) => c.trim() === "1983")) problems.push(`year counter rendered "${counters[2]}" (expected plain 1983)`);

// header must not wrap to two lines at desktop width
const navBoxes = await page.locator(".nav a").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
const navMax = Math.max(...navBoxes);
log(`nav link heights: ${navBoxes.join(",")} (max ${navMax}px)`);
if (navMax > 44) problems.push(`header nav wraps to two lines (max link height ${navMax}px)`);
const headerH = await page.evaluate(() => Math.round(document.querySelector(".header-inner").getBoundingClientRect().height));
log(`header-inner height: ${headerH}px`);
if (headerH > 100) problems.push(`header too tall: ${headerH}px`);

// ---------- news filter ----------
await page.goto(`${BASE}/index.html#/berita`, { waitUntil: "load" });
await page.waitForTimeout(600);
const totalNews = await page.locator("#newsGrid .news-card").count();
await page.locator(`.view[data-view="berita"] .chip[data-filter="sukan"]`).click();
await page.waitForTimeout(400);
const visibleNews = await page.locator("#newsGrid .news-card:visible").count();
log(`news filter: total=${totalNews} sukan=${visibleNews}`);
if (totalNews !== 6) problems.push(`expected 6 news cards, found ${totalNews}`);
if (visibleNews !== 2) problems.push(`sukan filter expected 2 visible, got ${visibleNews}`);
await page.screenshot({ path: `${OUT}/berita-filtered.png` });

// ---------- gallery lightbox ----------
await page.goto(`${BASE}/index.html#/galeri`, { waitUntil: "load" });
await page.waitForTimeout(600);
const tiles = await page.locator("#galleryGrid .tile").count();
await page.locator("#galleryGrid .tile").first().click();
await page.waitForTimeout(600);
const lbOpen = await page.locator("#lightbox").evaluate((el) => el.classList.contains("is-open"));
const lbSrc = await page.locator("#lightboxImg").getAttribute("src");
log(`gallery: tiles=${tiles} lightboxOpen=${lbOpen} src=${lbSrc}`);
if (tiles !== 9) problems.push(`expected 9 gallery tiles, found ${tiles}`);
if (!lbOpen || !lbSrc) problems.push("lightbox did not open with an image");
await page.screenshot({ path: `${OUT}/galeri-lightbox.png` });
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// ---------- contact form validation ----------
await page.goto(`${BASE}/index.html#/hubungi`, { waitUntil: "load" });
await page.waitForTimeout(500);
await page.locator("#contactForm button[type=submit]").click();
await page.waitForTimeout(400);
const errCount = await page.locator("#contactForm .field.has-error").count();
log(`contact form: invalid submit -> ${errCount} error fields`);
if (errCount < 4) problems.push(`contact validation: expected >=4 error fields, got ${errCount}`);
await page.screenshot({ path: `${OUT}/hubungi-errors.png` });

await page.fill("#cNama", "Ahmad bin Ali");
await page.fill("#cEmel", "ahmad@contoh.com");
await page.selectOption("#cKategori", "Pertanyaan Umum");
await page.fill("#cMesej", "Saya ingin bertanya mengenai pendaftaran murid baharu tahun hadapan.");
await page.locator("#contactForm button[type=submit]").click();
await page.waitForTimeout(700);
const toastShown = await page.locator("#toast").evaluate((el) => el.classList.contains("is-shown"));
const toastMsg = await page.locator("#toastText").innerText();
log(`contact form: valid submit -> toast=${toastShown} "${toastMsg}"`);
if (!toastShown) problems.push("contact form valid submit did not show toast");
await page.screenshot({ path: `${OUT}/hubungi-success.png` });

// ---------- officer gate: wrong creds ----------
await page.goto(`${BASE}/index.html#/pegawai`, { waitUntil: "load" });
await page.waitForTimeout(500);
await page.fill("#gKod", "WRONG");
await page.fill("#gPass", "nope");
await page.locator("#gateForm button[type=submit]").click();
await page.waitForTimeout(500);
const alertShown = await page.locator("#gateAlert").evaluate((el) => el.classList.contains("is-shown"));
const stillGate = await page.locator(`.view[data-view="pegawai"]`).isVisible();
log(`gate: wrong creds -> alert=${alertShown} stillOnGate=${stillGate}`);
if (!alertShown) problems.push("gate: invalid credentials did not show alert");
if (!stillGate) problems.push("gate: invalid credentials still navigated away");
await page.screenshot({ path: `${OUT}/pegawai-denied.png` });

// ---------- officer gate: correct creds ----------
await page.fill("#gKod", "XBA5218");
await page.fill("#gPass", "nazir2026");
await page.locator("#gateForm button[type=submit]").click();
await page.waitForTimeout(1000);
const dashVisible = await page.locator(`.view[data-view="dashboard"]`).isVisible();
const dashText = dashVisible ? (await page.locator(`.view[data-view="dashboard"]`).innerText()) : "";
log(`gate: correct creds -> dashboard=${dashVisible} chars=${dashText.length}`);
if (!dashVisible) problems.push("gate: valid credentials did not open dashboard");
if (dashText.length < 600) problems.push(`dashboard rendered only ${dashText.length} chars`);
await page.screenshot({ path: `${OUT}/dashboard-data.png` });

// ---------- dashboard panels ----------
for (const [panel, needle] of [
  ["kualiti", "Standard 1"],
  ["pentadbir", "London Gogomboh"],
  ["pencapaian", "Kejohanan Catur MSSD Pitas"],
  ["kewangan", "Yayasan Bank Rakyat"],
  ["muatturun", "Laporan Lawatan Jemaah Nazir"],
]) {
  await page.locator(`.dash-nav button[data-panel="${panel}"]`).click();
  await page.waitForTimeout(700);
  const pt = (await page.locator(`.dash-panel[data-panel="${panel}"]`).innerText()).replace(/\s+/g, " ");
  const title = await page.locator("#dashTitle").innerText();
  if (!pt.toLowerCase().includes(needle.toLowerCase())) problems.push(`dashboard panel ${panel}: missing "${needle}"`);
  if (title.length < 5) problems.push(`dashboard panel ${panel}: header title not updated`);
  log(`  panel ${panel.padEnd(11)} chars=${String(pt.length).padStart(5)}  title="${title}"`);
  await page.screenshot({ path: `${OUT}/dashboard-${panel}.png` });
}

// ---------- document downloads ----------
await page.locator(`.dash-nav button[data-panel="muatturun"]`).click();
await page.waitForTimeout(400);
const hrefs = await page.locator(".dash-panel[data-panel='muatturun'] .doc-dl").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
log(`download links: ${hrefs.length}`);
for (const href of hrefs) {
  const res = await page.request.get(`${BASE}/${href}`);
  if (!res.ok()) problems.push(`download ${href} -> HTTP ${res.status()}`);
  const ct = res.headers()["content-type"] || "";
  const buf = await res.body();
  if (!buf.slice(0, 5).toString().startsWith("%PDF")) problems.push(`download ${href} is not a PDF`);
  if (!ct.includes("pdf")) notes.push(`download ${href} content-type=${ct}`);
}
log(`  all ${hrefs.length} documents verified as PDF`);

// ---------- mobile ----------
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mp = await m.newPage();
mp.on("pageerror", (e) => problems.push(`[mobile pageerror] ${e.message}`));
await mp.goto(`${BASE}/index.html#/utama`, { waitUntil: "load" });
await mp.waitForTimeout(1400);
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
log(`\nmobile: horizontal overflow = ${overflow}px`);
if (overflow > 3) problems.push(`mobile horizontal overflow ${overflow}px`);
await mp.screenshot({ path: `${OUT}/mobile-home.png` });

// hero copy must not be covered by the fact strip at any small size
for (const [w, h] of [[390, 844], [360, 740], [768, 1024], [900, 620]]) {
  const t = await browser.newContext({ viewport: { width: w, height: h } });
  const tp = await t.newPage();
  await tp.goto(`${BASE}/index.html#/utama`, { waitUntil: "load" });
  await tp.waitForTimeout(700);
  const clash = await tp.evaluate(() => {
    const lead = document.querySelector(".hero p.lead").getBoundingClientRect();
    const cta = document.querySelector(".hero-cta").getBoundingClientRect();
    const facts = document.querySelector(".hero-facts").getBoundingClientRect();
    const bar = document.querySelector(".topbar");
    const tb = bar && getComputedStyle(bar).display !== "none" ? bar.getBoundingClientRect() : null;
    const hdr = document.querySelector(".header-inner").getBoundingClientRect();
    return {
      factsOverlap: Math.round(cta.bottom - facts.top),
      topbarOverlap: tb ? Math.round(tb.bottom - hdr.top) : 0,
      topbarClipped: tb ? Math.round(bar.scrollHeight - tb.height) : 0,
      heroOverflow: Math.round(document.documentElement.scrollWidth - window.innerWidth),
      hamburgerRight: Math.round(document.querySelector("#hamburger").getBoundingClientRect().right),
      brandRight: Math.round(document.querySelector(".brand").getBoundingClientRect().right),
      actionsLeft: Math.round(document.querySelector(".header-actions").getBoundingClientRect().left),
      vw: window.innerWidth
    };
  });
  log(`  ${w}x${h}: cta-bottom-to-facts = ${clash.factsOverlap}px, topbar/header overlap = ${clash.topbarOverlap}px, topbar clipped = ${clash.topbarClipped}px, h-overflow = ${clash.heroOverflow}px`);
  log(`           brand.right=${clash.brandRight} actions.left=${clash.actionsLeft} hamburger.right=${clash.hamburgerRight} vw=${clash.vw}`);
  if (clash.factsOverlap > 0) problems.push(`hero at ${w}x${h}: fact strip overlaps CTA by ${clash.factsOverlap}px`);
  if (clash.topbarOverlap > 0) problems.push(`topbar at ${w}x${h} overlaps header by ${clash.topbarOverlap}px`);
  if (clash.topbarClipped > 2) problems.push(`topbar at ${w}x${h} is clipped by ${clash.topbarClipped}px`);
  if (clash.heroOverflow > 3) problems.push(`hero at ${w}x${h}: horizontal overflow ${clash.heroOverflow}px`);
  if (clash.hamburgerRight > clash.vw) problems.push(`hamburger clipped at ${w}x${h}: right=${clash.hamburgerRight} > vw=${clash.vw}`);
  if (clash.brandRight > clash.actionsLeft) problems.push(`header brand overlaps actions at ${w}x${h}`);
  await tp.screenshot({ path: `${OUT}/hero-${w}x${h}.png` });
  await t.close();
}
await mp.locator("#hamburger").click();
await mp.waitForTimeout(700);
const drawerOpen = await mp.locator("#drawer").evaluate((el) => el.classList.contains("is-open"));
log(`mobile: drawer open = ${drawerOpen}`);
if (!drawerOpen) problems.push("mobile drawer did not open");
await mp.screenshot({ path: `${OUT}/mobile-drawer.png` });
await mp.locator(`#drawer a[data-nav="profil"]`).click();
await mp.waitForTimeout(900);
const mProfil = await mp.locator(`.view[data-view="profil"]`).isVisible();
const mOverflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
log(`mobile: drawer nav -> profil visible=${mProfil} overflow=${mOverflow}px`);
if (!mProfil) problems.push("mobile drawer navigation failed");
if (mOverflow > 3) problems.push(`mobile profil overflow ${mOverflow}px`);
await mp.screenshot({ path: `${OUT}/mobile-profil.png` });

await browser.close();

console.log("\n================ RESULT ================");
if (notes.length) {
  console.log(`\nNotes (non-fatal, ${notes.length}):`);
  [...new Set(notes)].forEach((n) => console.log("  - " + n));
}
if (problems.length) {
  console.log(`\nPROBLEMS (${problems.length}):`);
  [...new Set(problems)].forEach((p) => console.log("  x " + p));
  process.exit(1);
}
console.log("\nAll checks passed.");
