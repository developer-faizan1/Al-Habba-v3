/* =====================================
   IMAGE LIST
===================================== */

const images = [
  "https://faizanahmad.in/al-habbai/images/projects/215v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/212.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/208v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/208v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/211v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/211v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/210.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/209v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/209v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/205v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/204.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/209v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/198v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/198v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/197.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/195v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/195v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/190.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/189v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/189v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/188v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/188v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/177v1.webp",
  "https://faizanahmad.in/al-habbai/images/projects/176v1.webp",
  "https://faizanahmad.in/al-habbai/images/projects/176v2.webp",
  "https://faizanahmad.in/al-habbai/images/projects/173v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/173v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/172.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/171.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/167v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/165v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/164.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/163v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/163v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/162.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/159v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/159v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/157v1.webp",
  "https://faizanahmad.in/al-habbai/images/projects/157v2.webp",
  "https://faizanahmad.in/al-habbai/images/projects/155.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/154v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/154v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/153.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/151v1.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/151v2.jpg",
  "https://faizanahmad.in/al-habbai/images/projects/149v3.webp",
  "https://faizanahmad.in/al-habbai/images/projects/149v4.webp",
  "https://faizanahmad.in/al-habbai/images/projects/147v1.jpg",
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
