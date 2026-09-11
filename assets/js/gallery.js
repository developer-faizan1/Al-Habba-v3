/* =====================================
   IMAGE LIST
===================================== */

const images = [
  "./assets/images/projects_img/p205.jpg",
  "./assets/images/projects_img/p198.jpg",
  "./assets/images/projects_img/p197.jpg",
  "./assets/images/projects_img/p195.jpg",
  "./assets/images/projects_img/p190.jpg",
  "./assets/images/projects_img/p189.jpg",
  "./assets/images/projects_img/p188.jpg",
  "./assets/images/projects_img/p179.jpg",
  "./assets/images/projects_img/p178.jpg",
  "./assets/images/projects_img/p177.jpg",
  "./assets/images/projects_img/p176.jpg",
  "./assets/images/projects_img/p175.jpg",
  "./assets/images/projects_img/p174.jpg",
  "./assets/images/projects_img/p173.jpg",
  "./assets/images/projects_img/p172.jpg",
  "./assets/images/projects_img/p171.jpg",
  "./assets/images/projects_img/p170.jpg",
  "./assets/images/projects_img/p166.jpg",
  "./assets/images/projects_img/p165.jpg",
  "./assets/images/projects_img/p164.jpg",
  "./assets/images/projects_img/p162.jpg",
  "./assets/images/projects_img/p161.jpg",
  "./assets/images/projects_img/p160.png",
  "./assets/images/projects_img/p157.jpg",
  "./assets/images/projects_img/p155.jpg",
  "./assets/images/projects_img/p154.jpg",
  "./assets/images/projects_img/p153.jpg",
  "./assets/images/projects_img/p152.jpg",
  "./assets/images/projects_img/p151.jpg",
  "./assets/images/projects_img/p150.png",
  "./assets/images/projects_img/p149.jpg",
  "./assets/images/projects_img/p147.jpg",
  "./assets/images/projects_img/p146.jpg",
  "./assets/images/projects_img/p145.png",
  "./assets/images/projects_img/p142.png",
  "./assets/images/projects_img/p141.png",
  "./assets/images/projects_img/p140.jpg",
  "./assets/images/projects_img/p138.jpg",
  "./assets/images/projects_img/p137.jpg",
  "./assets/images/projects_img/p136.jpg",
  "./assets/images/projects_img/p135.jpg",
];

/* =====================================
   ELEMENTS
===================================== */

const galleryGrid = document.getElementById("galleryGrid");

const lightbox = document.getElementById("lightbox");

const lightboxImage = document.getElementById("lightboxImage");

const closeBtn = document.getElementById("closeBtn");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const imageCounter = document.getElementById("imageCounter");

let currentIndex = 0;

/* =====================================
   CREATE GALLERY
===================================== */

images.forEach((image, index) => {
  const card = document.createElement("div");

  card.className = "gallery-card";
  card.setAttribute("data-aos", "fade-up");

  card.innerHTML = `
        <img
            src="${image}"
            alt="Gallery Image ${index + 1}"
            loading="lazy"
        >

        <div class="gallery-overlay">
            <div class="zoom-icon">
                ⤢
            </div>
        </div>
    `;

  card.addEventListener("click", () => {
    openLightbox(index);
  });

  galleryGrid.appendChild(card);
});

/* =====================================
   OPEN LIGHTBOX
===================================== */

function openLightbox(index) {
  currentIndex = index;

  updateLightbox();

  lightbox.classList.add("active");

  document.body.style.overflow = "hidden";
}

/* =====================================
   UPDATE IMAGE
===================================== */

function updateLightbox() {
  lightboxImage.src = images[currentIndex];

  lightboxImage.alt = `Gallery Image ${currentIndex + 1}`;

  imageCounter.textContent = `${currentIndex + 1} / ${images.length}`;
}

/* =====================================
   CLOSE LIGHTBOX
===================================== */

function closeLightbox() {
  lightbox.classList.remove("active");

  document.body.style.overflow = "";
}

closeBtn.addEventListener("click", closeLightbox);

/* =====================================
   NEXT IMAGE
===================================== */

function nextImage() {
  currentIndex++;

  if (currentIndex >= images.length) {
    currentIndex = 0;
  }

  updateLightbox();
}

nextBtn.addEventListener("click", nextImage);

/* =====================================
   PREVIOUS IMAGE
===================================== */

function previousImage() {
  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = images.length - 1;
  }

  updateLightbox();
}

prevBtn.addEventListener("click", previousImage);

/* =====================================
   CLICK OUTSIDE IMAGE
===================================== */

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

/* =====================================
   KEYBOARD CONTROLS
===================================== */

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) {
    return;
  }

  if (e.key === "Escape") {
    closeLightbox();
  }

  if (e.key === "ArrowRight") {
    nextImage();
  }

  if (e.key === "ArrowLeft") {
    previousImage();
  }
});
