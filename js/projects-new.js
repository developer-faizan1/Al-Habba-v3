/* =========================================
   AL HABBAI CONTRACTING
   CAROUSEL CARD - ONE SLIDE PER IMAGE
   The "image" field can be a single string OR an array of strings.
   Every image is its own slide, so all images use the same interval.
   (the "images" array is ignored)
========================================= */

const PROJECTS_JSON_URL = "./projectsData.json";
const AUTOPLAY_INTERVAL = 6000; // ms each project slide stays on screen

/* =========================================
   DOM ELEMENTS
========================================= */

const projectsList = document.getElementById("projectsList");
const projectTypeFilter = document.getElementById("projectTypeFilter");
const statusButtons = [...document.querySelectorAll(".projects-toolbar .status-btn")];
let activeStatus = ""; // "", "Running" or "Completed"
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

/* "image" can be a single string OR an array of strings.
   Always return a clean array. */
function getProjectImages(project) {
    const raw = project.image;
    const list = Array.isArray(raw) ? raw : [raw];

    return list
        .map(src => String(src ?? "").trim())
        .filter(Boolean);
}

/* First image (used to skip projects that have no image at all) */
function getProjectImage(project) {
    return getProjectImages(project)[0] || "";
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
        january: 0, february: 1, march: 2, april: 3,
        may: 4, june: 5, july: 6, august: 7,
        september: 8, october: 9, november: 10, december: 11
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
   SLIDE (one project = one slide)
   Images are 1500 x 758 - shown fully, never cropped
========================================= */

const IMG_WIDTH = 1500;
const IMG_HEIGHT = 758;

function statusChipHTML(project) {

    const status = getStatusConfig(project.status);

    return `
        <div class="project-status status-${status.toLowerCase()}">
            ${status}
        </div>
    `;
}

function slideHTML(project, index, imageSrc) {

    const title = escapeHTML(project.title || "Project");
    // "096", "P-096" or "Project 096" all become "096" so we can show "P-096"
    const numberLabel = escapeHTML(
        String(getProjectNumber(project))
            .trim()
            .replace(/^(?:project[\s-]*|p[-\s]+)/i, "")
    );
    const projectType = escapeHTML(project.projectType || "");
    const location = escapeHTML(project.projectLocation || project.area || "");

    return `
        <div class="pc-slide">

            <img
                class="pc-image"
                src="${escapeHTML(imageSrc)}"
                alt="${title}"
                width="${IMG_WIDTH}"
                height="${IMG_HEIGHT}"
                loading="${index === 0 ? "eager" : "lazy"}"
                decoding="async"
                draggable="false"
            >

            ${statusChipHTML(project)}

            <!-- bottom-left: project info -->
            <div class="pc-info">
                <div class="pc-meta">
                    ${numberLabel ? `<span class="pc-number">P-${numberLabel}</span>` : ""}
                    ${numberLabel && projectType ? `<span class="pc-line" aria-hidden="true"></span>` : ""}
                    ${projectType ? `<span class="pc-type">${projectType}</span>` : ""}
                </div>
                <h2 class="pc-title">${title}</h2>
                ${location ? `
                    <p class="pc-location">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                        <span>${location}</span>
                    </p>
                ` : ""}
            </div>

            <!-- bottom-right: details button -->
            <div class="pc-controls">
                <a
                    href="project-details.html?slug=${encodeURIComponent(getProjectSlug(project))}"
                    class="pc-details-btn"
                    aria-label="View details for ${title}"
                >
                    <span>View Details</span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </a>
            </div>

        </div>
    `;
}

/* Every image becomes its own slide, so each one stays on screen
   for exactly AUTOPLAY_INTERVAL (same time for all images). */
function buildSlides(projects) {
    return projects.flatMap(project =>
        getProjectImages(project).map(src => ({ project, src }))
    );
}

function carouselHTML(projects) {

    const slides = buildSlides(projects);
    const multiple = slides.length > 1;

    return `
        <article class="project-card">
            <div class="pc-gallery">

                <div class="owl-carousel pc-owl" data-multiple="${multiple}">
                    ${slides.map((s, index) => slideHTML(s.project, index, s.src)).join("")}
                </div>

                ${multiple ? `
                    <button type="button" class="pc-arrow pc-side-arrow pc-prev" aria-label="Previous project">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button type="button" class="pc-arrow pc-side-arrow pc-next" aria-label="Next project">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                ` : ""}

            </div>
        </article>
    `;
}

/* =========================================
   INIT OWL CAROUSEL
========================================= */

function initCarousel() {

    if (!window.jQuery || !jQuery.fn.owlCarousel) {
        console.error("Owl Carousel / jQuery not loaded.");
        return;
    }

    const el = projectsList.querySelector(".pc-owl");
    if (!el) return;

    const $owl = jQuery(el);
    const multiple = el.dataset.multiple === "true";

    $owl.owlCarousel({
        items: 1,
        loop: multiple,
        nav: false,
        dots: false,
        mouseDrag: multiple,
        touchDrag: multiple,
        pullDrag: false,
        margin: 0,
        smartSpeed: 900,
        autoplay: multiple,
        autoplayTimeout: AUTOPLAY_INTERVAL,
        autoplayHoverPause: false,
        animateOut: "pcFadeOut",
        animateIn: "pcFadeIn"
    });

    const gallery = el.closest(".pc-gallery");

    gallery.querySelector(".pc-prev")?.addEventListener("click", () => {
        $owl.trigger("prev.owl.carousel", [700]);
    });

    gallery.querySelector(".pc-next")?.addEventListener("click", () => {
        $owl.trigger("next.owl.carousel", [700]);
    });
}

/* =========================================
   SEARCH, FILTER AND SORT
========================================= */

function applyFilters() {

    const type = normalizeText(projectTypeFilter?.value);
    const status = normalizeText(activeStatus);
    const location = normalizeText(projectLocationFilter?.value);

    filteredProjects = allProjects.filter(project => {


        const projectStatus = normalizeText(
            getStatusConfig(project.status)
        );

        const projectLocation = normalizeText(
            project.projectLocation || project.area
        );

        return (
            (!type || normalizeText(project.projectType) === type) &&
            (!status || projectStatus === status) &&
            (!location || projectLocation === location)
        );
    });

    applySorting();

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
   RENDER (one card, all projects inside)
========================================= */

function renderProjects() {

    if (!projectsList) return;

    // remove the previous carousels cleanly before re-rendering
    const oldOwl = projectsList.querySelector(".pc-owl");
    if (oldOwl && window.jQuery) {
        jQuery(oldOwl).trigger("destroy.owl.carousel");
    }

    projectsList.innerHTML = filteredProjects.length
        ? carouselHTML(filteredProjects)
        : "";

    if (projectsEmpty) {
        projectsEmpty.hidden = filteredProjects.length !== 0;
    }

    projectsList.style.display =
        filteredProjects.length ? "" : "none";

    // no pagination needed - everything is inside the carousel
    if (projectsPagination) {
        projectsPagination.innerHTML = "";
    }

    initCarousel();
}

/* =========================================
   RESET FILTERS
========================================= */

function resetFilters() {

    if (projectTypeFilter) projectTypeFilter.value = "";
    setActiveStatus("");
    if (projectLocationFilter) projectLocationFilter.value = "";

    if (projectSort) {
        projectSort.value = "default";
    }

    applyFilters();
}

clearFilters?.addEventListener("click", resetFilters);

emptyClearFilters?.addEventListener("click", resetFilters);

/* =========================================
   STATUS TOGGLE BUTTONS (Running / Completed)
   Click the active one again to show all.
========================================= */

function setActiveStatus(value) {
    activeStatus = value;

    statusButtons.forEach(btn => {
        const on = btn.dataset.status === value;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-pressed", String(on));
    });

}

statusButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const value = btn.dataset.status;
        setActiveStatus(activeStatus === value ? "" : value);
        applyFilters();
    });
});

/* =========================================
   FILTER EVENTS
========================================= */

[
    projectTypeFilter,
    projectLocationFilter,
    projectSort
]
    .filter(Boolean)
    .forEach(control => {

        control.addEventListener("change", applyFilters);

    });

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
            getProjectImage(project)
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