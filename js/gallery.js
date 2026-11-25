/* ==========================================================
   1. PROJECT DATA
   One entry per project. `src` can be a single path or an array.
   The first image is used as the card cover.
   ========================================================== */

const images = [
  {
    projectNumber: "215",
    slug: "P-215 PROPOSED MIXED USE DEVELOPMENT",
    src: "../assets/images/running/215.jpg",
  },
  {
    projectNumber: "214",
    slug: "P-214 PROPOSED MIXED USE DEVELOPMENT",
    src: "../assets/images/running/214.jpg",
  },
  {
    projectNumber: "212",
    slug: "P-212 (G+2P+7F+R) Hotel Building",
    src: "../assets/images/running/212.jpg",
  },
  {
    projectNumber: "211",
    slug: "P-211 (G+2P+14F+R) RESIDENTIAL BUILDING",
    src: [
      "../assets/images/running/211v1.jpg",
      "../assets/images/running/211v2.jpg",
    ],
  },
  {
    projectNumber: "205",
    slug: "P-205 SRG JVC (G+3P+16 +R)",
    src: "../assets/images/running/205.jpg",
  },
  {
    projectNumber: "209",
    slug: "p-209 Al Habbai Headquarters",
    src: [
      "../assets/images/running/209v1.jpg",
      "../assets/images/running/209v2.jpg",
    ],
  },
  {
    projectNumber: "208",
    slug: "P-208 (UG+GF+2P+8 Floors) RESIDENTIAL BUILDING",
    src: [
      "../assets/images/running/208v1.jpg",
      "../assets/images/running/208v2.jpg",
    ],
  },

  {
    projectNumber: "210",
    slug: "P-210 (1B+G+1P+9F+R) Residential & Commercial Building",
    src: "../assets/images/running/210.jpg",
  },
  {
    projectNumber: "204",
    slug: "P-204 (G+7+R) RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/204v1.jpg",
  },

  {
    projectNumber: "140",
    slug: "P-140 (2B+G+19) HOTEL BUILDING",
    src: [
      "../assets/images/hotels/140v1.jpg",
      "../assets/images/hotels/140v2.jpg",
    ],
  },
  {
    projectNumber: "96",
    slug: "P-096 (3B+G+19) STOREY HOTEL TOWER",
    src: ["../assets/images/hotels/96.jpg", "../assets/images/hotels/96v2.jpg"],
  },
  {
    projectNumber: "102",
    slug: "P-102 (2B+G+11) PENTHEHOUSE HOTEL TOWER",
    src: "../assets/images/hotels/102.jpg",
  },
  {
    projectNumber: "137",
    slug: "P-137 (B+G+9F) HOTEL BUILDING",
    src: "../assets/images/hotels/137.jpg",
  },
  {
    projectNumber: "136",
    slug: "P-136 (2B+G+3P+16+R) HOTEL BUILDING",
    src: "../assets/images/hotels/136.jpg",
  },
  {
    projectNumber: "142",
    slug: "P-142-PROPOSED (B+G+22 Floors + R) HOTEL BUILDING",
    src: "../assets/images/hotels/142.jpg",
  },
  {
    projectNumber: "146",
    slug: "P-146 (B+G+1P+16+R) HOTEL TOWER",
    src: "../assets/images/hotels/146.jpg",
  },
  {
    projectNumber: "147",
    slug: "P-147 (B+G+8+R+U+R) HOTEL BUILDING",
    src: "../assets/images/hotels/147.jpg",
  },
  {
    projectNumber: "153",
    slug: "P-153 (2B+G+5 Stories) INK HOTEL",
    src: "../assets/images/hotels/153.jpg",
  },
  {
    projectNumber: "154",
    slug: "P-154 (3B+G+6) STORIES HOTEL BUILDING",
    src: [
      "../assets/images/hotels/154v1.jpg",
      "../assets/images/hotels/154v2.jpg",
    ],
  },
  {
    projectNumber: "167",
    slug: "P-167 PROPOSED (2B+G+P+8+R) HOTEL BUILDING",
    src: "../assets/images/hotels/167.jpg",
  },
  {
    projectNumber: "171",
    slug: "P-171 PROPOSED (B+G+17+R) HOTEL BUILDING",
    src: [
      "../assets/images/hotels/171v1.jpg",
      "../assets/images/hotels/171v2.jpg",
    ],
  },
  {
    projectNumber: "129",
    slug: "P-129 (B+G+32) HOTEL-BUILDING",
    src: [
      "../assets/images/comm_&_residential/129.jpg",
      "../assets/images/comm_&_residential/129v2.jpg",
    ],
  },
  {
    projectNumber: "85",
    slug: "P-085 (2B+G+M+12+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/85.jpg",
  },
  {
    projectNumber: "95",
    slug: "P-095 (2B+G+15) RESIDENTIAL COMMERCIAL BUILDING",
    src: ["../assets/images/comm_&_residential/95.jpg", "../assets/images/comm_&_residential/95v2.jpg"],
  },
  {
    projectNumber: "99",
    slug: "P-099 (2B+G+30) RESIDENTIAL COMMERCIAL BUILDING",
    src: "../assets/images/comm_&_residential/99.jpg",
  },
  {
    projectNumber: "152",
    slug: "P-152 (3B+G+13) COMMERCIAL-RESIDENTIAL-BUILDING",
    src: "assets/images/comm_&_residential/152.jpg",
  },
  {
    projectNumber: "117",
    slug: "P-117 (2B+G+11+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/117v1.jpg","../assets/images/comm_&_residential/117v2.jpg"],
  },

  {
    projectNumber: "132",
    slug: "P-132 (B+G+7F+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/132.jpg", "../assets/images/comm_&_residential/132v2.jpg"],
  },
  {
    projectNumber: "77",
    slug: "P-077 (B+G+UG+12) Commercial & Residential Building",
    src: ["../assets/images/comm_&_residential/77.jpg","../assets/images/comm_&_residential/77v2.jpg"],
  },
  {
    projectNumber: "133",
    slug: "P-133 (B+G+7+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/133.jpg","../assets/images/comm_&_residential/133v2.jpg"],
  },
  {
    projectNumber: "177",
    slug: "P-177 PROPOSED (B+G+13+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/177v2.jpg","../assets/images/comm_&_residential/177v3.jpg"],
  },
  {
    projectNumber: "134",
    slug: "P-134 (B+G+7+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/134.jpg","../assets/images/comm_&_residential/134v2.jpg"],
  },
  {
    projectNumber: "118",
    slug: "P-118 (B+G+M+3) RESIDENTIAL COMMERCIAL BUILDING",
    src: "../assets/images/comm_&_residential/118.jpg",
  },
  {
    projectNumber: "135",
    slug: "P-135 (B+G+12+R) COMMERCIAL RESIDENTIAL BUILDING (2 BLDGS)",
    src: ["../assets/images/comm_&_residential/135.jpg", "../assets/images/comm_&_residential/135v2.jpg"],
  },
  {
    projectNumber: "159",
    slug: "P-159 PROPOSED (B+G+8+R) COMMERCIAL AND RESIDENTIAL",
    src: ["../assets/images/comm_&_residential/159.jpg", "../assets/images/comm_&_residential/159v2.jpg"],
  },
  {
    projectNumber: "162",
    slug: "P-162 SRG ALT TOWER",
    src: ["../assets/images/comm_&_residential/162.jpg","../assets/images/comm_&_residential/162v2.jpg"],
  },
  {
    projectNumber: "172",
    slug: "P-172 PROPOSED (B+G+P+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/172.jpg","../assets/images/comm_&_residential/172v2.jpg"],
  },
  {
    projectNumber: "173",
    slug: "P-173 PROPOSED (B+G+P+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/173.jpg","../assets/images/comm_&_residential/173v2.jpg"],
  },
  {
    projectNumber: "176",
    slug: "P-176 PROPOSED (B+G+P+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/176v1.jpg","../assets/images/comm_&_residential/176v2.jpg"],
  },
  {
    projectNumber: "188",
    slug: "P-188 PROPOSED (B+G+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/188.jpg","../assets/images/comm_&_residential/189.jpg"],
  },
  {
    projectNumber: "189",
    slug: "P-189 PROPOSED (B+G+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src:[ "../assets/images/comm_&_residential/189v2.jpg", "../assets/images/comm_&_residential/189v3.jpg"],
  },
  {
    projectNumber: "190",
    slug: "P-190 PROPOSED (B+G+13+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: ["../assets/images/comm_&_residential/190.jpg","../assets/images/comm_&_residential/190v2.jpg"],
  },
  {
    projectNumber: "195",
    slug: "P-195 (G+1) SHOPPING MALL",
    src: ["../assets/images/comm_&_residential/195v1.jpg","../assets/images/comm_&_residential/195.jpg"],
  },
  {
    projectNumber: "197",
    slug: "P-197 PROPOSED (B+G+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/197.jpg",
  },
  {
    projectNumber: "82",
    slug: "P-082 (2B+G+14+FLOORS)",
    src: "../assets/images/comm_&_residential/82.jpg",
  },
  {
    projectNumber: "109",
    slug: "P-109 (3B+G+4+Gym) COMMERCIAL RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/109.jpg",
  },
  {
    projectNumber: "198",
    slug: "P-198 PROPOSED (B+G+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/198.jpg",
  },
  {
    projectNumber: "192",
    slug: "P-192 (G+2P+12+R+U Roof) COMMERCIAL AND RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/192.jpg",
  },
  {
    projectNumber: "166",
    slug: "P-166 PROPOSED (B+G+P+8F+R) BUILDING",
    src: "../assets/images/comm_&_residential/166v2.jpg",
  },
  {
    projectNumber: "165",
    slug: "P-165 PROPOSED (G+M+7F+Gym)",
    src: "../assets/images/comm_&_residential/165.jpg",
  },
  {
    projectNumber: "164",
    slug: "P-164 PROPOSED (G+4F+R)",
    src: "../assets/images/comm_&_residential/164.jpg",
  },

  {
    projectNumber: "151",
    slug: "P-151 (3B+G+8+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: [
      "../assets/images/comm_&_residential/151v1.jpg",
      "../assets/images/comm_&_residential/151v1.jpg",
    ],
  },
  {
    projectNumber: "155",
    slug: "P-155 (2B+G+9F) STORIES SOHO APARTMENT",
    src: "../assets/images/comm_&_residential/155.jpg",
  },

  {
    projectNumber: "149",
    slug: "P-149 (B+G+6+R) COMMERCIAL RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/149.jpg",
  },
  {
    projectNumber: "157",
    slug: "P-157 (B+G+4P+MC+22+R) RESIDENTIAL RETAIL BUILDING",
    src: "../assets/images/comm_&_residential/157.jpg",
  },
  {
    projectNumber: "143",
    slug: "P-143 (2B+G+14F) COMMERCIAL RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/143.jpg",
  },
  {
    projectNumber: "163",
    slug: "P-163 PROPOSED G+1 ADC ABDULSALAM AL RAFI DIALYSIS CENTER",
    src: "../assets/images/comm_&_residential/163.jpg",
  },
  {
    projectNumber: "121",
    slug: "p-121 (B+G+7+R) Commercial & Residential Building",
    src: "../assets/images/comm_&_residential/121.jpg",
  },
  {
    projectNumber: "119",
    slug: "p-119 (2B+G+M+11)  Residential Buildin",
    src: "../assets/images/comm_&_residential/119.jpg",
  },
  {
    projectNumber: "83",
    slug: "P-083 (B+G+12) Residential Building",
    src: "../assets/images/comm_&_residential/83.jpg",
  },
  {
    projectNumber: "86",
    slug: "P-086 (2B+G+12) RESIDENTIAL COMMERCIAL",
    src: "../assets/images/comm_&_residential/86.jpg",
  },
  {
    projectNumber: "138",
    slug: "P-138 RESIDENTIAL BUILDING",
    src: "../assets/images/comm_&_residential/138.jpg",
  },
  {
    projectNumber: "170",
    slug: "P-170 RESIDENTIAL BUILDING (B+G+8+R)",
    src: "../assets/images/comm_&_residential/170.jpg",
  },
  {
    projectNumber: "174",
    slug: "P-174 RESIDENTIAL BUILDING (B+G+8+R)",
    src: "../assets/images/comm_&_residential/174.jpg",
  },
  {
    projectNumber: "175",
    slug: "P-175 RESIDENTIAL BUILDING (B+G+8+R)",
    src: "../assets/images/comm_&_residential/175.jpg",
  },
];

