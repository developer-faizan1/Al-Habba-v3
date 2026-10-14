
/* =========================================================
   AL HABBAI CONTRACTING — PROPERTY-STYLE PROJECT LISTING
   Search, filters, sorting, pagination, image gallery, saving
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const JSON_FILE = "./assets/js/projectsData.json";
  const DEFAULT_IMAGE = "./assets/images/projects_img/default.jpg";
  const CARDS_PER_PAGE = 4;

  const $ = (id) => document.getElementById(id);

  const grid = $("projectsGrid");
  const searchInput = $("projectSearch");
  const typeFilter = $("projectTypeFilter");
  const statusFilter = $("projectStatusFilter");
  const locationFilter = $("projectLocationFilter");
  const sortFilter = $("projectSort");
  const clearButton = $("clearProjectFilters");
  const previousButton = $("previousProject");
  const nextButton = $("nextProject");
  const pagination = $("projectPagination");
  const counter = $("projectCounter");
  const resultsCount = $("projectResultsCount");
  const emptyState = $("projectsEmpty");
  const resetEmptyButton = $("resetEmptyFilters");

  if (
    !grid ||
    !searchInput ||
    !typeFilter ||
    !statusFilter ||
    !locationFilter ||
    !sortFilter ||
    !pagination
  ) {
    console.error("Project listing: required HTML elements are missing.");
    return;
  }

  let allProjects = [];
  let filteredProjects = [];
  let currentPage = 0;
  let searchTimer;

  /* =========================================
     HELPERS
  ========================================= */

  const normalize = (value) =>
    String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getProjectNumber(project) {
    return project.projectNumber || `P-${project.id ?? ""}`;
  }

  function getProjectTitle(project) {
    return String(project.title || "Untitled Project").trim();
  }

  function getProjectLocation(project) {
    return (
      project.projectLocation ||
      project.fullAddress ||
      project.area ||
      project.city ||
      project.state ||
      project.country ||
      "United Arab Emirates"
    );
  }

  function getProjectUrl(project) {
    return (
      "project-details.html?slug=" +
      encodeURIComponent(project.slug || "")
    );
  }

  function getProjectImage(project) {
    return project.image || DEFAULT_IMAGE;
  }

  function getStatusClass(status) {
    const value = normalize(status);

    if (value === "completed") return "completed";

    if (
      [
        "ongoing",
        "under construction",
        "underconstruction",
        "in progress",
        "inprogress"
      ].includes(value)
    ) {
      return "ongoing";
    }

    return "";
  }

  function getNumericId(project) {
    const match = String(
      project.projectNumber || project.id || ""
    ).match(/\d+/);

    return match ? Number(match[0]) : 0;
  }

  /* =========================================
     SVG ICONS
  ========================================= */

  const icons = {
    building: `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="1"/>
        <path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/>
      </svg>`,

    location: `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/>
        <circle cx="12" cy="10" r="2.5"/>
      </svg>`,

    calendar: `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M16 3v4M8 3v4M3 10h18"/>
      </svg>`,

    arrowLeft: `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="m15 18-6-6 6-6"/>
      </svg>`,

    arrowRight: `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="m9 18 6-6-6-6"/>
      </svg>`,

    star: `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>
      </svg>`,

    arrow: `
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M4 12h16m-7-7 7 7-7 7"/>
      </svg>`
  };

  /* =========================================
     LOAD JSON
  ========================================= */

  async function loadProjects() {
    try {
      const response = await fetch(JSON_FILE);

      if (!response.ok) {
        throw new Error(`JSON request failed: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Expected an array in projectsData.json.");
      }

      allProjects = data;

      populateFilters();
      applyFilters();

    } catch (error) {
      console.error("Unable to load projects:", error);

      grid.hidden = false;
      grid.innerHTML = `
        <div class="projects-loading">
          Unable to load projects. Check the JSON file path
          and make sure the website is running through a server.
        </div>
      `;

      if (resultsCount) {
        resultsCount.textContent = "Unable to load projects";
      }
    }
  }

  /* =========================================
     FILTER DROPDOWNS
  ========================================= */

  function populateSelect(select, values, defaultText) {
    const previousValue = select.value;

    const uniqueValues = [
      ...new Set(
        values
          .filter((value) => value != null && String(value).trim())
          .map((value) => String(value).trim())
      )
    ].sort((a, b) => a.localeCompare(b));

    select.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultText;
    select.appendChild(defaultOption);

    uniqueValues.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    if (uniqueValues.includes(previousValue)) {
      select.value = previousValue;
    }
  }

  function populateFilters() {
    populateSelect(
      typeFilter,
      allProjects.map((project) => project.projectType),
      "All Types"
    );

    populateSelect(
      statusFilter,
      allProjects.map((project) => project.status),
      "All Status"
    );

    populateSelect(
      locationFilter,
      allProjects.map(getProjectLocation),
      "All Locations"
    );
  }

  /* =========================================
     SEARCH AND FILTER
  ========================================= */

  function applyFilters() {
    const query = normalize(searchInput.value);
    const selectedType = normalize(typeFilter.value);
    const selectedStatus = normalize(statusFilter.value);
    const selectedLocation = normalize(locationFilter.value);

    filteredProjects = allProjects.filter((project) => {
      const fields = [
        project.id,
        project.projectNumber,
        project.slug,
        project.title,
        project.projectType,
        project.status,
        project.projectLocation,
        project.fullAddress,
        project.area,
        project.city,
        project.state,
        project.country,
        project.client,
        project.consultant,
        project.projectValue,
        project.projectDescription,
        project.plot,
        project.startDate,
        project.completionDate
      ];

      const searchableText = fields
        .filter((value) => value != null)
        .map(normalize)
        .join(" ");

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesType =
        !selectedType ||
        normalize(project.projectType) === selectedType;

      const matchesStatus =
        !selectedStatus ||
        normalize(project.status) === selectedStatus;

      const matchesLocation =
        !selectedLocation ||
        normalize(getProjectLocation(project)) === selectedLocation;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesLocation
      );
    });

    sortProjects();

    currentPage = 0;
    renderProjects();
  }

  /* =========================================
     SORTING
  ========================================= */

  function sortProjects() {
    switch (sortFilter.value) {
      case "latest":
      case "number-desc":
        filteredProjects.sort(
          (a, b) => getNumericId(b) - getNumericId(a)
        );
        break;

      case "oldest":
      case "number-asc":
        filteredProjects.sort(
          (a, b) => getNumericId(a) - getNumericId(b)
        );
        break;

      case "title-asc":
        filteredProjects.sort((a, b) =>
          getProjectTitle(a).localeCompare(getProjectTitle(b))
        );
        break;

      case "title-desc":
        filteredProjects.sort((a, b) =>
          getProjectTitle(b).localeCompare(getProjectTitle(a))
        );
        break;

      default:
        break;
    }
  }

  /* =========================================
     SAVED PROJECTS
  ========================================= */

  function readSavedProjects() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("savedProjects") || "[]"
      );

      return Array.isArray(saved) ? saved.map(String) : [];
    } catch {
      return [];
    }
  }

  /* =========================================
     CREATE PROJECT CARD
  ========================================= */

  function createProjectCard(project, index) {
    const title = getProjectTitle(project);
    const projectNumber = getProjectNumber(project);
    const location = getProjectLocation(project);
    const status = project.status || "Not specified";
    const statusClass = getStatusClass(status);
    const projectUrl = getProjectUrl(project);

    const gallery = [
      ...new Set([
        ...(Array.isArray(project.images) ? project.images : []),
        project.image
      ].filter(Boolean))
    ];

    const images = gallery.length ? gallery : [DEFAULT_IMAGE];
    const image = images[0];

    const value = project.projectValue || "On request";

    const address =
      project.fullAddress ||
      project.projectLocation ||
      location;

    const type = project.projectType || "Construction";
    const client = project.client || "Not specified";
    const consultant = project.consultant || "Not specified";
    const completionDate = project.completionDate || "Not specified";
    const startDate = project.startDate || "Not specified";

    const description =
      project.projectDescription ||
      "Explore the details of this development.";

    const isSaved = readSavedProjects().includes(String(project.id));

    const highlights = [
      description,
      `Client: ${client}`,
      `Consultant: ${consultant}`,
      `Project status: ${status}`
    ];

    return `
      <article
        class="project-card"
        data-project-id="${escapeHTML(project.id)}"
        style="animation-delay:${Math.min(index, 7) * 45}ms"
      >

        <!-- LEFT IMAGE GALLERY -->
        <div class="project-card-visual">

          <div class="project-image">
            <img
              src="${escapeHTML(image)}"
              data-gallery-images="${escapeHTML(JSON.stringify(images))}"
              data-image-index="0"
              alt="${escapeHTML(title)}"
              loading="${index < 2 ? "eager" : "lazy"}"
              decoding="async"
            >
          </div>

          <span class="project-badge ${statusClass}">
            ${escapeHTML(status)}
          </span>

          ${
            images.length > 1
              ? `
                <button
                  type="button"
                  class="project-gallery-arrow project-gallery-prev"
                  data-gallery-prev
                  aria-label="Previous project image"
                >${icons.arrowLeft}</button>

                <button
                  type="button"
                  class="project-gallery-arrow project-gallery-next"
                  data-gallery-next
                  aria-label="Next project image"
                >${icons.arrowRight}</button>
              `
              : ""
          }

          <div class="project-image-actions">
            <span class="project-image-count">
              <span aria-hidden="true">▧</span>
              <span data-gallery-count>1/${images.length}</span>
            </span>

            <button
              type="button"
              class="project-save ${isSaved ? "is-saved" : ""}"
              data-save-project
              aria-pressed="${isSaved}"
              aria-label="${isSaved ? "Remove saved project" : "Save project"}"
            >
              ${icons.star}
              <span>${isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        <!-- RIGHT PROJECT INFORMATION -->
        <div class="project-card-content">

          <div class="project-main-information">

            <span class="project-value-label">Project value</span>

            <p class="project-value">
              ${escapeHTML(value)}
            </p>

            <h3 class="project-card-title">
              <a href="${projectUrl}">
                ${escapeHTML(title)}
              </a>
            </h3>

            <div class="project-card-address">
              ${icons.location}
              <span>${escapeHTML(address)}</span>
            </div>

            <ul class="project-highlights">
              ${highlights.map((item) => `
                <li>${escapeHTML(item)}</li>
              `).join("")}
            </ul>

          </div>

          <!-- CLIENT AND CONSULTANT -->
          <div class="project-card-agents">

            <div class="project-info-block">
              <div class="project-info-icon">
                ${icons.building}
              </div>

              <div class="project-info-text">
                <strong>Client</strong>
                <span>${escapeHTML(client)}</span>
              </div>
            </div>

            <div class="project-info-block">
              <div class="project-info-icon">
                ${icons.building}
              </div>

              <div class="project-info-text">
                <strong>Consultant</strong>
                <span>${escapeHTML(consultant)}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- BOTTOM INFORMATION BAR -->
        <div class="project-card-bottom">

          <span class="project-bottom-item">
            ${icons.building}
            <strong>${escapeHTML(type)}</strong>
          </span>

          <span class="project-bottom-item">
            ${icons.location}
            <span>${escapeHTML(location)}</span>
          </span>

          <span class="project-bottom-item">
            ${icons.calendar}
            <span>Completed: ${escapeHTML(completionDate)}</span>
          </span>

          <span class="project-bottom-item">
            ${icons.calendar}
            <span>Started: ${escapeHTML(startDate)}</span>
          </span>

          <span class="project-bottom-item">
            <strong>${escapeHTML(projectNumber)}</strong>
          </span>

          <a
            class="project-view-link project-bottom-action"
            href="${projectUrl}"
            aria-label="View details for ${escapeHTML(title)}"
          >
            View Details
            ${icons.arrow}
          </a>

        </div>
      </article>
    `;
  }

  /* =========================================
     GALLERY AND SAVE INTERACTIONS
  ========================================= */

  function bindProjectCardInteractions() {
    grid.querySelectorAll(".project-card").forEach((card) => {
      const image = card.querySelector(".project-image img");
      const count = card.querySelector("[data-gallery-count]");
      const previous = card.querySelector("[data-gallery-prev]");
      const next = card.querySelector("[data-gallery-next]");
      const saveButton = card.querySelector("[data-save-project]");

      if (image) {
        let images = [];

        try {
          images = JSON.parse(image.dataset.galleryImages || "[]");
        } catch {
          images = [];
        }

        let currentIndex = 0;

        image.addEventListener("error", () => {
          if (image.dataset.fallbackUsed === "true") return;

          image.dataset.fallbackUsed = "true";
          image.src = DEFAULT_IMAGE;
        });

        function showImage(index) {
          if (!images.length) return;

          currentIndex = (index + images.length) % images.length;

          image.dataset.fallbackUsed = "false";
          image.src = images[currentIndex];
          image.dataset.imageIndex = String(currentIndex);

          if (count) {
            count.textContent = `${currentIndex + 1}/${images.length}`;
          }
        }

        previous?.addEventListener("click", () => {
          showImage(currentIndex - 1);
        });

        next?.addEventListener("click", () => {
          showImage(currentIndex + 1);
        });
      }

      saveButton?.addEventListener("click", () => {
        const projectId = String(card.dataset.projectId);
        let saved = readSavedProjects();

        const alreadySaved = saved.includes(projectId);

        saved = alreadySaved
          ? saved.filter((id) => id !== projectId)
          : [...saved, projectId];

        try {
          localStorage.setItem(
            "savedProjects",
            JSON.stringify(saved)
          );
        } catch (error) {
          console.warn("Could not save project in this browser.", error);
        }

        saveButton.classList.toggle("is-saved", !alreadySaved);
        saveButton.setAttribute("aria-pressed", String(!alreadySaved));

        saveButton.setAttribute(
          "aria-label",
          alreadySaved ? "Save project" : "Remove saved project"
        );

        const label = saveButton.querySelector("span");

        if (label) {
          label.textContent = alreadySaved ? "Save" : "Saved";
        }
      });
    });
  }

  /* =========================================
     RENDER PROJECTS
  ========================================= */

  function renderProjects() {
    const total = filteredProjects.length;
    const totalPages = Math.ceil(total / CARDS_PER_PAGE);

    if (emptyState) {
      emptyState.hidden = total !== 0;
    }

    grid.hidden = total === 0;

    if (total === 0) {
      grid.innerHTML = "";

      if (resultsCount) {
        resultsCount.textContent = "0 projects found";
      }

      if (counter) {
        counter.textContent = "Page 0";
      }

      updatePagination(0);
      return;
    }

    currentPage = Math.min(currentPage, totalPages - 1);

    const start = currentPage * CARDS_PER_PAGE;

    const visibleProjects = filteredProjects.slice(
      start,
      start + CARDS_PER_PAGE
    );

    grid.innerHTML = visibleProjects
      .map((project, index) => createProjectCard(project, index))
      .join("");

    bindProjectCardInteractions();

    if (resultsCount) {
      resultsCount.textContent =
        `Showing ${start + 1}–${Math.min(
          start + visibleProjects.length,
          total
        )} of ${total} projects`;
    }

    if (counter) {
      counter.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    }

    updatePagination(totalPages);
  }

  /* =========================================
     PAGINATION
  ========================================= */

  function updatePagination(totalPages) {
    if (previousButton) {
      previousButton.disabled = currentPage <= 0;
    }

    if (nextButton) {
      nextButton.disabled =
        totalPages === 0 || currentPage >= totalPages - 1;
    }

    pagination.replaceChildren();

    for (let page = 0; page < totalPages; page++) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "pagination-page";
      button.textContent = String(page + 1);
      button.setAttribute("aria-label", `Go to page ${page + 1}`);

      if (page === currentPage) {
        button.classList.add("active");
        button.setAttribute("aria-current", "page");
      }

      button.addEventListener("click", () => {
        currentPage = page;
        renderProjects();
        scrollToProjects();
      });

      pagination.appendChild(button);
    }
  }

  function goToPage(page) {
    const totalPages = Math.ceil(
      filteredProjects.length / CARDS_PER_PAGE
    );

    if (page < 0 || page >= totalPages) return;

    currentPage = page;
    renderProjects();
    scrollToProjects();
  }

  function scrollToProjects() {
    if (window.innerWidth <= 900) {
      document.querySelector(".projects-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  /* =========================================
     CLEAR FILTERS
  ========================================= */

  function clearAllFilters() {
    searchInput.value = "";
    typeFilter.value = "";
    statusFilter.value = "";
    locationFilter.value = "";
    sortFilter.value = "default";

    applyFilters();
  }

  /* =========================================
     EVENTS
  ========================================= */

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 200);
  });

  typeFilter.addEventListener("change", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  locationFilter.addEventListener("change", applyFilters);
  sortFilter.addEventListener("change", applyFilters);

  clearButton?.addEventListener("click", clearAllFilters);
  resetEmptyButton?.addEventListener("click", clearAllFilters);

  previousButton?.addEventListener("click", () => {
    goToPage(currentPage - 1);
  });

  nextButton?.addEventListener("click", () => {
    goToPage(currentPage + 1);
  });

  /* START */
  loadProjects();
});
