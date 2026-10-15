document.addEventListener("DOMContentLoaded", () => {
    const DATA_URL = "./assets/js/projectsData.json";
    const PROJECTS_PER_PAGE = 1;

    const list = document.getElementById("projectsList");
    const count = document.getElementById("projectsCount");
    const pagination = document.getElementById("projectsPagination");
    const empty = document.getElementById("projectsEmpty");

    const searchInput = document.getElementById("projectSearch");
    const typeFilter = document.getElementById("projectTypeFilter");
    const statusFilter = document.getElementById("projectStatusFilter");
    const locationFilter = document.getElementById("projectLocationFilter");
    const sortSelect = document.getElementById("projectSort");

    const clearButton = document.getElementById("clearFilters");
    const emptyClearButton = document.getElementById("emptyClearFilters");

    const lightbox = document.getElementById("projectLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");

    let projects = [];
    let filteredProjects = [];
    let currentPage = 1;

    let lightboxImages = [];
    let lightboxIndex = 0;
    let lastFocusedElement = null;

    const savedKey = "alHabbaiSavedProjects";

    const savedProjects = new Set(
        JSON.parse(localStorage.getItem(savedKey) || "[]").map(String),
    );

    // HTML escaping prevents JSON values from being interpreted as markup.
    function escapeHTML(value) {
        return String(value ?? "").replace(
            /[&<>"']/g,
            (char) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[char],
        );
    }

    function formatValue(value) {
        return value == null || value === "" ? "Not specified" : String(value);
    }

    function dateValue(value) {
        if (!value) return null;

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date.getTime();
    }

    function getProjectImages(project) {
        const images = Array.isArray(project.images)
            ? project.images.filter(Boolean)
            : [];

        if (project.image && !images.includes(project.image)) {
            images.unshift(project.image);
        }

        return [...new Set(images)];
    }

    

    function locationText(project) {
        return (
            project.fullAddress ||
            project.projectLocation ||
            project.area ||
            project.state ||
            "Location not specified"
        );
    }

    function getLocationOptions(project) {
        return project.state || project.projectLocation || project.area || "";
    }

    function icon(name) {
        const icons = {
            pin: `<svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/>
        <circle cx="12" cy="10" r="2.5"/></svg>`,

            building: `<svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <rect x="4" y="2.5" width="16" height="19" rx="1"/>
        <path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/></svg>`,

            calendar: `<svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M16 3v4M8 3v4M3 10h18"/></svg>`,

            arrow: `<svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M5 12h14M13 5l7 7-7 7"/></svg>`,
        };

        return icons[name] || "";
    }

    function populateFilter(select, values) {
        const previousValue = select.value;
        const firstOption = select.options[0].outerHTML;

        const options = [...new Set(values.filter(Boolean))].sort((a, b) =>
            a.localeCompare(b, undefined, {
                sensitivity: "base",
            }),
        );

        select.innerHTML =
            firstOption +
            options
                .map(
                    (value) =>
                        `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`,
                )
                .join("");

        if (options.includes(previousValue)) {
            select.value = previousValue;
        }
    }

    function initializeFilters() {
        populateFilter(
            typeFilter,
            projects.map((project) => project.projectType),
        );

        populateFilter(
            statusFilter,
            projects.map((project) => project.status),
        );

        populateFilter(locationFilter, projects.map(getLocationOptions));
    }

    function getFilteredProjects() {
        const search = searchInput.value.trim().toLowerCase();
        const type = typeFilter.value;
        const status = statusFilter.value;
        const location = locationFilter.value;

        let result = projects.filter((project) => {
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
                project.plot,
                ...(Array.isArray(project.projectComprisesOf)
                    ? project.projectComprisesOf
                    : []),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
                (!search || searchableText.includes(search)) &&
                (!type || project.projectType === type) &&
                (!status || project.status === status) &&
                (!location || getLocationOptions(project) === location)
            );
        });

        switch (sortSelect.value) {
            case "latest":
                result.sort(
                    (a, b) =>
                        (dateValue(b.completionDate) ?? -Infinity) -
                        (dateValue(a.completionDate) ?? -Infinity),
                );
                break;

            case "oldest":
                result.sort(
                    (a, b) =>
                        (dateValue(a.completionDate) ?? Infinity) -
                        (dateValue(b.completionDate) ?? Infinity),
                );
                break;

            case "title":
                result.sort((a, b) =>
                    formatValue(a.title).localeCompare(formatValue(b.title)),
                );
                break;

            default:
                result.sort((a, b) => Number(a.id) - Number(b.id));
                break;
        }

        return result;
    }

    function getProjectType(project) {
        return escapeHTML(formatValue(project.projectType));
    }

    function getComprises(project) {
        const items = Array.isArray(project.projectComprisesOf)
            ? project.projectComprisesOf
            : [];

        if (!items.length) {
            return `<li>Details not specified</li>`;
        }

        return items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
    }

    function contactBlock(title, value) {
        return `
      <div class="project-contact">
        <div class="contact-icon">${icon("building")}</div>
        <div class="contact-copy">
          <strong>${escapeHTML(title)}</strong>
          <span>${escapeHTML(formatValue(value))}</span>
        </div>
      </div>`;
    }

    function projectCard(project) {
        const images = getProjectImages(project);
        const firstImage = images[0] || "";
        const isSaved = savedProjects.has(String(project.id));

        const fullAddress = locationText(project);
        const mapQuery = encodeURIComponent(fullAddress);
        const safeImage = escapeHTML(firstImage);

        return `
      <article class="project-card" data-project-id="${escapeHTML(project.id)}">

        <div class="project-main">

          <div class="project-gallery"
            data-images="${escapeHTML(JSON.stringify(images))}"
            data-index="0">

            <button type="button" class="project-image-button"
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

            ${images.length > 1
                ? `
              <button type="button" class="gallery-arrow gallery-prev"
                data-action="prev" aria-label="Previous project image">
                &#10094;
              </button>

              <button type="button" class="gallery-arrow gallery-next"
                data-action="next" aria-label="Next project image">
                &#10095;
              </button>
            `
                : ""
            }

            <div class="gallery-bottom">
              <span class="gallery-counter">
                ${images.length
                ? "▧ " + (images.length > 1 ? "1/" : "") + images.length
                : "No images"
            }
              </span>

              <button type="button"
                class="gallery-save ${isSaved ? "is-saved" : ""}"
                data-action="save"
                aria-pressed="${isSaved}"
                aria-label="${isSaved ? "Remove saved project" : "Save project"}">
                <span class="save-star">${isSaved ? "★" : "☆"}</span>
                <span>${isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>

          </div>

          <div class="project-info">

            <!-- 1. Project type -->
            <div class="project-wrapper">
                <div class="project-type-wrapper">
                <span class="project-type-label">Project type</span>
                <h4 class="project-type-value">${getProjectType(project)}</h4>
                </div>
                <div class="project-value-wrapper">
                   <span class="project-type-label">Project Value</span>
                   <h4  class="project-type-value">${escapeHTML(formatValue(project.projectValue))}</h4>
                      
                </div>
   
            </div>

           

            <!-- 3. Project comprises of -->
            <div class="project-comprises">
              <h4 class="comprises-heading">Project comprises of</h4>
              <ul class="comprises-list">
                ${getComprises(project)}
              </ul>
            </div>

            <!-- 4. Client and consultant -->
            <div class="project-contacts">
              ${contactBlock("Client", project.client)}
              ${contactBlock("Consultant", project.consultant)}
            </div>

             <!-- 2. Location -->
            <div class="project-location">
              ${icon("pin")}
              <a href="../../map.html"
                target="_blank" rel="noopener noreferrer">
                ${escapeHTML(fullAddress)}
              </a>
            </div>

          </div>
        </div>

        <!-- Bottom metadata bar -->
        <div class="project-meta">

        <div class="meta-item meta-project-number">
            <span style="color:#1A6469">${escapeHTML(formatValue(project.projectNumber))}</span>
        </div>

        
        <div class="meta-item">
            ${icon("calendar")}
            <span>Started: ${escapeHTML(formatValue(project.startDate))}</span>
          </div>

          <div class="meta-item">
            ${icon("calendar")}
            <span>Completed: ${escapeHTML(formatValue(project.completionDate))}</span>
          </div>

          <a class="project-details-link"
            href="project-details.html?slug=${encodeURIComponent(project.slug || project.projectNumber || project.id)}">
            View Details ${icon("arrow")}
          </a>

        </div>
      </article>`;
    }

    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            pagination.innerHTML = "";
            return;
        }

        const buttons = [];

        function addButton(label, page, disabled = false, active = false) {
            buttons.push(`
        <button type="button"
          class="page-button ${active ? "active" : ""}"
          data-page="${page}"
          ${disabled ? "disabled" : ""}
          ${active ? 'aria-current="page"' : ""}
          aria-label="${label === "Previous" || label === "Next" ? label : "Page " + label
                }">
          ${label}
        </button>`);
        }

        addButton("Previous", currentPage - 1, currentPage === 1);

        let pages = new Set([1, totalPages, currentPage]);

        for (let page = currentPage - 1; page <= currentPage + 1; page++) {
            if (page >= 1 && page <= totalPages) {
                pages.add(page);
            }
        }

        const orderedPages = [...pages].sort((a, b) => a - b);
        let previous = 0;

        orderedPages.forEach((page) => {
            if (previous && page - previous > 1) {
                buttons.push(`<span class="page-ellipsis">...</span>`);
            }

            addButton(String(page), page, false, page === currentPage);
            previous = page;
        });

        addButton("Next", currentPage + 1, currentPage === totalPages);

        pagination.innerHTML = buttons.join("");
    }

    function renderProjects() {
        filteredProjects = getFilteredProjects();

        const total = filteredProjects.length;
        const totalPages = Math.ceil(total / PROJECTS_PER_PAGE);

        if (currentPage > totalPages) {
            currentPage = Math.max(1, totalPages);
        }

        const start = (currentPage - 1) * PROJECTS_PER_PAGE;
        const visibleProjects = filteredProjects.slice(
            start,
            start + PROJECTS_PER_PAGE,
        );

        count.textContent = total
            ? `Showing ${start + 1}–${Math.min(start + PROJECTS_PER_PAGE, total)} of ${total} projects`
            : "Showing 0 projects";

        list.innerHTML = visibleProjects.map(projectCard).join("");

        empty.hidden = total !== 0;
        list.hidden = total === 0;

        renderPagination(totalPages);
    }

    function resetFilters() {
        searchInput.value = "";
        typeFilter.value = "";
        statusFilter.value = "";
        locationFilter.value = "";
        sortSelect.value = "default";

        currentPage = 1;
        renderProjects();
    }

    function updateGallery(card, newIndex) {
        const gallery = card.querySelector(".project-gallery");
        const images = JSON.parse(gallery.dataset.images || "[]");

        if (!images.length) return;

        const index = (newIndex + images.length) % images.length;
        gallery.dataset.index = index;

        const image = gallery.querySelector(".project-image");
        const counter = gallery.querySelector(".gallery-counter");

        image.src = images[index];
        counter.textContent =
            images.length > 1
                ? `▧ ${index + 1}/${images.length}`
                : `▧ ${images.length}`;
    }

    function saveProject(card) {
        const id = String(card.dataset.projectId);

        if (savedProjects.has(id)) {
            savedProjects.delete(id);
        } else {
            savedProjects.add(id);
        }

        try {
            localStorage.setItem(savedKey, JSON.stringify([...savedProjects]));
        } catch (error) {
            console.warn("Could not save project preferences.", error);
        }

        const button = card.querySelector('[data-action="save"]');
        const isSaved = savedProjects.has(id);

        button.classList.toggle("is-saved", isSaved);
        button.setAttribute("aria-pressed", String(isSaved));
        button.setAttribute(
            "aria-label",
            isSaved ? "Remove saved project" : "Save project",
        );

        button.querySelector(".save-star").textContent = isSaved ? "★" : "☆";
        button.querySelector("span:last-child").textContent = isSaved
            ? "Saved"
            : "Save";
    }

    function openLightbox(images, index, title) {
        if (!images.length) return;

        lightboxImages = images;
        lightboxIndex = index;
        lastFocusedElement = document.activeElement;

        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");

        showLightboxImage(title);
        document.getElementById("lightboxClose").focus();
    }

    function showLightboxImage(title = "") {
        if (!lightboxImages.length) return;

        lightboxIndex =
            (lightboxIndex + lightboxImages.length) % lightboxImages.length;

        lightboxImage.src = lightboxImages[lightboxIndex];
        lightboxImage.alt = title || "Project image";

        lightboxCaption.textContent = `${title ? title + " — " : ""}${lightboxIndex + 1} of ${lightboxImages.length}`;
    }

    function closeLightbox() {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");

        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function moveLightbox(direction) {
        lightboxIndex += direction;
        showLightboxImage();
    }

    // Search, filters, and sorting
    [searchInput, typeFilter, statusFilter, locationFilter, sortSelect].forEach(
        (element) => {
            element.addEventListener(
                element === searchInput ? "input" : "change",
                () => {
                    currentPage = 1;
                    renderProjects();
                },
            );
        },
    );

    clearButton.addEventListener("click", resetFilters);
    emptyClearButton.addEventListener("click", resetFilters);

    // Pagination
    pagination.addEventListener("click", (event) => {
        const button = event.target.closest("[data-page]");

        if (!button || button.disabled) return;

        currentPage = Number(button.dataset.page);
        renderProjects();

        document.getElementById("projects").scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    });

    // Gallery navigation, lightbox, and saving
    list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const card = button.closest(".project-card");
        if (!card) return;

        const gallery = card.querySelector(".project-gallery");
        const images = JSON.parse(gallery.dataset.images || "[]");
        const index = Number(gallery.dataset.index || 0);

        const project = filteredProjects.find(
            (item) => String(item.id) === String(card.dataset.projectId),
        );

        if (button.dataset.action === "prev") {
            updateGallery(card, index - 1);
        }

        if (button.dataset.action === "next") {
            updateGallery(card, index + 1);
        }

        if (button.dataset.action === "lightbox") {
            openLightbox(images, index, project?.title || "");
        }

        if (button.dataset.action === "save") {
            saveProject(card);
        }
    });

    document
        .getElementById("lightboxClose")
        .addEventListener("click", closeLightbox);

    document
        .getElementById("lightboxPrev")
        .addEventListener("click", () => moveLightbox(-1));

    document
        .getElementById("lightboxNext")
        .addEventListener("click", () => moveLightbox(1));

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("is-open")) return;

        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") moveLightbox(-1);
        if (event.key === "ArrowRight") moveLightbox(1);
    });

    // Load JSON
    async function loadProjects() {
        try {
            const response = await fetch(DATA_URL);

            if (!response.ok) {
                throw new Error(`Failed to load projects: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error("The projects JSON must contain an array.");
            }

            projects = data;
            initializeFilters();
            renderProjects();
        } catch (error) {
            console.error(error);

            count.textContent = "Unable to load projects";

            list.hidden = false;
            list.innerHTML = `
        <div class="projects-loading">
          <h3>Projects could not be loaded</h3>
          <p>Check the JSON file path and ensure the website is running through a web server.</p>
        </div>`;

            pagination.innerHTML = "";
        }
    }

    loadProjects();
});