/* ==========================================================
   2. NORMALIZED IMAGE LIST
   Flat list of every individual image (used by the lightbox).
   ========================================================== */

const toArray = (value) => (Array.isArray(value) ? value : [value]);

const galleryImages = images.flatMap((project) =>
  toArray(project.src).map((src) => ({
    projectNumber: project.projectNumber,
    slug: project.slug,
    src,
  })),
);

(function () {
  "use strict";

  /* ========================================================
     3.1  ELEMENTS & SETTINGS
     ======================================================== */

  const $ = (id) => document.getElementById(id);

  const galleryGrid = $("galleryGrid");
  const lightbox = $("lightbox");
  const lightboxImage = $("lightboxImage");

  const closeBtn = $("closeBtn");
  const prevBtn = $("prevBtn");
  const nextBtn = $("nextBtn");
  const imageCounter = $("imageCounter");

  // Optional elements
  const stage = $("lightboxStage");
  const thumbsEl = $("lightboxThumbs");
  const progressEl = $("lightboxProgress");
  const playBtn = $("playBtn");
  const countEl = $("galleryCount");

  if (!galleryGrid || !lightbox || !lightboxImage) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const AUTOPLAY_MS = 4000;
  const total = galleryImages.length;

  // Bento pattern – repeats every 12 projects
  const SHAPES = [
    "is-big",
    "",
    "",
    "is-tall",
    "",
    "is-wide",
    "",
    "",
    "is-tall",
    "",
    "",
    "is-wide",
  ];

  const ARROW_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  // Lightbox state
  const state = {
    index: 0,
    lastFocus: null,
    token: 0, // guards against out-of-order image loads
    playing: false,
    playTimer: null,
  };

  document.documentElement.classList.add("gl-js");

  if (countEl) countEl.textContent = total;

  /* ========================================================
     3.2  HELPERS
     ======================================================== */

  /* ---- Reveal on scroll ---- */

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            el.classList.add("is-in");
            observer.unobserve(el);
            // Remove stagger delay once the reveal has finished
            if (el.classList.contains("gl-card")) {
              setTimeout(() => el.style.setProperty("--d", "0ms"), 1300);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      )
      : null;

  function reveal(el) {
    if (observer) observer.observe(el);
    else el.classList.add("is-in");
  }

  document.querySelectorAll("[data-gl-reveal]").forEach(reveal);

  /* ---- Image preloading (cached) ---- */

  const preloadCache = new Map();

  function preload(src) {
    if (preloadCache.has(src)) return preloadCache.get(src);

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.decoding = "async";
      img.src = src;
    });

    preloadCache.set(src, promise);
    return promise;
  }

  /* ========================================================
     3.3  PROJECT CARDS
     ======================================================== */

  function createCard(project, i) {
    const { projectNumber, slug } = project;

    const projectUrl = `project-details.html?slug=${encodeURIComponent(slug)}`;
    const cover = toArray(project.src)[0];

    const card = document.createElement("div");
    card.className = `gl-card ${SHAPES[i % SHAPES.length]}`.trim();
    card.style.setProperty("--d", (i % 4) * 80 + "ms");

    card.innerHTML = `
      <a href="${projectUrl}"
         class="gl-card__link"
         aria-label="View project ${projectNumber} details">
        <img src="${cover}"
             alt="Project P-${projectNumber}"
             loading="lazy"
             decoding="async">
      </a>

      <div class="gl-card__info">
        <a href="${projectUrl}"
           class="gl-tag"
           aria-label="View project ${projectNumber} details">
          <span class="gl-tag__dot"></span>
          <span class="gl-tag__label"></span>
          <span class="gl-tag__num">P-${projectNumber}</span>
        </a>

        <button type="button"
                class="gl-btn"
                aria-label="View gallery for project ${projectNumber}">
          <span class="gl-btn__text">View Gallery</span>
          <span class="gl-btn__icon">${ARROW_ICON}</span>
        </button>
      </div>
    `;

    // Image loading states
    const img = card.querySelector("img");
    const markLoaded = () => card.classList.add("is-loaded");

    img.addEventListener("load", markLoaded, { once: true });
    img.addEventListener("error", () => card.classList.add("is-error"), {
      once: true,
    });
    if (img.complete && img.naturalWidth) markLoaded();

    // "View gallery" opens the lightbox at this project's first image
    const viewBtn = card.querySelector(".gl-btn");

    viewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const firstIndex = galleryImages.findIndex(
        (image) => image.projectNumber === projectNumber,
      );

      openLightbox(firstIndex, viewBtn);
    });

    return card;
  }

  function renderCards() {
    const frag = document.createDocumentFragment();

    images.forEach((project, i) => {
      const card = createCard(project, i);
      frag.appendChild(card);
      reveal(card);
    });

    galleryGrid.appendChild(frag);
  }

  renderCards();

  /* ========================================================
     3.4  LIGHTBOX
     ======================================================== */

  const thumbBtns = [];

  /* ---- Thumbnail strip (all images from all projects) ---- */

  function buildThumbs() {
    if (!thumbsEl || thumbBtns.length) return;

    galleryImages.forEach((image, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gl-lb__thumb";
      btn.tabIndex = -1;
      btn.setAttribute(
        "aria-label",
        `Project ${image.projectNumber}, image ${i + 1}`,
      );

      const img = document.createElement("img");
      img.src = image.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      btn.appendChild(img);

      btn.addEventListener("click", () => show(i, i > state.index ? 1 : -1));

      thumbsEl.appendChild(btn);
      thumbBtns.push(btn);
    });
  }

  /* ---- Counter, progress bar, active thumbnail ---- */

  function updateMeta() {
    if (imageCounter) {
      imageCounter.textContent = `${state.index + 1} / ${total}`;
    }

    if (progressEl) {
      progressEl.style.transform = `scaleX(${(state.index + 1) / total})`;
    }

    thumbBtns.forEach((btn, i) => {
      const active = i === state.index;
      btn.classList.toggle("is-active", active);

      if (active) {
        btn.setAttribute("aria-current", "true");
        btn.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: reduceMotion.matches ? "auto" : "smooth",
        });
      } else {
        btn.removeAttribute("aria-current");
      }
    });
  }

  /* ---- Show one image ---- */

  async function show(index, dir = 0, instant = false) {
    if (!total) return;

    state.index = (index + total) % total;
    const mine = ++state.token;

    const image = galleryImages[state.index];
    updateMeta();

    const canAnimate =
      !reduceMotion.matches && typeof lightboxImage.animate === "function";

    // Old image slides out
    if (canAnimate && !instant && lightboxImage.getAttribute("src")) {
      lightboxImage.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: `translateX(${-dir * 48}px) scale(0.97)` },
        ],
        { duration: 200, easing: "ease-in", fill: "forwards" },
      );
    }

    // Loading spinner (only if the image is slow)
    const loaderTimer = setTimeout(() => {
      if (stage) stage.classList.add("is-loading");
    }, 140);

    await preload(image.src);
    clearTimeout(loaderTimer);

    if (mine !== state.token) return; // a newer request replaced this one

    if (stage) stage.classList.remove("is-loading");

    lightboxImage.src = image.src;
    lightboxImage.alt = `Project ${image.projectNumber}`;
    lightboxImage.getAnimations().forEach((a) => a.cancel());

    // New image slides in
    if (canAnimate) {
      lightboxImage.animate(
        [
          { opacity: 0, transform: `translateX(${dir * 48}px) scale(0.97)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }

    // Preload neighbours
    preload(galleryImages[(state.index + 1) % total].src);
    preload(galleryImages[(state.index - 1 + total) % total].src);

    if (state.playing) scheduleNext();
  }

  /* ---- Navigation ---- */

  const nextImage = () => show(state.index + 1, 1);
  const previousImage = () => show(state.index - 1, -1);

  /* ---- Slideshow ---- */

  function scheduleNext() {
    clearTimeout(state.playTimer);
    state.playTimer = setTimeout(nextImage, AUTOPLAY_MS);
  }

  function setPlaying(on) {
    state.playing = on;
    clearTimeout(state.playTimer);

    if (playBtn) {
      playBtn.classList.toggle("is-playing", on);
      playBtn.setAttribute("aria-pressed", String(on));
      playBtn.setAttribute(
        "aria-label",
        on ? "Pause slideshow" : "Start slideshow",
      );
    }

    if (on) scheduleNext();
  }

  /* ---- Open / close ---- */

  const isOpen = () => lightbox.classList.contains("active");

  function openLightbox(index, trigger) {
    state.lastFocus = trigger || document.activeElement;

    buildThumbs();

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    setPlaying(false);
    show(index, 0, true);

    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!isOpen()) return;

    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    state.token++;
    setPlaying(false);

    if (stage) stage.classList.remove("is-loading");

    if (state.lastFocus && typeof state.lastFocus.focus === "function") {
      state.lastFocus.focus({ preventScroll: true });
    }
  }

  /* ========================================================
     3.5  EVENTS
     ======================================================== */

  /* ---- Buttons ---- */

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (nextBtn) nextBtn.addEventListener("click", nextImage);
  if (prevBtn) prevBtn.addEventListener("click", previousImage);
  if (playBtn)
    playBtn.addEventListener("click", () => setPlaying(!state.playing));

  /* ---- Backdrop click closes ---- */

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

  /* ---- Keyboard ---- */

  function trapFocus(e) {
    const focusable = lightbox.querySelectorAll("button:not(.gl-lb__thumb)");
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

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
      case "Tab":
        trapFocus(e);
        break;
    }
  });

  /* ---- Touch swipe ---- */

  if (stage) {
    let startX = 0;
    let startY = 0;

    stage.addEventListener(
      "touchstart",
      (e) => {
        const t = e.changedTouches[0];
        startX = t.clientX;
        startY = t.clientY;
      },
      { passive: true },
    );

    stage.addEventListener(
      "touchend",
      (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx < 0) nextImage();
          else previousImage();
        }
      },
      { passive: true },
    );
  }
})();
