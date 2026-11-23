// After each deploy: tells search engines that use IndexNow (Bing, and through it
// ChatGPT and Copilot; also Yandex, Seznam, Naver…) which pages exist, so they come
// and look without waiting for their next visit. Google doesn't use IndexNow.
//
// It reads the live sitemap, so it always sends the addresses as they are published.
// The key isn't a secret: it's public on purpose, in public/<key>.txt, and only
// proves that whoever sends the list also controls the site.
//
//   node scripts/indexnow.mjs            (the deploy workflow runs it)

const KEY = "99b22a2286b53140db943848d5b0c505";
const SITE = (process.env.SITE_URL || "https://erickdonado.com").replace(/^http:/, "https:").replace(/\/$/, "");

const sitemap = await (await fetch(`${SITE}/sitemap.xml`, { cache: "no-store" })).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim().replace(/^http:/, "https:"));
if (!urlList.length) {
  console.log("indexnow: the sitemap had no addresses, nothing sent");
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
// 200 and 202 both mean accepted (202: the key is still being checked)
console.log(`indexnow: sent ${urlList.length} address(es), answer ${res.status}`);
if (res.status >= 400) console.log(await res.text().catch(() => ""));
