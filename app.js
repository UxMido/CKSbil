window.CKS_init = function () {
  // år
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Active nav (rött streck)
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const navLinks = document.querySelectorAll(".nav a");
  navLinks.forEach(a => a.classList.remove("active"));

  const map = {
    "index.html": "hem",
    "": "hem",
    "vara-tjanster.html": "tjanster",
    "om-oss.html": "omoss",
    "kontakt.html": "kontakt",
  };

  const key = map[path] || "";
  const active = document.querySelector(`.nav a[data-nav="${key}"]`);
  if (active) active.classList.add("active");

  // BOOKING MODAL
  const openBtn = document.getElementById("openBooking");
  const modal = document.getElementById("bookingModal");
  if (!openBtn || !modal) return;

  const closeEls = modal.querySelectorAll("[data-bk-close]");
  const steps = [...modal.querySelectorAll(".bk-step")];
  const panels = [...modal.querySelectorAll(".bk-panel")];

  const back = document.getElementById("bkBack");
  const next = document.getElementById("bkNext");

  let step = 0;
  let state = { service: "" };

  function setStep(n) {
    step = Math.max(0, Math.min(3, n));

    steps.forEach((s, i) => {
      s.classList.toggle("is-active", i === step);
      s.setAttribute("aria-selected", i === step ? "true" : "false");
    });
    panels.forEach((p, i) => p.classList.toggle("is-active", i === step));

    back.disabled = step === 0;
    next.textContent = step === 3 ? "Skicka →" : "Fortsätt →";

    const title = modal.querySelector("#bkTitle");
    if (title) title.textContent =
      step === 0 ? "Välj tjänst" :
      step === 1 ? "Ditt fordon" :
      step === 2 ? "Dina uppgifter" : "Granska";

    if (step === 3) fillReview();
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    setStep(0);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  function fillReview() {
    const get = (id) => (document.getElementById(id)?.value || "").trim();
    const out = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || "-"; };

    out("bkOutService", state.service || "-");
    out("bkOutReg", get("bkReg"));
    out("bkOutModel", get("bkModel"));
    out("bkOutName", get("bkName"));
    out("bkOutEmail", get("bkEmail"));
    out("bkOutPhone", get("bkPhone"));
    out("bkOutMsg", get("bkMsg"));
  }

  openBtn.addEventListener("click", openModal);
  closeEls.forEach(el => el.addEventListener("click", closeModal));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // Step click
  steps.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = Number(btn.dataset.step || "0");
      // tillåt inte hoppa till review om ingen tjänst vald
      if (target > 0 && !state.service) return;
      setStep(target);
    });
  });

  // Service choose (Step 0)
  modal.querySelectorAll(".bk-item").forEach(item => {
    item.addEventListener("click", () => {
      state.service = item.dataset.service || "";
      setStep(1);
    });
  });

  back.addEventListener("click", () => setStep(step - 1));

  next.addEventListener("click", () => {
    if (step === 0) return;

    if (step === 1) return setStep(2);

    if (step === 2) {
      // enkel validering
      const name = (document.getElementById("bkName")?.value || "").trim();
      const email = (document.getElementById("bkEmail")?.value || "").trim();
      if (!name || !email) {
        alert("Fyll i namn och e-post.");
        return;
      }
      return setStep(3);
    }

    if (step === 3) {
      // demo “submit”
      alert("Tack! (Demo) Vi återkommer med pris & tid.");
      closeModal();
    }
  });
};

window.CKS_init = function () {
  // all nav / menu / klick-logik här
};


