
/* =========================================================
   1. CONFIGURATION
========================================================= */

const SITE_CONFIG = {
  contactEmail: "habbai@alhabbai.ae",
  emailSubject: "Website Enquiry",
};


/* =========================================================
   2. DOM ELEMENTS
========================================================= */

const DOM = {
  navLinks: document.getElementById("navLinks"),
  navbar: document.getElementById("navbar"),
  logo: document.querySelector("nav img"),

  backToTop: document.getElementById("backToTop"),

  emailPickerButton: document.getElementById("emailPickerButton"),
  emailPickerModal: document.getElementById("emailPickerModal"),

  gmailEmailLink: document.getElementById("gmailEmailLink"),
  outlookEmailLink: document.getElementById("outlookEmailLink"),
  defaultEmailLink: document.getElementById("defaultEmailLink"),
};


/* =========================================================
   3. INITIALIZATION
========================================================= */

AOS.init({
  offset: 150,
  delay: 100,
  duration: 400,
  easing: "ease",
  once: false,
  mirror: false,
  anchorPlacement: "top-bottom",
});


/* =========================================================
   4. NAVIGATION FUNCTIONS
========================================================= */

function showMenu() {
  if (!DOM.navLinks) return;
  DOM.navLinks.style.right = "0";
}

function hideMenu() {
  if (!DOM.navLinks) return;
  DOM.navLinks.style.right = "-200px";
}


/* =========================================================
   5. EMAIL PICKER FUNCTIONS
========================================================= */

function openEmailPicker() {
  if (!DOM.emailPickerModal) return;

  DOM.emailPickerModal.classList.add("is-open");
  DOM.emailPickerModal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  DOM.emailPickerModal
    .querySelector(".email-picker__close")
    ?.focus();
}

function closeEmailPicker() {
  if (!DOM.emailPickerModal) return;

  DOM.emailPickerModal.classList.remove("is-open");
  DOM.emailPickerModal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  DOM.emailPickerButton?.focus();
}


/* =========================================================
   6. EMAIL LINKS
========================================================= */

function setupEmailLinks() {
  const email = encodeURIComponent(SITE_CONFIG.contactEmail);

  if (DOM.gmailEmailLink) {
    DOM.gmailEmailLink.href =
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
  }

  if (DOM.outlookEmailLink) {
    DOM.outlookEmailLink.href =
      `mailto:${SITE_CONFIG.contactEmail}`;
  }

  if (DOM.defaultEmailLink) {
    DOM.defaultEmailLink.href =
      `mailto:${SITE_CONFIG.contactEmail}`;
  }
}


/* =========================================================
   7. EVENT LISTENERS
========================================================= */

DOM.emailPickerButton?.addEventListener(
  "click",
  openEmailPicker
);

DOM.emailPickerModal
  ?.querySelectorAll("[data-close-email-picker]")
  .forEach((element) => {
    element.addEventListener("click", closeEmailPicker);
  });

setupEmailLinks();



/* Sticky Navbar */
function updateNavbarOnScroll() {
  if (!DOM.navbar || !DOM.logo) return;

  if (window.scrollY > 70) {
    DOM.navbar.classList.add("scrolled");
    DOM.logo.src = "./assets/images/alhabbai-dark-logo.png";
  } else {
    DOM.navbar.classList.remove("scrolled");
    DOM.logo.src = "./assets/images/alhabbai-white-logo.png";
  }
}

window.addEventListener("scroll", updateNavbarOnScroll, {
  passive: true,
});

// Set the correct logo and navbar state when the page loads
updateNavbarOnScroll();
