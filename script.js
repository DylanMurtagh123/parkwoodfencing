/* =========================================================
   PARKWOOD FENCING & DECKING — Homepage Script
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     Sticky header state on scroll
     --------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Hero — subtle parallax drift on pointer move
     A small, premium touch: the background image drifts a
     few pixels opposite the cursor. Skipped on touch devices
     and for reduced-motion users.
     --------------------------------------------------------- */
  const heroMedia = document.querySelector(".hero-media");
  const heroSection = document.querySelector(".hero");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  if (heroMedia && heroSection && !prefersReducedMotion && !isTouch) {
    heroSection.addEventListener("pointermove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const maxShift = 14;
      heroMedia.style.transform = `translate(${x * -maxShift}px, ${y * -maxShift}px)`;
    });

    heroSection.addEventListener("pointerleave", () => {
      heroMedia.style.transform = "translate(0, 0)";
    });
  }

  /* ---------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const navScrim = document.getElementById("navScrim");

  function closeNav() {
    mobileNav.classList.remove("is-open");
    navScrim.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    mobileNav.classList.add("is-open");
    navScrim.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  }

  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  navScrim.addEventListener("click", closeNav);
  mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

  /* ---------------------------------------------------------
     Scroll reveal (IntersectionObserver)
     --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     Before / After compare sliders
     --------------------------------------------------------- */
  document.querySelectorAll("[data-compare]").forEach((frame) => {
    const before = frame.querySelector(".img-before");
    const handle = frame.querySelector(".compare-handle");
    let dragging = false;

    function setPosition(clientX) {
      const rect = frame.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + "%";
    }

    frame.addEventListener("pointerdown", (e) => {
      dragging = true;
      frame.setPointerCapture(e.pointerId);
      setPosition(e.clientX);
    });
    frame.addEventListener("pointermove", (e) => {
      if (dragging) setPosition(e.clientX);
    });
    frame.addEventListener("pointerup", () => (dragging = false));
    frame.addEventListener("pointerleave", () => (dragging = false));

    // Keyboard accessibility: arrow keys nudge the slider
    frame.setAttribute("tabindex", "0");
    frame.setAttribute("role", "slider");
    frame.setAttribute("aria-label", "Drag to compare before and after photos");
    frame.addEventListener("keydown", (e) => {
      const rect = frame.getBoundingClientRect();
      const current = parseFloat(handle.style.left) || 50;
      if (e.key === "ArrowLeft") setPosition(rect.left + (rect.width * (current - 5)) / 100);
      if (e.key === "ArrowRight") setPosition(rect.left + (rect.width * (current + 5)) / 100);
    });
  });

  /* ---------------------------------------------------------
     Gallery lightbox
     Guarded: only runs on pages that actually include the
     lightbox modal markup (e.g. the homepage gallery). Without
     this check, pages without it would throw here and silently
     skip every script block below (FAQ accordion, footer year, etc).
     --------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  if (lightbox && lightboxImg && lightboxClose) {
    document.querySelectorAll("[data-lightbox]").forEach((item) => {
      item.addEventListener("click", () => {
        const src = item.getAttribute("data-lightbox");
        const alt = item.querySelector("img") ? item.querySelector("img").alt : "";
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ---------------------------------------------------------
     FAQ accordion — one open at a time
     --------------------------------------------------------- */
  document.querySelectorAll(".faq-list").forEach((list) => {
    const items = list.querySelectorAll(".faq-item");

    items.forEach((item) => {
      const btn = item.querySelector(".faq-question");

      btn.addEventListener("click", () => {
        const wasOpen = item.classList.contains("is-open");

        items.forEach((i) => {
          i.classList.remove("is-open");
          i.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        });

        if (!wasOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  });

  /* ---------------------------------------------------------
     Expandable customer reviews
     --------------------------------------------------------- */
  document.querySelectorAll(".review-more").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".review-card");
      const isExpanded = card.classList.toggle("is-expanded");
      button.setAttribute("aria-expanded", String(isExpanded));
      button.textContent = isExpanded ? "Show less" : "Read more";
    });
  });

  /* ---------------------------------------------------------
     Contact form
     --------------------------------------------------------- */
  const quoteForm = document.getElementById("quoteForm");
  const formSuccess = document.getElementById("formSuccess");
  const contactFormWrap = document.getElementById("contactForm");

  if (quoteForm) {
    const formStatus = document.getElementById("formStatus");
    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const startedAt = quoteForm.querySelector('[name="form_started_at"]');
    if (startedAt) startedAt.value = Math.floor(Date.now() / 1000);

    quoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
      formStatus.textContent = "Sending your enquiry…";

      try {
        const response = await fetch(quoteForm.action, {
          method: "POST",
          body: new FormData(quoteForm),
          headers: { Accept: "application/json" },
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Your enquiry could not be sent.");
        }

        contactFormWrap.classList.add("is-submitted");
        formSuccess.classList.add("is-visible");
        quoteForm.reset();
      } catch (error) {
        formStatus.textContent = error.message || "Your enquiry could not be sent. Please call 07563 015571.";
        submitButton.disabled = false;
        submitButton.textContent = "Send Enquiry";
      }
    });
  }

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
