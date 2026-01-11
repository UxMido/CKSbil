window.CKS_init = function () {
  // år
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Active nav (rött streck) =====
  const pathname = (window.location.pathname || "").toLowerCase();
  const file = pathname.split("/").filter(Boolean).pop() || "index.html";

  const navLinks = document.querySelectorAll(".nav a");
  navLinks.forEach(a => a.classList.remove("active", "is-active"));

  const map = {
    "index.html": "hem",
    "": "hem",
    "vara-tjanster.html": "tjanster",
    "om-oss.html": "omoss",
    "kontakt.html": "kontakt",
  };

  const isRoot = pathname.endsWith("/cksbil/") || pathname.endsWith("/cksbil");
  const key = isRoot ? "hem" : (map[file] || "");

  const active = document.querySelector(`.nav a[data-nav="${key}"]`);
  if (active) active.classList.add("active", "is-active");

  // ==========================================================
  // ===== POPULÄRA TJÄNSTER (svc-carousel) ====================
  // ==========================================================
  function initSvcCarousel() {
    const track = document.getElementById("svcTrack");
    if (!track) return;

    const prevBtn = document.querySelector('.svc-btn[data-dir="-1"]');
    const nextBtn = document.querySelector('.svc-btn[data-dir="1"]');

    // Säker scroll
    track.style.overflowX = "auto";
    track.style.scrollBehavior = "smooth";
    track.style.webkitOverflowScrolling = "touch";

    const slides = Array.from(track.querySelectorAll(".svc-slide"));
    if (slides.length === 0) return;

    function maxScrollLeft() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function stepSize() {
      const first = slides[0];
      const rect = first.getBoundingClientRect();

      // försök läsa gap från CSS
      const cs = window.getComputedStyle(track);
      const gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;

      return Math.max(240, Math.round(rect.width + gap));
    }

    function loopIfNeeded(dir) {
      const max = maxScrollLeft();
      if (max <= 0) return;

      const eps = 3;
      const atStart = track.scrollLeft <= eps;
      const atEnd = track.scrollLeft >= (max - eps);

      if (dir > 0 && atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else if (dir < 0 && atStart) {
        track.scrollTo({ left: max, behavior: "smooth" });
      }
    }

    function scrollByDir(dir) {
      const max = maxScrollLeft();
      if (max <= 0) return;

      // om vi redan är i kanten: loopa direkt
      loopIfNeeded(dir);

      // scrolla ett kort
      track.scrollBy({ left: dir * stepSize(), behavior: "smooth" });

      // loop-check efter scrollen
      window.setTimeout(() => loopIfNeeded(dir), 350);
    }

    if (prevBtn) prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      scrollByDir(-1);
    });

    if (nextBtn) nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      scrollByDir(1);
    });

    // Auto-rotate
    let timer = null;
    const ROTATE_MS = 4500;

    function start() {
      stop();
      if (maxScrollLeft() > 0) {
        timer = window.setInterval(() => scrollByDir(1), ROTATE_MS);
      }
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    // pausa vid hover/touch
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive: true });
    track.addEventListener("touchend", start, { passive: true });

    // (valfritt) keyboard om sektionen syns
    document.addEventListener("keydown", (e) => {
      const r = track.getBoundingClientRect();
      const visible = r.bottom > 0 && r.top < window.innerHeight;
      if (!visible) return;

      if (e.key === "ArrowLeft") scrollByDir(-1);
      if (e.key === "ArrowRight") scrollByDir(1);
    });

    start();
  }

  initSvcCarousel();

  // ==========================================================
  // ===== BOOKING MODAL (din) ================================
  // ==========================================================
  const openBtn = document.getElementById("openBooking");
  const modal = document.getElementById("bookingModal");

  // ✅ INGET return här längre – vi skippar bara modal-init om den saknas
  if (openBtn && modal) {
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

      if (back) back.disabled = step === 0;
      if (next) next.textContent = step === 3 ? "Skicka →" : "Fortsätt →";

      const title = modal.querySelector("#bkTitle");
      if (title) {
        title.textContent =
          step === 0 ? "Välj tjänst" :
          step === 1 ? "Ditt fordon" :
          step === 2 ? "Dina uppgifter" : "Granska";
      }

      if (step === 3) fillReview();
    }

    function openModal(e) {
      if (e) e.preventDefault();
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      setStep(0);
    }

    function closeModal(e) {
      if (e) e.preventDefault();
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    }

    function fillReview() {
      const get = (id) => (document.getElementById(id)?.value || "").trim();
      const out = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || "-";
      };

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

    steps.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = Number(btn.dataset.step || "0");
        if (target > 0 && !state.service) return;
        setStep(target);
      });
    });

    modal.querySelectorAll(".bk-item").forEach(item => {
      item.addEventListener("click", () => {
        state.service = item.dataset.service || "";
        setStep(1);
      });
    });

    if (back) back.addEventListener("click", () => setStep(step - 1));

    if (next) {
      next.addEventListener("click", () => {
        if (step === 0) return;

        if (step === 1) return setStep(2);

        if (step === 2) {
          const name = (document.getElementById("bkName")?.value || "").trim();
          const email = (document.getElementById("bkEmail")?.value || "").trim();
          if (!name || !email) {
            alert("Fyll i namn och e-post.");
            return;
          }
          return setStep(3);
        }

        if (step === 3) {
          alert("Tack! (Demo) Vi återkommer med pris & tid.");
          closeModal();
        }
      });
    }
  }
};
