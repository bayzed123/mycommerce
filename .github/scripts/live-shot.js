const { chromium } = require('playwright');
const fs = require('fs');

const STOREFRONT = 'https://mycommerce-storefront.sbayxed.workers.dev';

const targets = [
  { name: 'shopapi-swagger', url: 'https://mycommerce-production-131f.up.railway.app/api/schema/swagger-ui/' },
  { name: 'shopapi-admin', url: 'https://mycommerce-production-131f.up.railway.app/admin/login/' },
  { name: 'storefront-home', url: `${STOREFRONT}/` },
  { name: 'storefront-collection', url: `${STOREFRONT}/shop/collection/tops` },
  { name: 'storefront-cart', url: `${STOREFRONT}/cart` },
  { name: 'storefront-account', url: `${STOREFRONT}/account/` },
  { name: 'storefront-wishlist', url: `${STOREFRONT}/wishlist` },
  { name: 'storefront-guide', url: `${STOREFRONT}/guide` },
];

fs.mkdirSync('screenshots', { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const report = [];

  // 1. Screenshot + status for each route.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
  });

  for (const t of targets) {
    try {
      const resp = await page.goto(t.url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `screenshots/${t.name}.png`, fullPage: true });
      report.push(`${t.name}: HTTP ${resp ? resp.status() : 'no-response'} — ${t.url}`);
    } catch (e) {
      report.push(`${t.name}: ERROR ${e.message.split('\n')[0]} — ${t.url}`);
    }
  }

  // 2. Navigation check: collect every in-app link on the homepage and
  // request each one, so "navigation is broken" becomes a concrete list
  // of which hrefs return what.
  report.push('', '=== NAVIGATION: every internal link found on the homepage ===');
  try {
    await page.goto(`${STOREFRONT}/`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);

    const hrefs = await page.$$eval('a[href]', (as) =>
      Array.from(new Set(
        as.map((a) => a.getAttribute('href'))
          .filter((h) => h && h.startsWith('/') && !h.startsWith('//'))
      ))
    );

    if (hrefs.length === 0) {
      report.push('NO internal links found in the rendered DOM at all.');
    }

    for (const href of hrefs) {
      const url = `${STOREFRONT}${href}`;
      try {
        const r = await page.request.get(url, { maxRedirects: 5 });
        report.push(`  ${r.status()}  ${href}`);
      } catch (e) {
        report.push(`  ERR  ${href} (${e.message.split('\n')[0]})`);
      }
    }
  } catch (e) {
    report.push(`navigation crawl failed: ${e.message.split('\n')[0]}`);
  }

  // 3. Client-side errors, which is what a "nothing happens when I click"
  // symptom usually looks like.
  report.push('', '=== BROWSER CONSOLE ERRORS ===');
  report.push(consoleErrors.length ? consoleErrors.join('\n') : '(none)');

  await browser.close();
  fs.writeFileSync('screenshots/REPORT.txt', report.join('\n'));
  console.log(report.join('\n'));
})();
