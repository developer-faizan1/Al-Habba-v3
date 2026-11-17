/* =========================================
   submit.js — contact.html (EmailJS)
   Needs this in contact.html BEFORE this file:
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
========================================= */

const EMAILJS = {
  publicKey: "oGIp5asUMi-SAD3CT",
  serviceId: "service_md4javw",
  contactTemplateId: "template_7w3476g",
  registrationTemplateId: "YOUR_REGISTRATION_TEMPLATE_ID",
};

console.log("submit.js loaded");

// Never let a missing SDK stop validation from working
if (typeof emailjs !== "undefined") {
  emailjs.init({ publicKey: EMAILJS.publicKey });
} else {
  console.error("EmailJS SDK not loaded. Check the <script> tag in contact.html");
}

function requireEmailJS() {
  if (typeof emailjs === "undefined") {
    throw new Error("EmailJS SDK not loaded");
  }
}

/* ---------- helpers ---------- */

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: 9999,
    padding: "14px 20px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,.2)",
    background: type === "success" ? "#16a34a" : "#dc2626",
    transition: "opacity .3s ease",
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function setLoading(button, loading, text) {
  const label = button.querySelector("span") || button;
  if (loading) {
    button.dataset.original = label.textContent;
    label.textContent = text;
    button.disabled = true;
  } else {
    label.textContent = button.dataset.original;
    button.disabled = false;
  }
}

/* =========================================
   1. CONTACT FORM
========================================= */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  const rules = {
    name: (v) => (v.length < 2 ? "Please enter your full name." : ""),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address.",
    phone: (v) =>
      /^[+\d][\d\s()-]{6,19}$/.test(v) ? "" : "Enter a valid phone number.",
    subject: (v) => (v.length < 3 ? "Please write a subject." : ""),
    department: (v) => (!v ? "Please select a department." : ""),
    message: (v) =>
      v.length < 10 ? "Message must be at least 10 characters." : "",
  };

  function validateField(id) {
    const field = contactForm.elements[id];
    const error = document.getElementById(id + "Error");
    const wrapper = field.closest(
      ".input-wrapper, .textarea-wrapper, .select-wrapper"
    );
    const msg = rules[id](field.value.trim());

    error.textContent = msg;
    wrapper.classList.toggle("error", !!msg);
    wrapper.classList.toggle("success", !msg);
    return !msg;
  }

  Object.keys(rules).forEach((id) => {
    const field = contactForm.elements[id];
    field.addEventListener("blur", () => validateField(id));
    field.addEventListener("change", () => validateField(id));
    field.addEventListener("input", () => {
      if (field.closest(".error")) validateField(id);
    });
  });

  const counter = document.getElementById("charCount");
  contactForm.elements.message.addEventListener("input", (e) => {
    counter.textContent = e.target.value.length;
  });

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const valid = Object.keys(rules).map(validateField).every(Boolean);
    if (!valid) return;

    const btn = document.getElementById("submitBtn");
    setLoading(btn, true, "Sending...");

    try {
      requireEmailJS();
      await emailjs.send(EMAILJS.serviceId, EMAILJS.contactTemplateId, {
        name: contactForm.elements.name.value.trim(),
        email: contactForm.elements.email.value.trim(),
        phone: contactForm.elements.phone.value.trim(),
        subject: contactForm.elements.subject.value.trim(),
        department: contactForm.elements.department.value,
        message: contactForm.elements.message.value.trim(),
      });

      showToast("Message sent successfully. Thank you!");
      contactForm.reset();
      counter.textContent = "0";
      contactForm
        .querySelectorAll(".success, .error")
        .forEach((el) => el.classList.remove("success", "error"));
    } catch (err) {
      console.error(err);
      showToast("Could not send your message. Please try again.", "error");
    } finally {
      setLoading(btn, false);
    }
  });
}

/* =========================================
   2. REGISTRATION FORM
========================================= */

const registrationForm = document.querySelector(".registration-form");

if (registrationForm) {
  // Radio card highlight
  registrationForm
    .querySelectorAll('input[name="activity"]')
    .forEach((radio) => {
      radio.addEventListener("change", () => {
        registrationForm
          .querySelectorAll(".activity-card")
          .forEach((c) => c.classList.remove("active"));
        radio.closest(".activity-card").classList.add("active");
      });
    });

  // Fields without a red * are optional
  registrationForm.querySelectorAll(".form-group").forEach((group) => {
    if (!group.querySelector("label span")) {
      const field = group.querySelector("input, select");
      if (field) field.removeAttribute("required");
    }
  });

  registrationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!registrationForm.checkValidity()) {
      registrationForm.reportValidity();
      return;
    }

    const activity = registrationForm.querySelector(
      'input[name="activity"]:checked'
    ).value;

    // Collect every field as "Label: value" lines
    const lines = [];
    registrationForm.querySelectorAll(".form-group").forEach((group) => {
      const label = group.querySelector("label");
      const field = group.querySelector("input, select");
      if (label && field) {
        const title = label.textContent.replace("*", "").trim().replace(/\s+/g, " ");
        lines.push(title + ": " + (field.value.trim() || "-"));
      }
    });

    const btn = registrationForm.querySelector(".submit-btn");
    setLoading(btn, true, "Submitting...");

    try {
      requireEmailJS();
      await emailjs.send(EMAILJS.serviceId, EMAILJS.registrationTemplateId, {
        activity: activity,
        details: lines.join("\n"),
      });

      showToast("Registration submitted successfully.");
      registrationForm.reset();
    } catch (err) {
      console.error(err);
      showToast("Could not submit the form. Please try again.", "error");
    } finally {
      setLoading(btn, false);
    }
  });
}