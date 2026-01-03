function getBasePath() {
  // Om du ligger på GitHub Pages för projekt: /CKSbil/...
  // Då vill vi alltid hämta filer från /CKSbil/
  const parts = window.location.pathname.split("/").filter(Boolean);
  // parts[0] blir repo-namnet på project pages, t.ex. "CKSbil"
  if (parts.length > 0) return `/${parts[0]}/`;
  return "/";
}

async function loadPartial(selector, fileName) {
  const el = document.querySelector(selector);
  if (!el) return;

  const base = getBasePath();
  const url = new URL(fileName, window.location.origin + base).toString();

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Kunde inte ladda ${url} (${res.status})`);

  el.innerHTML = await res.text();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await Promise.all([
      loadPartial("#site-header", "1header.html"),
      loadPartial("#site-footer", "1footer.html")
    ]);

    // Kör init efter att partials finns i DOM
    if (typeof window.CKS_init === "function") {
      window.CKS_init();
    }
  } catch (e) {
    console.error("Include error:", e);
  }
});
