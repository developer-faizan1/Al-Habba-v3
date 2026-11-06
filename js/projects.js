/* =========================================
   AL HABBAI CONTRACTING
   IMAGE-FOCUSED PROJECT SHOWCASE
========================================= */

const PROJECTS_JSON_URL = "./projectsData.json";
const PROJECTS_PER_PAGE = 8;

/* =========================================
   DOM ELEMENTS
========================================= */

const projectsList = document.getElementById("projectsList");
const projectSearch = document.getElementById("projectSearch");
const projectTypeFilter = document.getElementById("projectTypeFilter");
const projectStatusFilter = document.getElementById("projectStatusFilter");
const projectLocationFilter = document.getElementById("projectLocationFilter");
const projectSort = document.getElementById("projectSort");

const clearFilters = document.getElementById("clearFilters");
const emptyClearFilters = document.getElementById("emptyClearFilters");

const projectsPagination = document.getElementById("projectsPagination");
const projectsEmpty = document.getElementById("projectsEmpty");

/* =========================================
   PROJECT DATA
========================================= */

let allProjects = [];
let filteredProjects = [];
let currentPage = 1;

/* =========================================
   HELPER FUNCTIONS
========================================= */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function normalizeText(value) {
    return String(value ?? "")
        .normalize("NFKC")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, " ");
}

function uniqueValues(projects, key) {
    return [...new Set(
        projects
            .map(project => String(project[key] ?? "").trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
}

function getProjectNumber(project) {
    return project.projectNumber ?? project.id ?? "";
}

function getProjectSlug(project) {
    return String(project.slug ?? project.id ?? "").trim();
}

/* =========================================
   PROJECT STATUS
========================================= */

function getStatusConfig(status) {
    const key = normalizeText(status);

    if (key.includes("complete")) {
        return "Completed";
    }

    return "Running";
}

/* =========================================
   DATE HELPER
========================================= */

function parseProjectDate(value) {
    if (!value) return 0;

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
        return parsed.getTime();
    }

    const match = String(value)
        .trim()
        .match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);

    if (!match) return 0;

    const months = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11
    };

    const month = months[match[2].toLowerCase()];

    if (month === undefined) return 0;

    return new Date(
        Number(match[3]),
        month,
        Number(match[1])
    ).getTime();
}

/* =========================================
   PROJECT IMAGES
========================================= */

function getProjectImages(project) {
    const images = [
        project.image,
        ...(Array.isArray(project.images) ? project.images : [])
    ];

    return [...new Set(
        images
            .filter(Boolean)
            .map(image => String(image).trim())
            .filter(Boolean)
    )];
}

/* =========================================
   POPULATE FILTER OPTIONS
========================================= */

function populateSelect(select, values, defaultLabel) {
    if (!select) return;

    const previousValue = select.value;

    select.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultLabel;

    select.appendChild(defaultOption);

    values.forEach(value => {
        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);
    });

    if (values.includes(previousValue)) {
        select.value = previousValue;
    }
}

