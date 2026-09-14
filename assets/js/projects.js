/* =========================================================
   PROJECT SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       JSON FILE
    ===================================================== */

    const JSON_FILE = "./assets/js/projectsData.json";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const grid =
        document.getElementById("projectsGrid");

    const searchInput =
        document.getElementById("projectSearch");

    const typeFilter =
        document.getElementById("projectTypeFilter");

    const statusFilter =
        document.getElementById("projectStatusFilter");

    const locationFilter =
        document.getElementById("projectLocationFilter");

    const sortFilter =
        document.getElementById("projectSort");

    const clearFiltersButton =
        document.getElementById("clearProjectFilters");

    const previousButton =
        document.getElementById("previousProject");

    const nextButton =
        document.getElementById("nextProject");

    const counter =
        document.getElementById("projectCounter");

    const emptyState =
        document.getElementById("projectsEmpty");

    const pagination =
        document.getElementById("projectPagination");


    /* =====================================================
       STATE
    ===================================================== */

    let allProjects = [];

    let filteredProjects = [];

    let currentPage = 0;


    /*
     * Desktop = 8
     * Tablet  = 4
     * Mobile  = 1
     */
    let cardsPerPage =
        getCardsPerPage();


    /* =====================================================
       GET CARDS PER PAGE
    ===================================================== */

   /* =====================================================
   GET CARDS PER PAGE
===================================================== */

