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