function populateFilters() {

    populateSelect(
        projectTypeFilter,
        uniqueValues(allProjects, "projectType"),
        "All Types"
    );

    populateSelect(
        projectStatusFilter,
        ["Completed", "Running"],
        "All Status"
    );

    const locations = [
        ...new Set(
            allProjects
                .map(project =>
                    String(
                        project.projectLocation ||
                        project.area ||
                        ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    populateSelect(
        projectLocationFilter,
        locations,
        "All Locations"
    );
}


/* =========================================
   PROJECT STATUS CHIP
========================================= */

function statusChipHTML(project) {

    const status = getStatusConfig(project.status);

    return `
        <div class="project-status status-${status.toLowerCase()}">
            ${status}
        </div>
    `;
}

/* =========================================
   IMAGE CAROUSEL HTML
========================================= */

function carouselHTML(project, images) {

    const title = escapeHTML(project.title || "Project");
    // "096", "P-096" or "Project 096" all become "096" so we can show "P-096"
    const numberLabel = escapeHTML(
        String(getProjectNumber(project))
            .trim()
            .replace(/^(?:project[\s-]*|p[-\s]+)/i, "")
    );
    const projectType = escapeHTML(project.projectType || "");

    const firstImage = images[0];

    const imageData = JSON.stringify(images)
        .replace(/</g, "\\u003c");

    return `
        <div class="project-gallery" data-carousel>

            <div class="project-carousel-track">

                <img
                    class="project-image"
                    src="${escapeHTML(firstImage)}"
                    alt="${title}"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                >

            </div>

            ${statusChipHTML(project)}

            <div class="project-info">

                <div class="project-meta">

                    ${numberLabel ? `<span class="project-number">P-${numberLabel}</span>` : ""}

                    <span class="project-line" aria-hidden="true"></span>

                    ${projectType ? `<span class="project-type">${projectType}</span>` : ""}

                </div>

                <h2 class="project-title">
                    ${title}
                </h2>

                <a
                    href="project-details.html?slug=${encodeURIComponent(getProjectSlug(project))}"
                    class="project-details-btn"
                    aria-label="View details for ${title}"
                >
                    <span class="project-details-text">View Details</span>
                    <span class="project-details-arrow" aria-hidden="true">&#8594;</span>
                </a>

            </div>

            ${
                images.length > 1
                    ? `
                        <button
                            type="button"
                            class="carousel-arrow carousel-prev"
                            aria-label="Previous image"
                        >
                            &#8249;
                        </button>

                        <button
                            type="button"
                            class="carousel-arrow carousel-next"
                            aria-label="Next image"
                        >
                            &#8250;
                        </button>

                        <div class="carousel-dots">

                            ${images.map((_, index) => `
                                <button
                                    type="button"
                                    class="carousel-dot ${index === 0 ? "is-active" : ""}"
                                    data-slide="${index}"
                                    aria-label="Show image ${index + 1}"
                                    aria-pressed="${index === 0}"
                                ></button>
                            `).join("")}

                        </div>
                    `
                    : ""
            }

            <script type="application/json" class="carousel-images">${imageData}</script>

        </div>
    `;
}

/* =========================================
   PROJECT CARD
========================================= */

function projectCard(project) {

    const images = getProjectImages(project);

    return `
        <article class="project-card">

            ${carouselHTML(project, images)}

        </article>
    `;
}

/* =========================================
   SEARCH, FILTER AND SORT
========================================= */

function applyFilters() {

    const search = normalizeText(projectSearch?.value);
    const type = normalizeText(projectTypeFilter?.value);
    const status = normalizeText(projectStatusFilter?.value);
    const location = normalizeText(projectLocationFilter?.value);

    filteredProjects = allProjects.filter(project => {

        const searchable = normalizeText([
            project.projectNumber,
            project.id,
            project.title,
            project.slug,
            project.client,
            project.consultant,
            project.projectLocation,
            project.fullAddress,
            project.area,
            project.projectType,
            project.projectDescription,
            project.status
        ].join(" "));

        const projectStatus = normalizeText(
            getStatusConfig(project.status)
        );

        const projectLocation = normalizeText(
            project.projectLocation || project.area
        );

        const matchesSearch =
            !search || searchable.includes(search);

        const matchesType =
            !type || normalizeText(project.projectType) === type;

        const matchesStatus =
            !status || projectStatus === status;

        const matchesLocation =
            !location || projectLocation === location;

        return (
            matchesSearch &&
            matchesType &&
            matchesStatus &&
            matchesLocation
        );
    });

    applySorting();

    currentPage = 1;

    renderProjects();
}

/* =========================================
   SORTING
========================================= */

function applySorting() {

    switch (projectSort?.value) {

        case "latest":
            filteredProjects.sort((a, b) =>
                parseProjectDate(b.startDate) -
                parseProjectDate(a.startDate)
            );
            break;

        case "oldest":
            filteredProjects.sort((a, b) =>
                parseProjectDate(a.startDate) -
                parseProjectDate(b.startDate)
            );
            break;

        case "title":
            filteredProjects.sort((a, b) =>
                String(a.title || "").localeCompare(
                    String(b.title || "")
                )
            );
            break;
    }
}

/* =========================================
   RENDER PROJECTS
========================================= */

function renderProjects() {

    if (!projectsList) return;

    const totalPages = Math.ceil(
        filteredProjects.length / PROJECTS_PER_PAGE
    );

    if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * PROJECTS_PER_PAGE;

    const pageProjects = filteredProjects.slice(
        start,
        start + PROJECTS_PER_PAGE
    );

    projectsList.innerHTML = pageProjects.length
        ? pageProjects.map(projectCard).join("")
        : "";

    if (projectsEmpty) {
        projectsEmpty.hidden = filteredProjects.length !== 0;
    }

    projectsList.style.display =
        filteredProjects.length ? "" : "none";

    if (projectsPagination) {
        projectsPagination.innerHTML = "";

        if (filteredProjects.length) {
            renderPagination(totalPages);
        }
    }
}

/* =========================================
   PAGINATION
========================================= */

function renderPagination(totalPages) {

    if (!projectsPagination || totalPages <= 1) return;

    function addButton(label, page, options = {}) {

        const button = document.createElement("button");

        button.type = "button";

        button.className =
            "page-button" + (options.active ? " active" : "");

        button.textContent = label;
        button.disabled = Boolean(options.disabled);

        if (options.active) {
            button.setAttribute("aria-current", "page");
        }

        button.addEventListener("click", () => {

            currentPage = page;

            renderProjects();

            document.getElementById("projects")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

        projectsPagination.appendChild(button);
    }

    addButton("‹", Math.max(1, currentPage - 1), {
        disabled: currentPage === 1
    });

    const pages = new Set([
        1,
        totalPages,
        currentPage,
        currentPage - 1,
        currentPage + 1
    ]);

    let previousPage = 0;

    [...pages]
        .filter(page => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b)
        .forEach(page => {

            if (previousPage && page - previousPage > 1) {

                const dots = document.createElement("span");

                dots.className = "page-ellipsis";
                dots.textContent = "…";

                projectsPagination.appendChild(dots);
            }

            addButton(String(page), page, {
                active: page === currentPage
            });

            previousPage = page;
        });

    addButton("›", Math.min(totalPages, currentPage + 1), {
        disabled: currentPage === totalPages
    });
}

/* =========================================
   RESET FILTERS
========================================= */

function resetFilters() {

    if (projectSearch) projectSearch.value = "";
    if (projectTypeFilter) projectTypeFilter.value = "";
    if (projectStatusFilter) projectStatusFilter.value = "";
    if (projectLocationFilter) projectLocationFilter.value = "";

    if (projectSort) {
        projectSort.value = "default";
    }

    currentPage = 1;

    applyFilters();
}

clearFilters?.addEventListener("click", resetFilters);

emptyClearFilters?.addEventListener("click", resetFilters);

/* =========================================
   FILTER EVENTS
========================================= */

[
    projectSearch,
    projectTypeFilter,
    projectStatusFilter,
    projectLocationFilter,
    projectSort
]
    .filter(Boolean)
    .forEach(control => {

        control.addEventListener(
            control === projectSearch ? "input" : "change",
            applyFilters
        );

    });

/* =========================================
   CAROUSEL IMAGE DATA
========================================= */

function getCarouselImages(gallery) {

    try {
        return JSON.parse(
            gallery.querySelector(".carousel-images")?.textContent || "[]"
        );
    } catch {
        return [];
    }
}

/* =========================================
   UPDATE CAROUSEL
========================================= */

function updateCarousel(gallery, index) {

    const images = getCarouselImages(gallery);

    const image = gallery.querySelector(".project-image");

    if (!images.length || !image) return;

    const activeIndex =
        (index + images.length) % images.length;

    gallery.dataset.activeSlide = String(activeIndex);

    image.src = images[activeIndex];

    const title =
        gallery.querySelector(".project-title")?.textContent.trim() ||
        "Project";

    image.alt = title;

    gallery.querySelectorAll(".carousel-dot").forEach(
        (dot, dotIndex) => {

            const active = dotIndex === activeIndex;

            dot.classList.toggle("is-active", active);

            dot.setAttribute(
                "aria-pressed",
                String(active)
            );
        }
    );
}

/* =========================================
   CAROUSEL BUTTON EVENTS
========================================= */

projectsList?.addEventListener("click", event => {

    const target = event.target;

    if (!(target instanceof Element)) return;

    const gallery = target.closest("[data-carousel]");

    if (!gallery) return;

    const currentIndex = Number(
        gallery.dataset.activeSlide || 0
    );

    if (target.closest(".carousel-prev")) {

        event.preventDefault();

        updateCarousel(gallery, currentIndex - 1);

        return;
    }

    if (target.closest(".carousel-next")) {

        event.preventDefault();

        updateCarousel(gallery, currentIndex + 1);

        return;
    }

    const dot = target.closest(".carousel-dot");

    if (dot) {

        event.preventDefault();

        updateCarousel(
            gallery,
            Number(dot.dataset.slide || 0)
        );
    }
});

/* =========================================
   MOBILE IMAGE SWIPE
========================================= */

let touchStartX = 0;
let touchStartY = 0;
let touchedGallery = null;

projectsList?.addEventListener("touchstart", event => {

    const target = event.target;

    if (!(target instanceof Element)) return;

    const gallery = target.closest("[data-carousel]");

    if (!gallery) return;

    touchedGallery = gallery;

    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;

}, { passive: true });

projectsList?.addEventListener("touchend", event => {

    if (!touchedGallery) return;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;

    if (
        Math.abs(deltaX) > 45 &&
        Math.abs(deltaX) > Math.abs(deltaY)
    ) {

        const currentIndex = Number(
            touchedGallery.dataset.activeSlide || 0
        );

        updateCarousel(
            touchedGallery,
            currentIndex + (deltaX < 0 ? 1 : -1)
        );
    }

    touchedGallery = null;

}, { passive: true });


/* =========================================
   LOAD PROJECT DATA
========================================= */

async function loadProjects() {

    try {

        const response = await fetch(PROJECTS_JSON_URL, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Could not load projects: HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "The projects JSON must contain an array."
            );
        }

        allProjects = data.filter(project =>
            project &&
            typeof project === "object" &&
            getProjectImages(project).length > 0
        );

        populateFilters();

        applyFilters();

    } catch (error) {

        console.error("Projects loading error:", error);

        if (projectsList) {
            projectsList.innerHTML = "";
        }

        if (projectsEmpty) {
            projectsEmpty.hidden = false;
            projectsEmpty.textContent =
                "Unable to load projects. Please check the JSON file.";
        }

        if (projectsPagination) {
            projectsPagination.innerHTML = "";
        }
    }
}

/* =========================================
   INITIALIZE
========================================= */

loadProjects();