function getCardsPerPage() {

    /*
     * Mobile
     * 1 column × 4 rows
     */
    if (window.innerWidth <= 600) {
        return 6;
    }

    /*
     * Tablet
     * 2 columns × 4 rows
     */
    if (window.innerWidth <= 900) {
        return 8;
    }

    /*
     * Desktop
     * 4 columns × 2 rows
     */
    return 8;
}


    /* =====================================================
       NORMALIZE VALUE
       
       Handles:
       
       Under Construction
       under construction
       UNDER CONSTRUCTION
       Under Construction 
    ===================================================== */

    function normalizeValue(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    }


    /* =====================================================
       LOAD PROJECTS
    ===================================================== */

    async function loadProjects() {

        try {

            const response =
                await fetch(JSON_FILE);


            if (!response.ok) {

                throw new Error(
                    `HTTP error: ${response.status}`
                );

            }


            const data =
                await response.json();


            /*
             * JSON must be an array
             */
            if (!Array.isArray(data)) {

                throw new Error(
                    "projectsData.json must contain an array."
                );

            }


            /*
             * Save projects
             */
            allProjects = data;


            /*
             * Create dropdown options
             */
            populateFilters();


            /*
             * Initial render
             */
            applyFilters();


        } catch (error) {

            console.error(
                "Project loading error:",
                error
            );


            grid.innerHTML = `
                <div class="projects-loading">
                    Unable to load projects.
                </div>
            `;

        }

    }


    /* =====================================================
       POPULATE FILTERS
    ===================================================== */

    function populateFilters() {

        /*
         * Project Type
         */
        populateSelect(
            typeFilter,
            allProjects.map(
                project => project.projectType
            ),
            "All Types"
        );


        /*
         * Status
         */
        populateSelect(
            statusFilter,
            allProjects.map(
                project => project.status
            ),
            "All Status"
        );


        /*
         * Location
         */
        populateSelect(
            locationFilter,
            allProjects.map(
                project => project.projectLocation
            ),
            "All Locations"
        );

    }


    /* =====================================================
       POPULATE SELECT
    ===================================================== */

    function populateSelect(
        select,
        values,
        defaultText
    ) {

        if (!select) {
            return;
        }


        /*
         * Remove empty values
         * and duplicates
         */
        const uniqueValues =
            [
                ...new Set(
                    values
                        .filter(Boolean)
                        .map(
                            value =>
                                String(value).trim()
                        )
                )
            ];


        /*
         * Alphabetical order
         */
        uniqueValues.sort(
            (a, b) =>
                a.localeCompare(b)
        );


        /*
         * Clear old options
         */
        select.innerHTML = "";


        /*
         * Default option
         */
        const defaultOption =
            document.createElement("option");


        defaultOption.value = "";

        defaultOption.textContent =
            defaultText;


        select.appendChild(
            defaultOption
        );


        /*
         * Add options
         */
        uniqueValues.forEach(
            value => {

                const option =
                    document.createElement("option");


                option.value = value;

                option.textContent = value;


                select.appendChild(
                    option
                );

            }
        );

    }


    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    function applyFilters() {

        /*
         * Search
         */
        const searchValue =
            normalizeValue(
                searchInput.value
            );


        /*
         * Type
         */
        const selectedType =
            normalizeValue(
                typeFilter.value
            );


        /*
         * Status
         */
        const selectedStatus =
            normalizeValue(
                statusFilter.value
            );


        /*
         * Location
         */
        const selectedLocation =
            normalizeValue(
                locationFilter.value
            );


        /* =================================================
           FILTER PROJECTS
        ================================================= */

        filteredProjects =
            allProjects.filter(
                project => {


                    /* =====================================
                       SEARCH
                    ===================================== */

                    const searchableText = [

                        project.id,

                        project.projectNumber,

                        project.slug,

                        project.title,

                        project.projectType,

                        project.status,

                        project.projectLocation,

                        project.area,

                        project.city,

                        project.state,

                        project.country,

                        project.client,

                        project.consultant,

                        project.projectDescription,

                        project.fullAddress

                    ]
                        .filter(Boolean)
                        .map(
                            value =>
                                normalizeValue(value)
                        )
                        .join(" ");


                    const matchesSearch =
                        !searchValue ||
                        searchableText.includes(
                            searchValue
                        );


                    /* =====================================
                       TYPE
                    ===================================== */

                    const matchesType =
                        !selectedType ||
                        normalizeValue(
                            project.projectType
                        ) === selectedType;


                    /* =====================================
                       STATUS
                    ===================================== */

                    const matchesStatus =
                        !selectedStatus ||
                        normalizeValue(
                            project.status
                        ) === selectedStatus;


                    /* =====================================
                       LOCATION
                    ===================================== */

                    const matchesLocation =
                        !selectedLocation ||
                        normalizeValue(
                            project.projectLocation
                        ) === selectedLocation;


                    /*
                     * Project must satisfy
                     * all selected filters.
                     */
                    return (
                        matchesSearch &&
                        matchesType &&
                        matchesStatus &&
                        matchesLocation
                    );

                }
            );


        /* =================================================
           SORT
        ================================================= */

        sortProjects();


        /* =================================================
           RESET TO FIRST PAGE
        ================================================= */

        currentPage = 0;


        /*
         * Recalculate responsive
         * card count.
         */
        cardsPerPage =
            getCardsPerPage();


        /* =================================================
           RENDER
        ================================================= */

        renderProjects();

    }


    /* =====================================================
       SORT PROJECTS
    ===================================================== */

    function sortProjects() {

        const sortValue =
            sortFilter.value;


        filteredProjects.sort(
            (a, b) => {

                switch (sortValue) {


                    /* ==================================
                       LATEST
                    ================================== */

                    case "latest":

                    case "number-desc":

                        return (
                            Number(
                                b.projectNumber ||
                                b.id ||
                                0
                            ) -
                            Number(
                                a.projectNumber ||
                                a.id ||
                                0
                            )
                        );


                    /* ==================================
                       OLDEST
                    ================================== */

                    case "oldest":

                    case "number-asc":

                        return (
                            Number(
                                a.projectNumber ||
                                a.id ||
                                0
                            ) -
                            Number(
                                b.projectNumber ||
                                b.id ||
                                0
                            )
                        );


                    /* ==================================
                       NAME A-Z
                    ================================== */

                    case "title-asc":

                        return String(
                            a.title || ""
                        ).localeCompare(
                            String(
                                b.title || ""
                            )
                        );


                    /* ==================================
                       NAME Z-A
                    ================================== */

                    case "title-desc":

                        return String(
                            b.title || ""
                        ).localeCompare(
                            String(
                                a.title || ""
                            )
                        );


                    /* ==================================
                       DEFAULT
                    ================================== */

                    default:

                        return (
                            Number(
                                b.projectNumber ||
                                b.id ||
                                0
                            ) -
                            Number(
                                a.projectNumber ||
                                a.id ||
                                0
                            )
                        );

                }

            }
        );

    }


    /* =====================================================
       RENDER PROJECTS
    ===================================================== */

    function renderProjects() {

        /*
         * Hide empty state
         */
        emptyState.classList.remove(
            "show"
        );


        /* =================================================
           NO RESULTS
        ================================================= */

        if (
            filteredProjects.length === 0
        ) {

            grid.innerHTML = "";


            emptyState.classList.add(
                "show"
            );


            updateCounter();

            createPaginationDots();

            updateNavigation();


            return;
        }


        /* =================================================
           TOTAL PAGES
        ================================================= */

        const totalPages =
            Math.ceil(
                filteredProjects.length /
                cardsPerPage
            );


        /*
         * Safety
         */
        if (
            currentPage >= totalPages
        ) {

            currentPage =
                Math.max(
                    0,
                    totalPages - 1
                );

        }


        /* =================================================
           START / END
        ================================================= */

        const start =
            currentPage *
            cardsPerPage;


        const end =
            start +
            cardsPerPage;


        /* =================================================
           CURRENT PROJECTS
        ================================================= */

        const visibleProjects =
            filteredProjects.slice(
                start,
                end
            );


        /* =================================================
           CREATE CARDS
        ================================================= */

        grid.innerHTML =
            visibleProjects
                .map(
                    (project, index) =>
                        createProjectCard(
                            project,
                            index
                        )
                )
                .join("");


        /* =================================================
           UPDATE LEFT SIDE
        ================================================= */

        updateCounter();

        createPaginationDots();

        updateNavigation();

    }


    /* =====================================================
       CREATE PROJECT CARD
    ===================================================== */

    function createProjectCard(
        project,
        index
    ) {

        /* =================================================
           STATUS
        ================================================= */

        const status =
            normalizeValue(
                project.status
            );


        const isCompleted =
            status === "completed";


        const isOngoing =
            status === "ongoing" ||
            status === "under construction" ||
            status === "underconstruction" ||
            status === "in progress" ||
            status === "inprogress";


        /* =================================================
           BADGE
        ================================================= */

        let badgeHTML = "";


        if (isCompleted) {

            badgeHTML = `
                <span class="project-badge completed-badge">
                    Completed
                </span>
            `;

        }
            else if (isOngoing) {

                badgeHTML = `
                    <span class="project-badge ongoing-badge">
                        Under Construction
                    </span>
                `;

            }
            else if (project.status) {

                badgeHTML = `
                    <span class="project-badge ongoing-badge">
                        ${escapeHTML(
                            project.status
                        )}
                    </span>
                `;

            }


        /* =================================================
           BOTTOM STATUS
        ================================================= */

        let bottomHTML = "";


        if (isCompleted) {

            bottomHTML = `
                <span class="project-status completed">
                    Completed
                </span>
            `;

        }
        else if (isOngoing) {

            bottomHTML = `
                <span class="project-status ongoing-text">
                    Under Construction
                </span>
            `;

        }
        else {

            bottomHTML = `
                <span class="project-status">
                    ${escapeHTML(
                        project.status || ""
                    )}
                </span>
            `;

        }


        /* =================================================
           IMAGE
        ================================================= */

        const image =
            project.image ||
            "assets/images/projects_img/default.jpg";


        /* =================================================
           TITLE
        ================================================= */

        const title =
            project.title ||
            "Untitled Project";


        /* =================================================
           TYPE
        ================================================= */

        const projectType =
            project.projectType ||
            "Project";


        /* =================================================
           PROJECT NUMBER
        ================================================= */

        const projectNumber =
            project.projectNumber ||
            project.id ||
            "";


        /* =================================================
           LOCATION
        ================================================= */

        const location =
            project.projectLocation ||
            project.area ||
            project.city ||
            project.state ||
            "Dubai";


        /* =================================================
           STATE
        ================================================= */

        const state =
            project.state ||
            "Dubai";


        /* =================================================
           BUILDING TITLE
        ================================================= */

        const buildingTitle =
            getBuildingTitle(
                project
            );


        /* =================================================
           RETURN CARD
        ================================================= */

        return `

            <article
                class="project-card ${
                    index === 0
                        ? "featured"
                        : ""
                }"
                data-project-id="${escapeHTML(
                    String(
                        project.id || ""
                    )
                )}"
            >

                <!-- =====================================
                     PROJECT IMAGE
                ====================================== -->

                <div class="project-image">

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(title)}"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.src='assets/images/projects_img/default.jpg';
                        "
                    >


                    ${
                        index === 0
                            ? `
                                <span class="project-badge featured-badge">
                                    Featured
                                </span>
                              `
                            : badgeHTML
                    }

                </div>


                <!-- =====================================
                     CARD CONTENT
                ====================================== -->

                <div class="project-card-content">


                    <!-- BUILDING ICON -->

                    <div class="project-icon">

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <path
                                d="M5 21V7l7-4 7 4v14"
                            ></path>

                            <path
                                d="M9 21v-4h6v4"
                            ></path>

                            <path
                                d="M9 9h1"
                            ></path>

                            <path
                                d="M14 9h1"
                            ></path>

                            <path
                                d="M9 12h1"
                            ></path>

                            <path
                                d="M14 12h1"
                            ></path>

                        </svg>

                    </div>


                    <!-- =================================
                         HEADING
                    ================================== -->

                    <div class="project-heading">

                        <h3>
                            ${escapeHTML(
                                buildingTitle
                            )}
                        </h3>

                        <h4>
                            ${escapeHTML(
                                projectType
                            )}
                            Building
                        </h4>

                    </div>


                    <!-- =================================
                         PROJECT NUMBER
                    ================================== -->

                    <p class="project-number">

                        Project No.
                        ${escapeHTML(
                            String(
                                projectNumber
                            )
                        )}

                    </p>


                    <!-- =================================
                         LOCATION
                    ================================== -->

                    <div class="project-location">

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >

                            <path
                                d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
                            ></path>

                            <circle
                                cx="12"
                                cy="9"
                                r="2"
                            ></circle>

                        </svg>


                        <span>

                            ${escapeHTML(
                                location
                            )}

                            ${
                                state
                                    ? `, ${escapeHTML(state)}`
                                    : ""
                            }

                        </span>

                    </div>


                    <!-- =================================
                         BOTTOM
                    ================================== -->

                    <div class="project-bottom">

                        ${bottomHTML}


                        <!-- PROJECT DETAILS -->

                        <button
                            type="button"
                            class="project-arrow"
                            data-project-slug="${escapeHTML(
                                project.slug || ""
                            )}"
                            aria-label="View ${escapeHTML(
                                title
                            )}"
                        >
                            →
                        </button>

                    </div>

                </div>

            </article>

        `;

    }


    /* =====================================================
       BUILDING TITLE
    ===================================================== */

    function getBuildingTitle(
        project
    ) {

        /*
         * If JSON contains:
         *
         * buildingConfiguration
         *
         * it will be shown.
         *
         * Otherwise project title.
         */

        return (
            project.buildingConfiguration ||
            project.buildingType ||
            project.title ||
            "Project"
        );

    }


    /* =====================================================
       UPDATE COUNTER
    ===================================================== */

    function updateCounter() {

        if (
            filteredProjects.length === 0
        ) {

            counter.textContent =
                "00";

            return;
        }


        /*
         * Page number
         */
        const pageNumber =
            currentPage + 1;


        counter.textContent =
            String(
                pageNumber
            ).padStart(
                2,
                "0"
            );

    }


    /* =====================================================
       CREATE PAGINATION DOTS
       
       MAXIMUM 4 DOTS
    ===================================================== */

    function createPaginationDots() {

        if (!pagination) {
            return;
        }


        /*
         * Clear existing dots
         */
        pagination.innerHTML = "";


        const totalPages =
            Math.ceil(
                filteredProjects.length /
                cardsPerPage
            );


        /*
         * No pagination
         */
        if (
            totalPages <= 1
        ) {

            return;
        }


        /*
         * Maximum 4 circles
         */
        const dotCount =
            Math.min(
                4,
                totalPages
            );


        /*
         * Dynamic active dot
         */
        const activeDot =
            currentPage %
            dotCount;


        /*
         * Create dots
         */
        for (
            let i = 0;
            i < dotCount;
            i++
        ) {

            const dot =
                document.createElement(
                    "span"
                );


            dot.className =
                "line-dot";


            /*
             * Highlight current circle
             */
            if (
                i === activeDot
            ) {

                dot.classList.add(
                    "active"
                );

            }


            dot.setAttribute(
                "aria-hidden",
                "true"
            );


            pagination.appendChild(
                dot
            );

        }

    }


    /* =====================================================
       UPDATE NAVIGATION
    ===================================================== */

    function updateNavigation() {

        const totalPages =
            Math.ceil(
                filteredProjects.length /
                cardsPerPage
            );


        /* =================================================
           PREVIOUS BUTTON
        ================================================= */

        previousButton.disabled =
            currentPage <= 0;


        /* =================================================
           NEXT BUTTON
        ================================================= */

        nextButton.disabled =
            currentPage >=
            totalPages - 1;


        /* =================================================
           PREVIOUS ACTIVE
        ================================================= */

        previousButton.classList.toggle(
            "active",
            currentPage > 0
        );


        /* =================================================
           NEXT ACTIVE
        ================================================= */

        nextButton.classList.toggle(
            "active",
            currentPage <
                totalPages - 1
        );


        /* =================================================
           UPDATE ACTIVE DOT
        ================================================= */

        const dots =
            document.querySelectorAll(
                ".line-dot"
            );


        if (
            dots.length === 0
        ) {

            return;
        }


        const activeDot =
            currentPage %
            dots.length;


        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === activeDot
                );

            }
        );

    }


    /* =====================================================
       NEXT PAGE
    ===================================================== */

    function nextProjects() {

        const totalPages =
            Math.ceil(
                filteredProjects.length /
                cardsPerPage
            );


        if (
            currentPage <
            totalPages - 1
        ) {

            currentPage++;


            renderProjects();


            scrollProjectsToTop();

        }

    }


    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    function previousProjects() {

        if (
            currentPage > 0
        ) {

            currentPage--;


            renderProjects();


            scrollProjectsToTop();

        }

    }


    /* =====================================================
       SCROLL TO PROJECTS
    ===================================================== */

    function scrollProjectsToTop() {

        /*
         * Desktop doesn't need scrolling.
         */
        if (
            window.innerWidth > 900
        ) {

            return;

        }


        setTimeout(
            () => {

                const section =
                    document.querySelector(
                        ".projects-section"
                    );


                if (!section) {
                    return;
                }


                section.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            50
        );

    }


    /* =====================================================
       CLEAR ALL FILTERS
    ===================================================== */

    function clearAllFilters() {

        /*
         * Clear search
         */
        searchInput.value = "";


        /*
         * Reset type
         */
        typeFilter.value = "";


        /*
         * Reset status
         */
        statusFilter.value = "";


        /*
         * Reset location
         */
        locationFilter.value = "";


        /*
         * Reset sorting
         */
        sortFilter.value = "latest";


        /*
         * Go back to page 1
         */
        currentPage = 0;


        /*
         * Restore responsive
         * card count
         */
        cardsPerPage =
            getCardsPerPage();


        /*
         * Apply filters again
         */
        applyFilters();

    }


    /* =====================================================
       SEARCH EVENT
    ===================================================== */

    searchInput.addEventListener(
        "input",
        debounce(
            applyFilters,
            200
        )
    );


    /* =====================================================
       TYPE FILTER EVENT
    ===================================================== */

    typeFilter.addEventListener(
        "change",
        applyFilters
    );


    /* =====================================================
       STATUS FILTER EVENT
    ===================================================== */

    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    /* =====================================================
       LOCATION FILTER EVENT
    ===================================================== */

    locationFilter.addEventListener(
        "change",
        applyFilters
    );


    /* =====================================================
       SORT EVENT
    ===================================================== */

    sortFilter.addEventListener(
        "change",
        applyFilters
    );


    /* =====================================================
       NEXT BUTTON
    ===================================================== */

    nextButton.addEventListener(
        "click",
        nextProjects
    );


    /* =====================================================
       PREVIOUS BUTTON
    ===================================================== */

    previousButton.addEventListener(
        "click",
        previousProjects
    );


    /* =====================================================
       CLEAR FILTER BUTTON
    ===================================================== */

    clearFiltersButton.addEventListener(
        "click",
        clearAllFilters
    );


    /* =====================================================
       PROJECT DETAILS
    ===================================================== */

    grid.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".project-arrow"
                );


            if (!button) {
                return;
            }


            const slug =
                button.dataset.projectSlug;


            if (!slug) {
                return;
            }


            /*
             * Open project details
             */
            window.location.href =
                `project-details.html?slug=${encodeURIComponent(
                    slug
                )}`;

        }
    );


    /* =====================================================
       RESPONSIVE
    ===================================================== */

    window.addEventListener(
        "resize",
        debounce(
            () => {

                const newCardsPerPage =
                    getCardsPerPage();


                /*
                 * If card count changes,
                 * reset to first page.
                 */
                if (
                    newCardsPerPage !==
                    cardsPerPage
                ) {

                    cardsPerPage =
                        newCardsPerPage;


                    currentPage = 0;


                    renderProjects();

                }

            },
            200
        )
    );


    /* =====================================================
       DEBOUNCE
    ===================================================== */

    function debounce(
        functionToRun,
        delay
    ) {

        let timeout;


        return function (...args) {

            clearTimeout(
                timeout
            );


            timeout =
                setTimeout(
                    () => {

                        functionToRun.apply(
                            this,
                            args
                        );

                    },
                    delay
                );

        };

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       START
    ===================================================== */

    loadProjects();

});