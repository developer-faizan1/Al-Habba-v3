const params = new URLSearchParams(window.location.search);
const projectSlug = params.get("slug");

const setText = (element, value, fallback = "Not Available") => {
  if (!element) return;

  element.textContent =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
      ? value
      : fallback;
};

fetch("./assets/js/projectsData.json")
  .then((res) => res.json())
  .then((projects) => {

    const project = projects.find(
      (item) => item.slug === projectSlug
    );

    if (!project) {
      console.log("Project not found:", projectSlug);
      return;
    }

    // =========================
    // Select HTML Elements
    // =========================

    const projectImage =
      document.getElementById("projectImage");

    const cardProjectImage =
      document.getElementById("cardProjectImage");

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


    // =========================
    // Set Image
    // =========================

    if (projectImage) {
      projectImage.src =
        project.image || "assets/images/default.jpg";

      projectImage.alt =
        project.title || "Project Image";
    }

    if (cardProjectImage) {
      cardProjectImage.src =
        project.image || "assets/images/default.jpg";

      cardProjectImage.alt =
        project.title || "Project Image";
    }


    // =========================
    // Set Project Data
    // =========================

    setText(
      projectNumber,
      project.projectNumber
        ? `Project - ${project.projectNumber}`
        : null
    );

    setText(
      projectTitle,
      project.title
    );

    setText(
      projectSlugElement,
      project.slug
    );

    setText(
      projectValue,
      project.projectValue
    );

    setText(
      projectClient,
      project.client
    );

    setText(
      projectConsultant,
      project.consultant
    );

    setText(
      projectStartDate,
      project.startDate
    );

    setText(
      projectCompletionDate,
      project.completionDate
    );

    setText(
      projectStatus,
      project.status
    );

    setText(
      projectType,
      project.projectType
    );

    setText(
      projectAddress,
      project.fullAddress
    );

    setText(
      projectAddressTwo,
      project.fullAddress
    );

    setText(
      projectArea,
      project.area
    );

    setText(
      projectCity,
      project.city
    );

    setText(
      projectState,
      project.state
    );

    setText(
      projectCountry,
      project.country
    );

  })
  .catch((error) => {
    console.error("Error:", error);
  });