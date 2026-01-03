async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Kunde inte ladda ${url} (${res.status})`);
  el.innerHTML = await res.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([
      loadPartial("#site-header", "./1header.html"),
      loadPartial("#site-footer", "./1footer.html")
    ]);

    // kör init efter att partials finns i DOM
    if (typeof window.CKS_init === "function") {
      window.CKS_init();
    }
  } catch (e) {
    console.error(e);
  }
});
