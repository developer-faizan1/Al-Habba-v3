document.addEventListener("DOMContentLoaded", async () => {
  /* =========================================
     CONFIG
  ========================================= */
  const PROJECTS_URL = "./assets/js/projectsData.json";
  const MAP_PAGE = "map.html"; // fallback when a project has no coordinates

  const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1000">' +
        '<rect width="1500" height="1000" fill="#f0f9f3"/>' +
        '<g fill="none" stroke="#1e665e" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity=".45">' +
        '<rect x="620" y="330" width="260" height="340" rx="8"/>' +
        '<path d="M680 400h40m60 0h40M680 470h40m60 0h40M680 540h40m60 0h40M730 670v-70h40v70"/>' +
        "</g></svg>",
    );

  const ICONS = {
    users:
      '<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2"/><path d="M17 4a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 5v1"/>',
    document: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7m-7 4h7"/>',
    pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    coins:
      '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/><path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    flag: '<path d="M5 21V4m0 0h12l-2 4 2 4H5"/>',
  };

  /* =========================================
     HELPERS
  ========================================= */
  const $ = (id) => document.getElementById(id);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;

  const svg = (name) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] ?? ICONS.document}</svg>`;

  // Icon with explicit attributes, so it still renders if other site CSS targets bare <svg>
  const iconSvg = (name) =>
    `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block">${ICONS[name]}</svg>`;

  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const clean = (v, fallback = "Not specified") =>
    String(v ?? "").trim() || fallback;

  const norm = (v) =>
    String(v ?? "")
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, " ");

  const pad = (n) => String(n).padStart(2, "0");
  const hasValue = (v) => v != null && String(v).trim() !== "";
  const isComplete = (status) => norm(status).includes("complete");

  /** Run `fn` once when `target` scrolls into view. */
  const whenVisible = (target, fn, delay = 350) => {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setTimeout(fn, delay);
      },
      { threshold: 0.3 },
    );
    io.observe(target);
  };

  /** Ease-out animation: calls `draw(progress 0 → 1)`. */
  const tween = (duration, draw) => {
    let start = null;
    const tick = (now) => {
      start ??= now;
      const t = Math.min((now - start) / duration, 1);
      draw(1 - (1 - t) ** 4);
      if (t < 1) requestAnimationFrame(tick);
      else draw(1);
    };
    requestAnimationFrame(tick);
  };

  /* =========================================
     DOM + STATE
  ========================================= */
  const el = {
    hero: $("pdHero"),
    layout: $("pdLayout"),
    body: $("pdBody"),
    error: $("pdError"),
    errorText: $("pdErrorText"),
    gallery: document.querySelector(".pd-gallery"),
    stage: $("pdStage"),
    mainImage: $("mainProjectImage"),
    counter: $("galleryCounter"),
    thumbs: $("galleryThumbnails"),
    prev: $("galleryPrev"),
    next: $("galleryNext"),
    thumbPrev: $("thumbnailPrev"),
    thumbNext: $("thumbnailNext"),
    fullscreen: $("galleryFullscreen"),
    lightbox: $("galleryLightbox"),
    lbFigure: $("lbFigure"),
    lbImage: $("lightboxImage"),
    lbThumbs: $("lbThumbs"),
    lbCounter: $("lightboxCounter"),
    lbCaption: $("lightboxCaption"),
    lbClose: $("lightboxClose"),
    lbPrev: $("lightboxPrev"),
    lbNext: $("lightboxNext"),
  };

  let images = [];
  let index = 0;
  let previousFocus = null;
  let titleText = "";

  /* =========================================
     LOAD PROJECT
  ========================================= */
  try {
    const slug = new URLSearchParams(location.search).get("slug")?.trim();
    if (!slug) throw new Error("Project slug is missing from the URL.");

    const res = await fetch(PROJECTS_URL, { cache: "no-cache" });
    if (!res.ok)
      throw new Error(`Unable to load project data (${res.status}).`);

    const data = await res.json();
    const projects = Array.isArray(data) ? data : data.projects;
    if (!Array.isArray(projects)) throw new Error("Invalid JSON format.");

    const position = projects.findIndex(
      (p) => String(p.slug ?? "").trim() === slug,
    );
    if (position === -1) throw new Error("Project not found.");

    const project = projects[position];

    renderHeader(project);
    renderValue(project);
    renderProgress(project);
    renderStats(project);
    renderBento(project);
    renderSiblings(projects, position);
    prepareGallery(project);
  } catch (err) {
    console.error(err);
    el.layout.hidden = true;
    el.body.hidden = true;
    el.error.hidden = false;
    el.errorText.textContent = err.message || "Something went wrong.";
  }

  initReveal();
  requestAnimationFrame(() => el.hero.classList.add("ready"));

  /* =========================================
     HEADER
  ========================================= */
  function renderHeader(p) {
    titleText = clean(p.title, "Untitled Project");
    document.title = `${titleText} | Projects`;

    $("projectNumber").textContent = clean(p.projectNumber, "Project");
    $("projectTypeChip").textContent = clean(p.projectType, "Project");

    const title = $("projectTitle");
    title.innerHTML = titleText
      .split(/\s+/)
      .map(
        (w, i) =>
          `<span class="w"><span style="--w:${i}">${esc(w)}</span></span>`,
      )
      .join(" ");
    title.setAttribute("aria-label", titleText);

    const desc = String(p.projectDescription ?? "").trim();
    if (desc && norm(desc) !== norm(titleText)) {
      const lead = $("projectDescription");
      lead.textContent = desc;
      lead.hidden = false;
    }

    const status = clean(p.status);
    $("projectStatusText").textContent = status;
    $("projectStatus").classList.toggle("is-completed", isComplete(status));
  }

  /* =========================================
     VALUE (count-up)
  ========================================= */
  function renderValue(p) {
    $("valueIcon").innerHTML = ICONS.coins;

    const text = clean(p.projectValue);
    const match = text.match(/^([A-Za-z]{2,4})\s+(.+)$/);
    const amountText = match ? match[2].trim() : text;
    const numberEl = $("valueNumber");

    $("valueCurrency").textContent = match?.[1] ?? "";
    numberEl.textContent = amountText;

    const amount = Number(amountText.replace(/,/g, ""));
    if (!Number.isFinite(amount) || reduceMotion) return;

    const fmt = new Intl.NumberFormat("en-US");
    numberEl.textContent = "0";

    whenVisible($("projectValue"), () =>
      tween(1800, (t) => {
        numberEl.textContent =
          t === 1 ? amountText : fmt.format(Math.round(amount * t));
      }),
    );
  }

  /* =========================================
     PROGRESS RING (progress.overall)
  ========================================= */
  function renderProgress(p) {
    const box = $("pdProgress");
    const raw = p.progress?.overall;

    if (!hasValue(raw) || !Number.isFinite(Number(raw))) {
      box.hidden = true;
      return;
    }

    const pct = Math.min(100, Math.max(0, Number(raw)));
    const bar = $("ringBar");
    const num = $("progressNum");
    box.hidden = false;

    if (reduceMotion) {
      bar.style.transition = "none";
      bar.style.strokeDashoffset = 100 - pct;
      num.textContent = `${pct}%`;
      return;
    }

    whenVisible(box, () => {
      bar.style.strokeDashoffset = 100 - pct;
      tween(1800, (t) => (num.textContent = `${Math.round(pct * t)}%`));
    });
  }

  /* =========================================
     HERO STATS
  ========================================= */
  function renderStats(p) {
    const done = isComplete(p.status);

    const stats = [
      { icon: done ? "check" : "flag", label: "Status", value: p.status },
      { icon: "calendar", label: "Start Date", value: p.startDate },
      {
        icon: done ? "check" : "clock",
        label: done ? "Completed On" : "Completion",
        value: p.completionDate,
      },
    ];

    $("pdStats").innerHTML = stats
      .map(
        (s, i) => `
        <div class="pd-stat reveal" style="--i:${i + 5}">
          <span class="pd-stat-icon">${svg(s.icon)}</span>
          <div>
            <small>${esc(s.label)}</small>
            <strong>${esc(clean(s.value))}</strong>
          </div>
        </div>`,
      )
      .join("");
  }

  /* =========================================
     KEY INFORMATION: client, consultant, location
  ========================================= */
  function renderBento(p) {
    const address = clean(
      p.fullAddress || p.projectLocation || p.area,
      "Location not specified",
    );

    const addrNorm = norm(address);
    const meta = [
      ...new Set(
        [p.area, p.state].map((v) => String(v ?? "").trim()).filter(Boolean),
      ),
    ].filter((v) => !addrNorm.includes(norm(v)));

    // Coordinates open Google Maps; otherwise fall back to the site's map page
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);
    const hasCoords =
      hasValue(p.latitude) &&
      hasValue(p.longitude) &&
      Number.isFinite(lat) &&
      Number.isFinite(lng);
    const slug = String(p.slug ?? "").trim();

    const link = hasCoords
      ? {
          href: `https://www.google.com/maps?q=${lat},${lng}`,
          text: "Open in Maps",
          external: true,
        }
      : {
          href: slug
            ? `${MAP_PAGE}?slug=${encodeURIComponent(slug)}`
            : MAP_PAGE,
          text: "View on Map",
          external: false,
        };

    const cards = [
      { icon: "users", label: "Client", value: p.client, cls: "bento--dark" },
      {
        icon: "document",
        label: "Consultant",
        value: p.consultant,
        cls: "bento--mint",
      },
      {
        icon: "pin",
        label: "Location",
        value: address,
        sub: meta.join("  •  "),
        cls: "bento--light",
        link,
      },
    ];

    const box = $("pdBento");

    box.innerHTML = cards
      .map(
        (c, i) => `
        <article class="bento ${c.cls} reveal" style="--i:${i}">
          <span class="bento-mark">${svg(c.icon)}</span>
          <div class="bento-top">
            <span class="bento-icon">${svg(c.icon)}</span>
            <span class="pd-label">${esc(c.label)}</span>
          </div>
          <div class="bento-foot">
            <div class="bento-text">
              <strong class="bento-value">${esc(clean(c.value))}</strong>
              ${c.sub ? `<span class="bento-sub">${esc(c.sub)}</span>` : ""}
              <i class="bento-line"></i>
            </div>
            ${
              c.link
                ? `<a class="pd-btn" href="${esc(c.link.href)}"${c.link.external ? ' target="_blank" rel="noopener"' : ""}>
                     <span>${esc(c.link.text)}</span>${svg("arrow")}
                   </a>`
                : ""
            }
          </div>
        </article>`,
      )
      .join("");

    if (canHover) {
      box.addEventListener("pointermove", (e) => {
        const card = e.target.closest(".bento");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    }
  }

  /* =========================================
     PREVIOUS / ALL / NEXT
  ========================================= */
  function renderSiblings(projects, pos) {
    if (projects.length < 2) return;

    const prevP = projects[(pos - 1 + projects.length) % projects.length];
    const nextP = projects[(pos + 1) % projects.length];

    const href = (proj) =>
      `project-details.html?slug=${encodeURIComponent(String(proj.slug ?? proj.id ?? ""))}`;

    const item = (cls, url, tip, icon) =>
      `<a class="pd-ico ${cls}" href="${esc(url)}" aria-label="${esc(tip)}" data-tip="${esc(tip)}">${iconSvg(icon)}</a>`;

    const box = $("pdSiblings");
    box.innerHTML =
      item(
        "pd-ico--prev",
        href(prevP),
        `Previous: ${clean(prevP.title, "Project")}`,
        "arrowLeft",
      ) +
      item("pd-ico--all", "projects.html", "All projects", "grid") +
      item(
        "pd-ico--next",
        href(nextP),
        `Next: ${clean(nextP.title, "Project")}`,
        "arrow",
      );
    box.hidden = false;
  }

  /* =========================================
     GALLERY
  ========================================= */
  function prepareGallery(p) {
    const list = [
      p.image,
      ...(Array.isArray(p.images) ? p.images : []),
      ...(Array.isArray(p.gallery) ? p.gallery : []),
    ]
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : String(item?.src ?? item?.url ?? item?.image ?? "").trim(),
      )
      .filter(Boolean);

    images = [...new Set(list)];
    if (!images.length) images = [PLACEHOLDER];

    const single = images.length < 2;
    el.gallery.classList.toggle("is-single", single);
    el.lightbox.classList.toggle("single", single);

    el.thumbs.replaceChildren();
    el.lbThumbs.replaceChildren();

    images.forEach((src, i) => {
      const make = (cls) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = cls;
        btn.setAttribute("aria-label", `View image ${i + 1}`);

        const img = new Image();
        img.src = src;
        img.alt = "";
        img.loading = i === 0 ? "eager" : "lazy";
        img.decoding = "async";
        img.onerror = () => {
          if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER;
        };

        btn.append(img);
        btn.addEventListener("click", () => show(i));
        return btn;
      };

      el.thumbs.append(make("pd-thumb"));
      el.lbThumbs.append(make("lb-thumb"));
    });

    show(0);
  }

  function centerIn(container, item) {
    if (!container || !item) return;
    container.scrollTo({
      left: item.offsetLeft - (container.clientWidth - item.clientWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  // Restart the fade-in animation on an <img>
  function swapImage(img, src, alt) {
    img.classList.remove("fade-in");
    void img.offsetWidth;
    img.src = src;
    img.alt = alt;
    img.classList.add("fade-in");
  }

  function show(i) {
    index = (i + images.length) % images.length;

    swapImage(el.mainImage, images[index], `${titleText} - image ${index + 1}`);
    el.counter.textContent = `${pad(index + 1)} / ${pad(images.length)}`;

    const thumbs = el.thumbs.querySelectorAll(".pd-thumb");
    thumbs.forEach((t, n) => {
      t.classList.toggle("active", n === index);
      t.setAttribute("aria-pressed", String(n === index));
    });
    centerIn(el.thumbs, thumbs[index]);

    if (el.lightbox.classList.contains("open")) updateLightbox();
  }

  el.mainImage.addEventListener("error", () => {
    if (el.mainImage.src !== PLACEHOLDER) el.mainImage.src = PLACEHOLDER;
  });

  const go = (step) => (e) => {
    e.stopPropagation();
    show(index + step);
  };
  el.prev.addEventListener("click", go(-1));
  el.next.addEventListener("click", go(1));

  const scrollThumbs = (dir) => () =>
    el.thumbs.scrollBy({
      left: dir * el.thumbs.clientWidth * 0.75,
      behavior: "smooth",
    });
  el.thumbPrev.addEventListener("click", scrollThumbs(-1));
  el.thumbNext.addEventListener("click", scrollThumbs(1));

  // Click the stage (not a button) to open the lightbox
  el.stage.addEventListener("click", (e) => {
    if (!e.target.closest("button")) openLightbox();
  });
  el.fullscreen.addEventListener("click", (e) => {
    e.stopPropagation();
    openLightbox();
  });

  addSwipe(el.stage);

  /* =========================================
     LIGHTBOX
  ========================================= */
  function updateLightbox() {
    el.lbFigure.classList.remove("zoomed");
    el.lbImage.style.transformOrigin = "";

    swapImage(el.lbImage, images[index], el.mainImage.alt);
    el.lbCounter.textContent = `${pad(index + 1)} / ${pad(images.length)}`;
    el.lbCaption.textContent = titleText;

    const thumbs = el.lbThumbs.querySelectorAll(".lb-thumb");
    thumbs.forEach((t, n) => t.classList.toggle("active", n === index));
    centerIn(el.lbThumbs, thumbs[index]);
  }

  function openLightbox() {
    previousFocus = document.activeElement;
    updateLightbox();
    el.lightbox.inert = false;
    el.lightbox.setAttribute("aria-hidden", "false");
    el.lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    el.lbClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    el.lightbox.classList.remove("open");
    el.lightbox.setAttribute("aria-hidden", "true");
    el.lightbox.inert = true;
    el.lbFigure.classList.remove("zoomed");
    document.body.style.overflow = "";
    if (previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
  }

  function setOrigin(e) {
    const r = el.lbImage.getBoundingClientRect();
    const pct = (value, size) =>
      Math.min(Math.max((value / size) * 100, 0), 100);
    el.lbImage.style.transformOrigin = `${pct(e.clientX - r.left, r.width)}% ${pct(e.clientY - r.top, r.height)}%`;
  }

  el.lbClose.addEventListener("click", closeLightbox);
  el.lbPrev.addEventListener("click", () => show(index - 1));
  el.lbNext.addEventListener("click", () => show(index + 1));

  el.lightbox.addEventListener("click", (e) => {
    if (e.target !== el.lightbox && e.target !== el.lbFigure) return;
    if (el.lbFigure.classList.contains("zoomed"))
      el.lbFigure.classList.remove("zoomed");
    else closeLightbox();
  });

  el.lbImage.addEventListener("click", (e) => {
    const zoomed = el.lbFigure.classList.toggle("zoomed");
    if (zoomed) setOrigin(e);
    else el.lbImage.style.transformOrigin = "";
  });

  el.lbFigure.addEventListener("mousemove", (e) => {
    if (el.lbFigure.classList.contains("zoomed")) setOrigin(e);
  });

  addSwipe(el.lightbox);

  document.addEventListener("keydown", (e) => {
    if (!el.lightbox.classList.contains("open")) return;
    const actions = {
      Escape: closeLightbox,
      ArrowLeft: () => show(index - 1),
      ArrowRight: () => show(index + 1),
    };
    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  });

  /* =========================================
     SWIPE
  ========================================= */
  function addSwipe(target) {
    let x = 0;
    let y = 0;

    target.addEventListener(
      "touchstart",
      (e) => {
        ({ clientX: x, clientY: y } = e.changedTouches[0]);
      },
      { passive: true },
    );

    target.addEventListener(
      "touchend",
      (e) => {
        if (images.length < 2) return;
        const dx = e.changedTouches[0].clientX - x;
        const dy = e.changedTouches[0].clientY - y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy))
          show(index + (dx < 0 ? 1 : -1));
      },
      { passive: true },
    );
  }

  /* =========================================
     SCROLL REVEAL
  ========================================= */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((n) => n.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    items.forEach((n) => io.observe(n));
  }
});
