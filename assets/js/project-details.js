const params = new URLSearchParams(window.location.search);
const projectSlug = params.get("slug");

console.log("Project Slug:", projectSlug);


// =====================================================
// Helper Function
// =====================================================

const setText = (element, value, fallback = "Not Available") => {
  if (!element) return;

  element.textContent =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
      ? value
      : fallback;
};


// =====================================================
// Fetch Project Data
// =====================================================

fetch("./assets/js/projectsData.json")

  .then((response) => {

    if (!response.ok) {
      throw new Error(
        "Failed to load projectsData.json"
      );
    }

    return response.json();
  })

  .then((projects) => {

    // =================================================
    // Find Project
    // =================================================

    const project = projects.find(
      (item) => item.slug === projectSlug
    );


    if (!project) {

      console.error(
        "Project not found:",
        projectSlug
      );

      return;
    }


    console.log("Project:", project);


    // =================================================
    // Select HTML Elements
    // =================================================

    // Hero image
    const projectHeroImage =
      document.getElementById("projectHeroImage");


    // Gallery main image
    const projectImage =
      document.getElementById("projectImage");


    // Gallery thumbnails
    const projectThumbnails =
      document.getElementById("projectThumbnails");


    // Project information
    const projectNumber =
      document.getElementById("projectNumber");

    const projectTitle =
      document.getElementById("projectTitle");

    const projectSlugElement =
      document.getElementById("projectSlug");

    const projectValue =
      document.getElementById("projectValue");

    const projectClient =
      document.getElementById("projectClient");

    const projectConsultant =
      document.getElementById("projectConsultant");

    const projectStartDate =
      document.getElementById("projectStartDate");

    const projectCompletionDate =
      document.getElementById("projectCompletionDate");

    const projectStatus =
      document.getElementById("projectStatus");

    const projectType =
      document.getElementById("projectType");

    const projectAddress =
      document.getElementById("projectAddress");

    const projectAddressTwo =
      document.getElementById("projectAddressTwo");

    const projectArea =
      document.getElementById("projectArea");

    const projectCity =
      document.getElementById("projectCity");

    const projectState =
      document.getElementById("projectState");

    const projectCountry =
      document.getElementById("projectCountry");


    // =================================================
    // Default Image
    // =================================================

    const defaultImage =
      "assets/images/default.jpg";


    // =================================================
    // HERO IMAGE
    // =================================================

    if (projectHeroImage) {

      projectHeroImage.src =
        project.image || defaultImage;

      projectHeroImage.alt =
        project.title || "Project Image";

    }


    // =================================================
    // GET GALLERY IMAGES
    // =================================================

    let projectImages = [];


    if (
      Array.isArray(project.images) &&
      project.images.length > 0
    ) {

      // Use images array
      projectImages =
        project.images;

    } else if (project.image) {

      // Fallback to main image
      projectImages = [
        project.image
      ];

    } else {

      // No image
      projectImages = [
        defaultImage
      ];

    }


    console.log(
      "Project Images:",
      projectImages
    );


    // =================================================
    // GALLERY MAIN IMAGE
    // =================================================

    if (
      projectImage &&
      projectImages.length > 0
    ) {

      projectImage.src =
        projectImages[0];

      projectImage.alt =
        project.title || "Project Image";


      console.log(
        "Gallery Main Image:",
        projectImages[0]
      );

    }


    // =================================================
    // CREATE THUMBNAILS
    // =================================================

    if (projectThumbnails) {

      // Remove old thumbnails
      projectThumbnails.innerHTML = "";


      projectImages.forEach(
        (image, index) => {

          // =========================================
          // Create Button
          // =========================================

          const thumbnailButton =
            document.createElement("button");


          thumbnailButton.type =
            "button";


          thumbnailButton.className =
            "project-thumbnail";


          // =========================================
          // First Thumbnail Active
          // =========================================

          if (index === 0) {

            thumbnailButton.classList.add(
              "active"
            );

          }


          // =========================================
          // Create Thumbnail Image
          // =========================================

          const thumbnailImage =
            document.createElement("img");


          thumbnailImage.src =
            image;


          thumbnailImage.alt =
            `${project.title || "Project"} Image ${index + 1}`;


          thumbnailImage.loading =
            "lazy";


          // =========================================
          // Add Image To Button
          // =========================================

          thumbnailButton.appendChild(
            thumbnailImage
          );


          // =========================================
          // Thumbnail Click
          // =========================================

          thumbnailButton.addEventListener(
            "click",
            () => {

              // -------------------------------------
              // Change Gallery Main Image
              // -------------------------------------

              if (projectImage) {

                projectImage.src =
                  image;

                projectImage.alt =
                  `${project.title || "Project"} Image ${index + 1}`;

              }


              // -------------------------------------
              // Remove Active Class
              // -------------------------------------

              const allThumbnails =
                projectThumbnails.querySelectorAll(
                  ".project-thumbnail"
                );


              allThumbnails.forEach(
                (thumbnail) => {

                  thumbnail.classList.remove(
                    "active"
                  );

                }
              );


              // -------------------------------------
              // Add Active Class
              // -------------------------------------

              thumbnailButton.classList.add(
                "active"
              );


              console.log(
                "Gallery image changed to:",
                image
              );

            }
          );


          // =========================================
          // Add Thumbnail To Container
          // =========================================

          projectThumbnails.appendChild(
            thumbnailButton
          );

        }
      );

    }


    // =================================================
    // PROJECT INFORMATION
    // =================================================

    setText(
      projectNumber,
      project.projectNumber
        ? `Project - ${project.projectNumber}`
        : null
    );


    // =================================================
    // Title
    // =================================================

    setText(
      projectTitle,
      project.title
    );


    // =================================================
    // Slug
    // =================================================

    setText(
      projectSlugElement,
      project.slug
    );


    // =================================================
    // Project Value
    // =================================================

    setText(
      projectValue,
      project.projectValue
    );


    // =================================================
    // Client
    // =================================================

    setText(
      projectClient,
      project.client
    );


    // =================================================
    // Consultant
    // =================================================

    setText(
      projectConsultant,
      project.consultant
    );


    // =================================================
    // Start Date
    // =================================================

    setText(
      projectStartDate,
      project.startDate
    );


    // =================================================
    // Completion Date
    // =================================================

    setText(
      projectCompletionDate,
      project.completionDate
    );


    // =================================================
    // Status
    // =================================================

    setText(
      projectStatus,
      project.status
    );


    // =================================================
    // Project Type
    // =================================================

    setText(
      projectType,
      project.projectType
    );


    // =================================================
    // Full Address
    // =================================================

    setText(
      projectAddress,
      project.fullAddress
    );


    setText(
      projectAddressTwo,
      project.fullAddress
    );


    // =================================================
    // Area
    // =================================================

    setText(
      projectArea,
      project.area
    );


    // =================================================
    // City
    // =================================================

    setText(
      projectCity,
      project.city
    );


    // =================================================
    // State
    // =================================================

    setText(
      projectState,
      project.state
    );


    // =================================================
    // Country
    // =================================================

    setText(
      projectCountry,
      project.country
    );

  })


// =====================================================
// Error Handling
// =====================================================

  .catch((error) => {

    console.error(
      "Error loading project:",
      error
    );

  });