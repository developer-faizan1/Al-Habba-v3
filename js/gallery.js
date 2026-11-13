/* =====================================
   IMAGE LIST
===================================== */

const images = [
  "https://faizanahmad.in/al-habbai/images/projects/215v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/212.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/208v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/208v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/211v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/211v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/210.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/209v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/209v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/205v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/204.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/209v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/198v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/198v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/197.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/195v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/195v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/190.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/189v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/189v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/188v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/188v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/177v1.webp",
  "https://faizanahmad.in/al-habbai/images/projects/176v1.webp",
  "https://faizanahmad.in/al-habbai/images/projects/176v2.webp",
  "https://faizanahmad.in/al-habbai/images/projects/173v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/173v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/172.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/171.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/167v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/165v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/164.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/163v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/163v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/162.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/159v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/159v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/157v1.webp",
  "https://faizanahmad.in/al-habbai/images/projects/157v2.webp",
  "https://faizanahmad.in/al-habbai/images/projects/155.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/154v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/154v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/153.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/151v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/151v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/149v3.webp",
  "https://faizanahmad.in/al-habbai/images/projects/149v4.webp",
  "https://faizanahmad.in/al-habbai/images/projects/147v1.jpg",
];

(function () {
  "use strict";

  /* =====================================
     ELEMENTS
  ===================================== */

  const $ = (id) => document.getElementById(id);

  const galleryGrid = $("galleryGrid");
  const lightbox = $("lightbox");
  const lightboxImage = $("lightboxImage");
  const closeBtn = $("closeBtn");
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const imageCounter = $("imageCounter");

  // optional extras (the gallery still works if they are missing)
  const stage = $("lightboxStage");
  const thumbsEl = $("lightboxThumbs");
  const progressEl = $("lightboxProgress");
  const playBtn = $("playBtn");
  const countEl = $("galleryCount");

  if (!galleryGrid || !lightbox || !lightboxImage) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AUTOPLAY_MS = 4000;
  const total = images.length;

  // bento pattern – repeats every 12 images
  const SHAPES = [
    "is-big", "", "", "is-tall", "", "is-wide",
    "", "", "is-tall", "", "", "is-wide",
  ];

  let currentIndex = 0;
  let lastFocus = null;
  let token = 0;
  let playing = false;
  let playTimer = null;

  document.documentElement.classList.add("gl-js");
  if (countEl) countEl.textContent = total;

  /* =====================================
     REVEAL ON SCROLL
  ===================================== */

  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target;
              el.classList.add("is-in");
              io.unobserve(el);
              // drop the stagger delay so hover feels instant afterwards
              if (el.classList.contains("gl-card")) {
                setTimeout(() => el.style.setProperty("--d", "0ms"), 1300);
              }
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        )
      : null;

  function reveal(el) {
    if (io) io.observe(el);
    else el.classList.add("is-in");
  }

  document.querySelectorAll("[data-gl-reveal]").forEach(reveal);

  /* =====================================
     CREATE GALLERY
  ===================================== */

  const ZOOM_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

  const frag = document.createDocumentFragment();

  images.forEach((src, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = ("gl-card " + SHAPES[i % SHAPES.length]).trim();
    card.style.setProperty("--d", (i % 4) * 80 + "ms");
    card.setAttribute("aria-label", `Open project photo ${i + 1} of ${total}`);

    card.innerHTML = `
      <img src="${src}" alt="Project photo ${i + 1}" loading="lazy" decoding="async">
      <span class="gl-card__shade"></span>
      <span class="gl-card__frame"></span>
      <span class="gl-card__zoom" aria-hidden="true">${ZOOM_ICON}</span>
    `;

    const img = card.querySelector("img");
    const markLoaded = () => card.classList.add("is-loaded");
    img.addEventListener("load", markLoaded, { once: true });
    img.addEventListener("error", () => card.classList.add("is-error"), {
      once: true,
    });
    if (img.complete && img.naturalWidth) markLoaded();

    // cursor spotlight
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });

    card.addEventListener("click", () => openLightbox(i, card));

    frag.appendChild(card);
    reveal(card);
  });

  galleryGrid.appendChild(frag);

  /* =====================================
     PRELOAD HELPER
  ===================================== */

  const cache = new Map();

  function preload(src) {
    if (cache.has(src)) return cache.get(src);
    const p = new Promise((resolve) => {
      const im = new Image();
      im.onload = im.onerror = () => resolve();
      im.decoding = "async";
      im.src = src;
    });
    cache.set(src, p);
    return p;
  }

  /* =====================================
     THUMBNAILS (built on first open)
  ===================================== */

  const thumbBtns = [];

  function buildThumbs() {
    if (!thumbsEl || thumbBtns.length) return;
    images.forEach((src, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gl-lb__thumb";
      b.tabIndex = -1;
      b.setAttribute("aria-label", `Go to photo ${i + 1}`);
      const im = document.createElement("img");
      im.src = src;
      im.alt = "";
      im.loading = "lazy";
      im.decoding = "async";
      b.appendChild(im);
      b.addEventListener("click", () => show(i, i > currentIndex ? 1 : -1));
      thumbsEl.appendChild(b);
      thumbBtns.push(b);
    });
  }

  /* =====================================
     UPDATE LIGHTBOX META
  ===================================== */

  function updateMeta() {
    if (imageCounter) {
      imageCounter.textContent = `${currentIndex + 1} / ${total}`;
    }
    if (progressEl) {
      progressEl.style.transform = `scaleX(${(currentIndex + 1) / total})`;
    }
    thumbBtns.forEach((b, i) => {
      const on = i === currentIndex;
      b.classList.toggle("is-active", on);
      if (on) {
        b.setAttribute("aria-current", "true");
        b.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: reduceMotion.matches ? "auto" : "smooth",
        });
      } else {
        b.removeAttribute("aria-current");
      }
    });
  }

  /* =====================================
     SHOW IMAGE (animated, direction aware)
  ===================================== */

  async function show(index, dir = 0, instant = false) {
    currentIndex = (index + total) % total;
    const mine = ++token;
    const src = images[currentIndex];

    updateMeta();

    const canAnimate =
      !reduceMotion.matches && typeof lightboxImage.animate === "function";

    // old image slides out the opposite way
    if (canAnimate && !instant && lightboxImage.getAttribute("src")) {
      lightboxImage.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: `translateX(${-dir * 48}px) scale(0.97)` },
        ],
        { duration: 200, easing: "ease-in", fill: "forwards" }
      );
    }

    // show the spinner only if loading is slow
    const loaderTimer = setTimeout(() => {
      if (stage) stage.classList.add("is-loading");
    }, 140);

    await preload(src);
    clearTimeout(loaderTimer);
    if (mine !== token) return; // a newer request took over

    if (stage) stage.classList.remove("is-loading");

    lightboxImage.src = src;
    lightboxImage.alt = `Project photo ${currentIndex + 1} of ${total}`;
    lightboxImage.getAnimations().forEach((a) => a.cancel());

    if (canAnimate) {
      lightboxImage.animate(
        [
          { opacity: 0, transform: `translateX(${dir * 48}px) scale(0.97)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    }

    // warm the neighbours
    preload(images[(currentIndex + 1) % total]);
    preload(images[(currentIndex - 1 + total) % total]);

    if (playing) scheduleNext();
  }

  /* =====================================
     OPEN / CLOSE
  ===================================== */

  function isOpen() {
    return lightbox.classList.contains("active");
  }

  function openLightbox(index, trigger) {
    lastFocus = trigger || document.activeElement;
    buildThumbs();

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    show(index, 0, true);
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!isOpen()) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    token++; // cancel any pending load
    setPlaying(false);
    if (stage) stage.classList.remove("is-loading");

    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  /* =====================================
     NEXT / PREVIOUS
  ===================================== */

  function nextImage() {
    show(currentIndex + 1, 1);
  }

  function previousImage() {
    show(currentIndex - 1, -1);
  }

  /* =====================================
     SLIDESHOW
  ===================================== */

  function scheduleNext() {
    clearTimeout(playTimer);
    playTimer = setTimeout(nextImage, AUTOPLAY_MS);
  }

  function setPlaying(on) {
    playing = on;
    clearTimeout(playTimer);
    if (playBtn) {
      playBtn.classList.toggle("is-playing", on);
      playBtn.setAttribute("aria-pressed", String(on));
      playBtn.setAttribute(
        "aria-label",
        on ? "Pause slideshow" : "Start slideshow"
      );
    }
    if (on) scheduleNext();
  }

  /* =====================================
     EVENTS
  ===================================== */

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (nextBtn) nextBtn.addEventListener("click", nextImage);
  if (prevBtn) prevBtn.addEventListener("click", previousImage);
  if (playBtn) playBtn.addEventListener("click", () => setPlaying(!playing));

  // click on the empty backdrop closes
  lightbox.addEventListener("click", (e) => {
    const t = e.target;
    if (
      t === lightbox ||
      t === stage ||
      (t.classList && t.classList.contains("gl-lb__figure"))
    ) {
      closeLightbox();
    }
  });

  // keyboard
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowRight":
        nextImage();
        break;
      case "ArrowLeft":
        previousImage();
        break;
      case "Home":
        show(0, -1);
        break;
      case "End":
        show(total - 1, 1);
        break;
      case "Tab": {
        // keep focus inside the dialog
        const f = lightbox.querySelectorAll("button:not(.gl-lb__thumb)");
        if (!f.length) break;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        break;
      }
    }
  });

  // touch swipe
  if (stage) {
    let sx = 0;
    let sy = 0;
    stage.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        sx = t.clientX;
        sy = t.clientY;
      },
      { passive: true }
    );
    stage.addEventListener(
      "touchend",
      (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - sx;
        const dy = t.clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx < 0) nextImage();
          else previousImage();
        }
      },
      { passive: true }
    );
  }
})();