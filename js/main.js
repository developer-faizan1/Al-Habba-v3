// AOS
AOS.init({
  offset: 150,
  delay: 100,
  duration: 400,
  easing: "ease",
  once: false,
  mirror: false,
  anchorPlacement: "top-bottom",
});

// Navigation
const navLinks = document.getElementById("navLinks");
const navbar = document.getElementById("navbar");
const logo = document.querySelector("nav img");
const circumference = 2 * Math.PI * 21;

function showMenu() {
  navLinks.style.right = "0";
}

function hideMenu() {
  navLinks.style.right = "-200px";
}

// Sticky Navbar
window.addEventListener("scroll", () => {
  if (window.scrollY > 70) {
    navbar.classList.add("scrolled");
    logo.src = "./assets/images/alhabbai-dark-logo.png";
  } else {
    navbar.classList.remove("scrolled");
    logo.src = "./assets/images/alhabbai-white-logo.png";
  }
});

(function () {
  var btn = document.getElementById("backToTop");
  if (!btn) return;
  var toggle = function () {
    btn.classList.toggle("is-visible", window.scrollY > 300);
  };
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
  btn.addEventListener("click", function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
})();



const emailPickerButton = document.getElementById(
  "emailPickerButton"
);

const emailPickerModal = document.getElementById(
  "emailPickerModal"
);

const gmailEmailLink = document.getElementById(
  "gmailEmailLink"
);

const outlookEmailLink = document.getElementById(
  "outlookEmailLink"
);

const defaultEmailLink = document.getElementById(
  "defaultEmailLink"
);

// Company email
const contactEmail = "habbai@alhabbai.ae";

// Open email picker
function openEmailPicker() {
  emailPickerModal.classList.add("is-open");
  emailPickerModal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  emailPickerModal
    .querySelector(".email-picker__close")
    .focus();
}

// Close email picker
function closeEmailPicker() {
  emailPickerModal.classList.remove("is-open");
  emailPickerModal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  emailPickerButton.focus();
}

// Gmail compose
gmailEmailLink.href =
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}`;

// Outlook compose
outlookEmailLink.href =
  `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(contactEmail)}`;

// Default email application
defaultEmailLink.href =
  `mailto:${contactEmail}`;

// Open popup
emailPickerButton.addEventListener(
  "click",
  openEmailPicker
);

// Close button and overlay
emailPickerModal
  .querySelectorAll("[data-close-email-picker]")
  .forEach((element) => {
    element.addEventListener("click", closeEmailPicker);
  });

// Close with Escape
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    emailPickerModal.classList.contains("is-open")
  ) {
    closeEmailPicker();
  }
});

// Close popup after selecting email app
[
  gmailEmailLink,
  outlookEmailLink,
  defaultEmailLink
].forEach((link) => {
  link.addEventListener("click", () => {
    closeEmailPicker();
  });
});
