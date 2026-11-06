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
   HOVER DETAILS PANEL
========================================= */

const HOVER_ICONS = {
    building: '<path d="M3 21h18M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M10 7h1m3 0h1M10 11h1m3 0h1M10 15h1m3 0h1M11 21v-3h2v3"/>',
    client: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    consultant: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    location: '<path d="M20 10c0 7-8 12-8 12S4 17 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    coins: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'
};

function iconSVG(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${HOVER_ICONS[name]}</svg>`;
}

function getProjectValue(project) {
    return String(
        project.projectValue ?? project.value ?? project.contractValue ?? ""
    ).replace(/^\s*AED\s*/i, "").trim();
}

function getComprises(project) {

    const key = Object.keys(project).find(name =>
        /compris|buildings|components|scope/i.test(name) &&
        project[name] &&
        typeof project[name] !== "boolean"
    );

    const raw = key ? project[key] : [];

    const list = Array.isArray(raw)
        ? raw
        : typeof raw === "object"
            ? Object.values(raw)
            : String(raw).split(/[,;\n]/);

    return list
        .map(item => {
            if (typeof item !== "object" || item === null) {
                return String(item);
            }

            const title =
                item.title ?? item.name ?? item.label ?? item.text ?? "";

            const count = item.count ?? item.number ?? item.qty ?? "";

            return `${count} ${title}`.trim();
        })
        .map(item => item.trim())
        .filter(Boolean)
        .slice(0, 4);
}

function hoverRow(icon, label, value, index) {
    if (!value) return "";

    return `
        <div class="hp-row" style="--i:${index}">
            <span class="hp-icon">${iconSVG(icon)}</span>
            <span class="hp-text">
                <small>${label}</small>
                <strong>${escapeHTML(value)}</strong>
            </span>
        </div>
    `;
}

function hoverPanelHTML(project) {

    const value = getProjectValue(project);
    const numeric = Number(value.replace(/[^\d.]/g, ""));
    const comprises = getComprises(project);

    const location =
        project.projectLocation || project.area || "";

    const detailsURL =
        `project-details.html?slug=${encodeURIComponent(getProjectSlug(project))}`;

    return `
        <div class="project-hover-panel">

            <span class="hp-glow" aria-hidden="true"></span>

            <div class="hp-head" style="--i:0">
                <div class="hp-type">
                    <span>${escapeHTML(project.projectType || "Project")}</span>
                    <i></i>
                </div>

                <h3 class="hp-title">
                    ${escapeHTML(project.title || "Project")}
                </h3>
            </div>

            ${
                value
                    ? `
                        <div class="hp-value" style="--i:1">
                            <span class="hp-value-icon">${iconSVG("coins")}</span>
                            <small>Project Value</small>
                            <strong>
                                <em>AED</em>
                                <b
                                    class="hp-value-num"
                                    ${numeric > 0 ? `data-target="${numeric}"` : ""}
                                >${escapeHTML(value)}</b>
                            </strong>
                        </div>
                    `
                    : ""
            }

            ${
                comprises.length
                    ? `
                        <div class="hp-comprises" style="--i:2">
                            <div class="hp-type">
                                <span>Project Comprises Of</span>
                                <i></i>
                            </div>

                            <div class="hp-timeline">
                                <svg
                                    class="hp-wave"
                                    viewBox="0 0 400 40"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        id="wave-${escapeHTML(getProjectSlug(project))}"
                                        d="M0 22 C 50 4, 100 4, 150 20 S 250 36, 300 18 S 370 8, 400 20"
                                    />
                                    <circle r="4" class="hp-orb">
                                        <animateMotion
                                            dur="6s"
                                            repeatCount="indefinite"
                                            path="M0 22 C 50 4, 100 4, 150 20 S 250 36, 300 18 S 370 8, 400 20"
                                        />
                                    </circle>
                                </svg>

                                ${comprises.map(item => `
                                    <div class="hp-node">
                                        <span class="hp-node-icon">${iconSVG("building")}</span>
                                        <span class="hp-node-label">${escapeHTML(item)}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </div>
                    `
                    : ""
            }

            <div class="hp-grid">
                ${hoverRow("client", "Client", project.client, 3)}
                ${hoverRow("consultant", "Consultant", project.consultant, 4)}
            </div>

            <div class="hp-footer" style="--i:5">
                ${
                    location
                        ? `
                            <span class="hp-icon">${iconSVG("location")}</span>
                            <span class="hp-text">
                                <small>Location</small>
                                <strong>${escapeHTML(location)}</strong>
                            </span>
                        `
                        : "<span></span>"
                }

                <a
                    href="${detailsURL}"
                    class="project-details-btn"
                    aria-label="View details for ${escapeHTML(project.title)}"
                >
                    Details
                    <span aria-hidden="true">&#8594;</span>
                </a>
            </div>

        </div>
    `;
}

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
    const projectNumber = escapeHTML(getProjectNumber(project));

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

            ${hoverPanelHTML(project)}

            <div class="project-info">

                <span class="project-number">
                    PROJECT ${projectNumber}
                </span>

                <h2 class="project-title">
                    ${title}
                </h2>

                <a
                    href="project-details.html?slug=${encodeURIComponent(getProjectSlug(project))}"
                    class="project-details-btn"
                    aria-label="View details for ${title}"
                >
                    View Details
                    <span aria-hidden="true">&#8594;</span>
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
   PROJECT VALUE COUNT-UP ON HOVER
========================================= */

function countUp(element) {

    const target = Number(element.dataset.target);

    if (!target) return;

    const finalText = element.textContent;
    const duration = 1100;
    const startTime = performance.now();

    function frame(now) {

        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent =
            progress < 1
                ? Math.round(target * eased).toLocaleString("en-US")
                : finalText;

        if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
}

projectsList?.addEventListener("mouseenter", event => {

    const gallery = event.target;

    if (!(gallery instanceof Element) || !gallery.matches("[data-carousel]")) {
        return;
    }

    gallery.querySelectorAll(".hp-value-num[data-target]").forEach(countUp);

}, true);


/* =========================================
   CURSOR-FOLLOWING GLOW ON THE INFO PANEL
========================================= */

const glowState = new WeakMap();
const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function tickGlow(panel) {

    const state = glowState.get(panel);

    if (!state) return;

    state.x += (state.tx - state.x) * 0.14;
    state.y += (state.ty - state.y) * 0.14;

    panel.style.setProperty("--mx", `${state.x.toFixed(1)}px`);
    panel.style.setProperty("--my", `${state.y.toFixed(1)}px`);

    if (
        Math.abs(state.tx - state.x) > 0.4 ||
        Math.abs(state.ty - state.y) > 0.4
    ) {
        state.raf = requestAnimationFrame(() => tickGlow(panel));
    } else {
        state.raf = 0;
    }
}

projectsList?.addEventListener("mousemove", event => {

    const target = event.target;

    if (!(target instanceof Element)) return;

    const panel = target.closest(".project-hover-panel");

    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let state = glowState.get(panel);

    if (!state) {
        state = { x, y, tx: x, ty: y, raf: 0 };
        glowState.set(panel, state);
    }

    state.tx = x;
    state.ty = y;

    if (reduceMotion) {
        state.x = x;
        state.y = y;
        panel.style.setProperty("--mx", `${x}px`);
        panel.style.setProperty("--my", `${y}px`);
    } else if (!state.raf) {
        state.raf = requestAnimationFrame(() => tickGlow(panel));
    }

    // spotlight on the individual card under the cursor
    const card = target.closest(".hp-row, .hp-footer, .hp-value");

    if (card) {
        const cardRect = card.getBoundingClientRect();

        card.style.setProperty("--lx", `${event.clientX - cardRect.left}px`);
        card.style.setProperty("--ly", `${event.clientY - cardRect.top}px`);
    }
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