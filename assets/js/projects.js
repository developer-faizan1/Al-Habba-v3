document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     CONFIGURATION
  ========================================= */

  const DATA_URL = "./assets/js/projectsData.json";
  const PROJECTS_PER_PAGE = 1;
  const SAVED_KEY = "alHabbaiSavedProjects";

  const $ = (selector) => document.querySelector(selector);

  const list = $("#projectsList");
  const count = $("#projectsCount");
  const pagination = $("#projectsPagination");
  const empty = $("#projectsEmpty");

  const searchInput = $("#projectSearch");
  const typeFilter = $("#projectTypeFilter");
  const statusFilter = $("#projectStatusFilter");
  const locationFilter = $("#projectLocationFilter");
  const sortSelect = $("#projectSort");

  const clearButton = $("#clearFilters");
  const emptyClearButton = $("#emptyClearFilters");

  const lightbox = $("#projectLightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");

  let projects = [];
  let filteredProjects = [];
  let currentPage = 1;

  let lightboxImages = [];
  let lightboxIndex = 0;
  let lightboxTitle = "";
  let lastFocusedElement = null;

  if (
    !list ||
    !count ||
    !pagination ||
    !empty ||
    !searchInput ||
    !typeFilter ||
    !statusFilter ||
    !locationFilter ||
    !sortSelect ||
    !lightbox
  ) {
    console.error("Projects section HTML elements are missing.");
    return;
  }

  /* =========================================
     SAVED PROJECTS
  ========================================= */

  function loadSavedProjects() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(SAVED_KEY) || "[]"
      );

      return new Set(
        Array.isArray(saved) ? saved.map(String) : []
      );
    } catch {
      return new Set();
    }
  }

  const savedProjects = loadSavedProjects();

  /* =========================================
     GENERAL HELPERS
  ========================================= */

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function formatValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not specified";
    }

    if (Array.isArray(value)) {
      return value.length
        ? value.map(String).join(", ")
        : "Not specified";
    }

    return String(value);
  }

  function dateValue(value) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date.getTime();
  }

  function displayDate(value) {
    if (!value) return "Not specified";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    });
  }

  function getProjectImages(project) {
    const images = Array.isArray(project.images)
      ? project.images.filter(Boolean)
      : [];

    if (
      project.image &&
      !images.includes(project.image)
    ) {
      images.unshift(project.image);
    }

    return [...new Set(images)];
  }

  function locationText(project) {
    return (
      project.fullAddress ||
      project.projectLocation ||
      project.area ||
      project.city ||
      project.state ||
      "Location not specified"
    );
  }

  function getLocationOptions(project) {
    return (
      project.state ||
      project.projectLocation ||
      project.area ||
      ""
    );
  }

  /* =========================================
     GENERAL SVG ICONS
  ========================================= */

  function icon(name) {
    const icons = {
      pin: `
        <svg viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/>
          <circle cx="12" cy="10" r="2.5"/>
        </svg>
      `,

      building: `
        <svg viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <rect x="4" y="2.5" width="16" height="19" rx="1"/>
          <path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/>
        </svg>
      `,

      calendar: `
        <svg viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2"/>
          <path d="M16 3v4M8 3v4M3 10h18"/>
        </svg>
      `,

      arrow: `
        <svg viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true">
          <path d="M5 12h14M13 5l7 7-7 7"/>
        </svg>
      `
    };

    return icons[name] || "";
  }

  /* =========================================
     FILTER DROPDOWNS
  ========================================= */

  function populateFilter(select, values) {
    const previousValue = select.value;
    const firstOption = select.options[0]?.outerHTML || "";

    const options = [...new Set(
      values
        .filter(value =>
          value !== null &&
          value !== undefined &&
          value !== ""
        )
        .map(String)
    )].sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: "base"
      })
    );

    select.innerHTML =
      firstOption +
      options.map(value => `
        <option value="${escapeHTML(value)}">
          ${escapeHTML(value)}
        </option>
      `).join("");

    if (options.includes(previousValue)) {
      select.value = previousValue;
    }
  }

  function initializeFilters() {
    populateFilter(
      typeFilter,
      projects.map(project => project.projectType)
    );

    populateFilter(
      statusFilter,
      projects.map(project => project.status)
    );

    populateFilter(
      locationFilter,
      projects.map(getLocationOptions)
    );
  }

  /* =========================================
     SEARCH, FILTERS AND SORTING
  ========================================= */

  function getFilteredProjects() {
    const search = searchInput.value.trim().toLowerCase();
    const type = typeFilter.value;
    const status = statusFilter.value;
    const location = locationFilter.value;

    const result = projects.filter(project => {
      const comprises = Array.isArray(
        project.projectComprisesOf
      )
        ? project.projectComprisesOf
        : [];

      const searchableText = [
        project.projectNumber,
        project.title,
        project.slug,
        project.projectType,
        project.projectDescription,
        project.projectValue,
        project.client,
        project.consultant,
        project.projectLocation,
        project.fullAddress,
        project.area,
        project.state,
        project.city,
        project.plotNumber,
        project.plot,
        project.status,
        ...comprises
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!search || searchableText.includes(search)) &&
        (!type || project.projectType === type) &&
        (!status || project.status === status) &&
        (
          !location ||
          getLocationOptions(project) === location
        )
      );
    });

   switch (sortSelect.value) {
  case "latest":
    result.sort((a, b) =>
      (dateValue(b.completionDate) ?? -Infinity) -
      (dateValue(a.completionDate) ?? -Infinity)
    );
    break;

  case "oldest":
    result.sort((a, b) =>
      (dateValue(a.completionDate) ?? Infinity) -
      (dateValue(b.completionDate) ?? Infinity)
    );
    break;

  case "title":
    result.sort((a, b) =>
      formatValue(a.title).localeCompare(
        formatValue(b.title)
      )
    );
    break;

  case "default":
  default:
    // Preserve the original order from the JSON file.
    result.sort((a, b) =>
      projects.indexOf(a) - projects.indexOf(b)
    );
    break;
}

    return result;
  }

  /* =========================================
     PROJECT COMPRISES OF
     DYNAMIC ICON MATCHING
  ========================================= */

  function normalizeComprisesText(item) {
    return String(item ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[._-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function comprisesSvg(paths) {
    return `
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false">
        ${paths}
      </svg>
    `;
  }

  function comprisesIcon(item) {
    const text = normalizeComprisesText(item);

    /*
      IMPORTANT:
      Check specific keywords before general keywords.
      Icon selection does not depend on array position.
    */

    // Basement
    if (/\bbasement\b/.test(text)) {
      return comprisesSvg(`
        <path d="M3 8h18M5 8v12h14V8"/>
        <path d="M8 12h8M8 16h8"/>
        <path d="m9 4 3 3 3-3"/>
      `);
    }

    // Parking
    if (
      /\bparking\b/.test(text) ||
      /\bcar park\b/.test(text)
    ) {
      return comprisesSvg(`
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
      `);
    }

    // Ground floor
    if (/\bground\b/.test(text)) {
      return comprisesSvg(`
        <path d="m3 10 9-7 9 7"/>
        <path d="M5 9v12h14V9"/>
        <path d="M9 21v-7h6v7"/>
      `);
    }

    // Roof
    if (/\broof\b/.test(text)) {
      return comprisesSvg(`
        <path d="m3 11 9-7 9 7"/>
        <path d="M5 10v10h14V10"/>
        <path d="M3 4h18"/>
      `);
    }

    // Mezzanine
    if (/\bmezzanine\b/.test(text)) {
      return comprisesSvg(`
        <path d="M4 21V4h16v17"/>
        <path d="M4 12h16"/>
        <path d="M8 8h2m4 0h2m-8 8h2m4 0h2"/>
      `);
    }

    // Mechanical floor
    if (/\bmech(?:anical)?\b/.test(text)) {
      return comprisesSvg(`
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15l1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 2Z"/>
      `);
    }

    // Showrooms
    if (/\bshow ?rooms?\b|\bshowroom\b/.test(text)) {
      return comprisesSvg(`
        <path d="M3 10h18l-2-6H5l-2 6Z"/>
        <path d="M5 10v10h14V10M9 20v-6h6v6"/>
        <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>
      `);
    }

    // Health club, gym and fitness
    if (
      /\bhealth club\b/.test(text) ||
      /\bgym\b/.test(text) ||
      /\bfitness\b/.test(text) ||
      /\bwellness\b/.test(text) ||
      /\bhc\b/.test(text)
    ) {
      return comprisesSvg(`
        <path d="M6 9v6M3.5 10v4M18 9v6m2.5-5v4M6 12h12"/>
      `);
    }

    // Floors and levels
    if (
      /\bfloor\b/.test(text) ||
      /\blevel\b/.test(text) ||
      /\bstorey\b/.test(text) ||
      /\bstory\b/.test(text) ||
      /\btypical\b/.test(text)
    ) {
      return comprisesSvg(`
        <rect x="4" y="3" width="16" height="18" rx="1"/>
        <path d="M4 9h16M4 15h16"/>
        <path d="M9 3v6m6-6v6m-6 6v6m6-6v6"/>
      `);
    }

    // Hotel, tower, building, apartments, residential and retail
    if (
      /\bhotel\b/.test(text) ||
      /\btower\b/.test(text) ||
      /\bbuilding\b/.test(text) ||
      /\bapartment\b/.test(text) ||
      /\bresidential\b/.test(text) ||
      /\bcommercial\b/.test(text) ||
      /\bretail\b/.test(text)
    ) {
      return comprisesSvg(`
        <rect x="4" y="2.5" width="16" height="19" rx="1"/>
        <path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2"/>
        <path d="M10 21v-3h4v3"/>
      `);
    }

    // Default icon for unrecognized descriptions
    return comprisesSvg(`
      <rect x="4" y="3" width="16" height="18" rx="1"/>
      <path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2"/>
      <path d="M10 21v-3h4v3"/>
    `);
  }

  function getComprises(project) {
    const items = Array.isArray(
      project.projectComprisesOf
    )
      ? project.projectComprisesOf
      : [];

    if (!items.length) {
      return `
        <li class="comprises-empty">
          Details not specified
        </li>
      `;
    }

    return items
      .filter(item =>
        item !== null &&
        item !== undefined &&
        String(item).trim() !== ""
      )
      .map(item => {
        const label =
          typeof item === "object"
            ? (
                item.label ??
                item.title ??
                item.name ??
                JSON.stringify(item)
              )
            : item;

        return `
          <li class="comprises-item">
            <span class="comprises-icon">
              ${comprisesIcon(label)}
            </span>

            <span class="comprises-text">
              ${escapeHTML(label)}
            </span>
          </li>
        `;
      })
      .join("");
  }

  /* =========================================
     CLIENT AND CONSULTANT
  ========================================= */

  function contactBlock(title, value) {
    return `
      <div class="project-contact">
        <div class="contact-icon">
          ${icon("building")}
        </div>

        <div class="contact-copy">
          <strong>${escapeHTML(title)}</strong>
          <span>${escapeHTML(formatValue(value))}</span>
        </div>
      </div>
    `;
  }

  /* =========================================
     PROJECT CARD
  ========================================= */

  function projectCard(project) {
    const images = getProjectImages(project);
    const firstImage = images[0] || "";
    const isSaved = savedProjects.has(String(project.id));

    const fullAddress = locationText(project);
    const safeImage = escapeHTML(firstImage);

    return `
      <article
        class="project-card"
        data-project-id="${escapeHTML(project.id)}">

        <div class="project-main">

          <!-- LEFT IMAGE GALLERY -->
          <div
            class="project-gallery"
            data-images="${escapeHTML(JSON.stringify(images))}"
            data-index="0">

            <button
              type="button"
              class="project-image-button"
              data-action="lightbox"
              aria-label="View images of ${escapeHTML(project.title)}">

              <img
                class="project-image"
                src="${safeImage}"
                alt="${escapeHTML(project.title)}"
                loading="lazy"
                decoding="async"
                onerror="this.onerror=null;this.style.opacity='0.25';"
              >
            </button>

            <span class="project-status">
              ${escapeHTML(formatValue(project.status))}
            </span>

            ${images.length > 1 ? `
              <button
                type="button"
                class="gallery-arrow gallery-prev"
                data-action="prev"
                aria-label="Previous project image">
                &#10094;
              </button>

              <button
                type="button"
                class="gallery-arrow gallery-next"
                data-action="next"
                aria-label="Next project image">
                &#10095;
              </button>
            ` : ""}

            <div class="gallery-bottom">

              <span class="gallery-counter">
                ${
                  images.length
                    ? "▧ " +
                      (images.length > 1 ? "1/" : "") +
                      images.length
                    : "No images"
                }
              </span>

              <button
                type="button"
                class="gallery-save ${isSaved ? "is-saved" : ""}"
                data-action="save"
                aria-pressed="${isSaved}"
                aria-label="${isSaved ? "Remove saved project" : "Save project"}">

                <span class="save-star">
                  ${isSaved ? "★" : "☆"}
                </span>

                <span>
                  ${isSaved ? "Saved" : "Save"}
                </span>
              </button>

            </div>
          </div>

          <!-- RIGHT PROJECT INFORMATION -->
          <div class="project-info">

            <div class="project-wrapper">

              <div class="project-type-wrapper">
                <span class="project-type-label">
                  Project type
                </span>

                <h4 class="project-type-value">
                  ${escapeHTML(formatValue(project.projectType))}
                </h4>
              </div>

              <div class="project-value-wrapper">
                <span class="project-type-label">
                  Project Value
                </span>

                <h4 class="project-type-value">
                  ${escapeHTML(formatValue(project.projectValue))}
                </h4>
              </div>

            </div>

            <!-- PROJECT COMPRISES OF -->
            <div class="project-comprises">

              <h4 class="comprises-heading">
                Project comprises of
              </h4>

              <ul class="comprises-list">
                ${getComprises(project)}
              </ul>

            </div>

            <!-- CLIENT AND CONSULTANT -->
            <div class="project-contacts">
              ${contactBlock("Client", project.client)}
              ${contactBlock("Consultant", project.consultant)}
            </div>

            <!-- PROJECT LOCATION -->
            <div class="project-location">
              ${icon("pin")}

              <a
                href="../../map.html"
                target="_blank"
                rel="noopener noreferrer">
                ${escapeHTML(fullAddress)}
              </a>
            </div>

          </div>
        </div>

        <!-- BOTTOM METADATA -->
        <div class="project-meta">

          <div class="meta-item meta-project-number">
            <span style="color:#1A6469">
              ${escapeHTML(formatValue(project.projectNumber))}
            </span>
          </div>

          <div class="meta-item">
            ${icon("calendar")}

            <span>
              Started: ${escapeHTML(formatValue(project.startDate))}
            </span>
          </div>

          <div class="meta-item">
            ${icon("calendar")}

            <span>
              Completed: ${escapeHTML(formatValue(project.completionDate))}
            </span>
          </div>

          <a
            class="project-details-link"
            href="project-details.html?slug=${encodeURIComponent(
              project.slug ||
              project.projectNumber ||
              project.id
            )}">

            View Details ${icon("arrow")}
          </a>

        </div>
      </article>
    `;
  }

  /* =========================================
     PAGINATION
  ========================================= */

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      pagination.innerHTML = "";
      return;
    }

    const buttons = [];

    function addButton(
      label,
      page,
      disabled = false,
      active = false
    ) {
      buttons.push(`
        <button
          type="button"
          class="page-button ${active ? "active" : ""}"
          data-page="${page}"
          ${disabled ? "disabled" : ""}
          ${active ? 'aria-current="page"' : ""}
          aria-label="${
            label === "Previous" || label === "Next"
              ? label
              : "Page " + label
          }">

          ${label}
        </button>
      `);
    }

    addButton(
      "Previous",
      currentPage - 1,
      currentPage === 1
    );

    const pages = new Set([
      1,
      totalPages,
      currentPage
    ]);

    for (
      let page = currentPage - 1;
      page <= currentPage + 1;
      page++
    ) {
      if (page >= 1 && page <= totalPages) {
        pages.add(page);
      }
    }

    const orderedPages = [...pages].sort((a, b) => a - b);
    let previous = 0;

    orderedPages.forEach(page => {
      if (previous && page - previous > 1) {
        buttons.push(`
          <span class="page-ellipsis">...</span>
        `);
      }

      addButton(
        String(page),
        page,
        false,
        page === currentPage
      );

      previous = page;
    });

    addButton(
      "Next",
      currentPage + 1,
      currentPage === totalPages
    );

    pagination.innerHTML = buttons.join("");
  }

  function renderProjects() {
    filteredProjects = getFilteredProjects();

    const total = filteredProjects.length;
    const totalPages = Math.ceil(
      total / PROJECTS_PER_PAGE
    );

    if (currentPage > totalPages) {
      currentPage = Math.max(1, totalPages);
    }

    const start = (currentPage - 1) * PROJECTS_PER_PAGE;

    const visibleProjects = filteredProjects.slice(
      start,
      start + PROJECTS_PER_PAGE
    );

    count.textContent = total
      ? `Showing ${start + 1}–${Math.min(
          start + PROJECTS_PER_PAGE,
          total
        )} of ${total} projects`
      : "Showing 0 projects";

    list.innerHTML = visibleProjects
      .map(projectCard)
      .join("");

    empty.hidden = total !== 0;
    list.hidden = total === 0;

    renderPagination(totalPages);
  }

  /* =========================================
     CLEAR FILTERS
  ========================================= */

  function resetFilters() {
    searchInput.value = "";
    typeFilter.value = "";
    statusFilter.value = "";
    locationFilter.value = "";
    sortSelect.value = "default";

    currentPage = 1;

    renderProjects();
  }

  /* =========================================
     IMAGE GALLERY NAVIGATION
  ========================================= */

  function updateGallery(card, newIndex) {
    const gallery = card.querySelector(".project-gallery");

    if (!gallery) return;

    const images = JSON.parse(
      gallery.dataset.images || "[]"
    );

    if (!images.length) return;

    const index =
      (newIndex + images.length) % images.length;

    gallery.dataset.index = index;

    const image = gallery.querySelector(".project-image");
    const counter = gallery.querySelector(".gallery-counter");

    if (image) {
      image.src = images[index];
    }

    if (counter) {
      counter.textContent = images.length > 1
        ? `▧ ${index + 1}/${images.length}`
        : `▧ ${images.length}`;
    }
  }

  /* =========================================
     SAVE PROJECT
  ========================================= */

  function saveProject(card) {
    const id = String(card.dataset.projectId);

    if (savedProjects.has(id)) {
      savedProjects.delete(id);
    } else {
      savedProjects.add(id);
    }

    try {
      localStorage.setItem(
        SAVED_KEY,
        JSON.stringify([...savedProjects])
      );
    } catch (error) {
      console.warn(
        "Could not save project preferences.",
        error
      );
    }

    const button = card.querySelector(
      '[data-action="save"]'
    );

    if (!button) return;

    const isSaved = savedProjects.has(id);

    button.classList.toggle("is-saved", isSaved);

    button.setAttribute(
      "aria-pressed",
      String(isSaved)
    );

    button.setAttribute(
      "aria-label",
      isSaved ? "Remove saved project" : "Save project"
    );

    const star = button.querySelector(".save-star");

    if (star) {
      star.textContent = isSaved ? "★" : "☆";
    }

    const label = button.querySelector("span:last-child");

    if (label) {
      label.textContent = isSaved ? "Saved" : "Save";
    }
  }

  /* =========================================
     LIGHTBOX
  ========================================= */

  function openLightbox(images, index, title) {
    if (!images.length) return;

    lightboxImages = images;
    lightboxIndex = index;
    lightboxTitle = title || "";

    lastFocusedElement = document.activeElement;

    lightbox.classList.add("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add("lightbox-open");

    showLightboxImage();

    lightboxClose?.focus();
  }

  function showLightboxImage() {
    if (!lightboxImages.length) return;

    lightboxIndex =
      (lightboxIndex + lightboxImages.length) %
      lightboxImages.length;

    lightboxImage.src = lightboxImages[lightboxIndex];

    lightboxImage.alt =
      lightboxTitle || "Project image";

    lightboxCaption.textContent =
      `${lightboxTitle ? lightboxTitle + " — " : ""}` +
      `${lightboxIndex + 1} of ${lightboxImages.length}`;
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove("lightbox-open");

    lastFocusedElement?.focus();
  }

  function moveLightbox(direction) {
    lightboxIndex += direction;
    showLightboxImage();
  }

  /* =========================================
     EVENT LISTENERS
  ========================================= */

  [
    searchInput,
    typeFilter,
    statusFilter,
    locationFilter,
    sortSelect
  ].forEach(element => {
    element.addEventListener(
      element === searchInput ? "input" : "change",
      () => {
        currentPage = 1;
        renderProjects();
      }
    );
  });

  clearButton?.addEventListener(
    "click",
    resetFilters
  );

  emptyClearButton?.addEventListener(
    "click",
    resetFilters
  );

  pagination.addEventListener("click", event => {
    const button = event.target.closest("[data-page]");

    if (!button || button.disabled) return;

    currentPage = Number(button.dataset.page);

    renderProjects();

    $("#projects")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const card = button.closest(".project-card");

    if (!card) return;

    const gallery = card.querySelector(".project-gallery");

    const images = JSON.parse(
      gallery?.dataset.images || "[]"
    );

    const index = Number(
      gallery?.dataset.index || 0
    );

    const project = filteredProjects.find(
      item =>
        String(item.id) === String(card.dataset.projectId)
    );

    switch (button.dataset.action) {
      case "prev":
        updateGallery(card, index - 1);
        break;

      case "next":
        updateGallery(card, index + 1);
        break;

      case "lightbox":
        openLightbox(
          images,
          index,
          project?.title || ""
        );
        break;

      case "save":
        saveProject(card);
        break;
    }
  });

  lightboxClose?.addEventListener(
    "click",
    closeLightbox
  );

  lightboxPrev?.addEventListener("click", () => {
    moveLightbox(-1);
  });

  lightboxNext?.addEventListener("click", () => {
    moveLightbox(1);
  });

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      moveLightbox(-1);
    }

    if (event.key === "ArrowRight") {
      moveLightbox(1);
    }
  });

  /* =========================================
     LOAD JSON DATA
  ========================================= */

  async function loadProjects() {
    try {
      const response = await fetch(DATA_URL);

      if (!response.ok) {
        throw new Error(
          `Failed to load projects: ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "The projects JSON must contain an array."
        );
      }

      projects = data;

      initializeFilters();
      renderProjects();

    } catch (error) {
      console.error(
        "Project loading error:",
        error
      );

      count.textContent = "Unable to load projects";

      list.hidden = false;

      list.innerHTML = `
        <div class="projects-loading">
          <h3>Projects could not be loaded</h3>

          <p>
            Check the JSON file path and ensure the website
            is running through a web server.
          </p>
        </div>
      `;

      pagination.innerHTML = "";
    }
  }

  loadProjects();
});