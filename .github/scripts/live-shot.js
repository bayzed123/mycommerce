const { chromium } = require('playwright');
const fs = require('fs');

const targets = [
  { name: 'shopapi-swagger', url: 'https://mycommerce-production-131f.up.railway.app/api/schema/swagger-ui/' },
  { name: 'shopapi-admin', url: 'https://mycommerce-production-131f.up.railway.app/admin/login/' },
  { name: 'worker-health', url: 'https://mycommerce-api-gateway.sbayxed.workers.dev/health' },
  { name: 'storefront-home', url: 'https://mycommerce-storefront.sbayxed.workers.dev/' },
  { name: 'storefront-shop', url: 'https://mycommerce-storefront.sbayxed.workers.dev/shop' },
];

fs.mkdirSync('screenshots', { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const report = [];
  for (const t of targets) {
    try {
      const resp = await page.goto(t.url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `screenshots/${t.name}.png`, fullPage: true });
      report.push(`${t.name}: HTTP ${resp ? resp.status() : 'no-response'} — ${t.url}`);
    } catch (e) {
      report.push(`${t.name}: ERROR ${e.message} — ${t.url}`);
    }
  }
  await browser.close();
  fs.writeFileSync('screenshots/REPORT.txt', report.join('\n'));
  console.log(report.join('\n'));
})();
