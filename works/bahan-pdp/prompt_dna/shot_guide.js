const { chromium } = require('playwright-core');
const path = require('path');
const exe = path.join(process.env.USERPROFILE, 'AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe');
const FILE = "C:/Users/User/WorkBuddy AI/2026-09-26-11-13-39/prompt_dna/Panduan_Prompt_DNA.html";
(async () => {
  const b = await chromium.launch({ executablePath: exe });
  const p = await b.newPage({ viewport: { width: 1100, height: 1000 }, deviceScaleFactor: 1.3 });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file:///' + FILE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.screenshot({ path: 'C:/Users/User/WorkBuddy AI/2026-09-26-11-13-39/prompt_dna/_shot_top.png' });
  await p.evaluate(() => document.querySelector('#pal').scrollIntoView());
  await p.waitForTimeout(400);
  await p.screenshot({ path: 'C:/Users/User/WorkBuddy AI/2026-09-26-11-13-39/prompt_dna/_shot_pal.png' });
  // copy-button smoke test
  const before = await p.$eval('pre.prompt', e => e.innerText.length);
  await p.click('.promptwrap .cp');
  await p.waitForTimeout(300);
  const label = await p.$eval('.promptwrap .cp', e => e.textContent);
  console.log('prompt chars:', before, '| copy button label after click:', label);
  console.log('console errors:', errs.length ? errs : 'NONE');
  await b.close();
})();
