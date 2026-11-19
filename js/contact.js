/* ==========================================================================
   contact.js  |  AL Habbai Contracting  |  Contact Us page
   Vanilla JS, no dependencies.

   Sections
     1. Configuration (form endpoints: set these when your backend is ready)
     2. Validation helpers
     3. Form controller (validation UI, submit flow, double-submit guard)
     4. Submission layer (the only place to touch when adding a backend)
     5. Scroll-reveal animations
     6. Google Maps embed loader
   ========================================================================== */

(function () {
  "use strict";

  // Tells the CSS that JS is running, so reveal animations can safely hide elements.
  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------------
     1. CONFIGURATION
     ------------------------------------------------------------------------
     Backend integration: put your PHP script (or form-service URL) here.
     While a value is empty, the form only validates on the client and shows
     a clear "not connected yet" message. Nothing is sent anywhere.

       endpoints: {
         enquiry:      'php/send-enquiry.php',
         registration: 'php/register-company.php'
       }

     The request is a multipart/form-data POST (same as a normal HTML form),
     so in PHP the values are in $_POST. Field names match the HTML `name`
     attributes, plus a `form_type` field ("enquiry" or "registration").
     The endpoint may answer with JSON like { "success": true } or
     { "success": false, "message": "..." }; any non-2xx response counts as failure.
     ------------------------------------------------------------------------ */
  var CONFIG = {
    emailjs: {
      serviceID: "service_md4javw",
      templateID: "template_vpu44xj",
      publicKey: "oGIp5asUMi-SAD3CT",
    },
    endpoints: {
      enquiry: "",
      registration: "",
    },
    // Only used while no endpoint is set, so the loading state can be seen/tested.
    simulatedDelayMs: 900,
    messages: {
      success: {
        enquiry:
          "Thank you. Your enquiry has been sent and our team will get back to you shortly.",
        registration:
          "Thank you. Your company registration has been received and our team will review it.",
      },
      notConnected:
        "Your details passed validation, but this form is not connected to a server yet, so nothing has been sent. " +
        "Please contact us by phone or email in the meantime.",
      invalid: "Please correct the highlighted fields and try again.",
      failure:
        "Sorry, something went wrong and your message could not be sent. " +
        "Please try again, or contact us on +971 4 262 8388.",
    },
  };

  /* ------------------------------------------------------------------------
     2. VALIDATION HELPERS
     ------------------------------------------------------------------------ */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_CHARS_RE = /^\+?[\d\s\-().]+$/;

  function isValidEmail(value) {
    return EMAIL_RE.test(value);
  }

  // Accepts international formats such as +971 4 262 8388, 04-262-8388, (04) 2628388.
  function isValidPhone(value) {
    if (!PHONE_CHARS_RE.test(value)) return false;
    var digits = value.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  }

  function normalizeUrl(value) {
    return /^https?:\/\//i.test(value) ? value : "https://" + value;
  }

  // Accepts "www.example.com" as well as "https://example.com/path".
  function isValidUrl(value) {
    if (/\s/.test(value)) return false;
    try {
      var url = new URL(normalizeUrl(value));
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        /\.[a-z]{2,}$/i.test(url.hostname)
      );
    } catch (e) {
      return false;
    }
  }

  // Returns an error message, or '' when the field is valid.
  function getFieldError(field) {
    var value = field.value.trim();
    var label = field.dataset.label || field.name;

    if (field.required && !value) {
      return field.dataset.requiredMessage || label + " is required.";
    }
    if (!value) return ""; // optional and empty: nothing to check

    if (field.minLength > 0 && value.length < field.minLength) {
      return label + " must be at least " + field.minLength + " characters.";
    }

    switch (field.dataset.validate) {
      case "email":
        if (!isValidEmail(value))
          return "Please enter a valid email address, for example name@company.com.";
        break;
      case "phone":
        if (!isValidPhone(value))
          return "Please enter a valid phone number, for example +971 4 262 8388.";
        break;
      case "url":
        if (!isValidUrl(value))
          return "Please enter a valid website address, for example www.example.com.";
        break;
    }
    return "";
  }

  function showFieldError(field, message) {
    var wrapper = field.closest(".field");
    var errorEl = wrapper && wrapper.querySelector(".field-error");
    if (errorEl) errorEl.textContent = message;
    if (message) {
      field.setAttribute("aria-invalid", "true");
    } else {
      field.removeAttribute("aria-invalid");
    }
  }

  function getRadioGroup(field) {
    return Array.prototype.filter.call(field.form.elements, function (el) {
      return el.type === "radio" && el.name === field.name;
    });
  }

  // A radio group is valid when one option is chosen (if the group is required).
  function validateRadioGroup(field) {
    var group = getRadioGroup(field);
    var chosen = group.some(function (radio) {
      return radio.checked;
    });
    var message =
      group[0].required && !chosen
        ? group[0].dataset.requiredMessage || "Please choose an option."
        : "";

    showFieldError(group[0], message);
    group.forEach(function (radio) {
      if (message) {
        radio.setAttribute("aria-invalid", "true");
      } else {
        radio.removeAttribute("aria-invalid");
      }
    });
    return !message;
  }

  function validateField(field) {
    if (field.type === "radio") return validateRadioGroup(field);
    var message = getFieldError(field);
    showFieldError(field, message);
    return !message;
  }

  // Validates every field inside a container (the whole form, or one step).
  // Returns the list of invalid fields in DOM order (one entry per radio group).
  function validateContainer(container) {
    var invalid = [];
    var seenGroups = {};
    Array.prototype.forEach.call(
      container.querySelectorAll("input, select, textarea"),
      function (field) {
        if (!field.name || field.type === "submit" || field.type === "button")
          return;
        if (field.type === "radio") {
          if (seenGroups[field.name]) return;
          seenGroups[field.name] = true;
        }
        if (!validateField(field)) invalid.push(field);
      },
    );
    return invalid;
  }

  function validateForm(form) {
    return validateContainer(form);
  }

  /* ------------------------------------------------------------------------
     3. FORM CONTROLLER
     ------------------------------------------------------------------------ */
  function setStatus(form, type, message) {
    var el = form.querySelector("[data-status]");
    if (!el) return;
    el.className = "form-status" + (type ? " is-" + type : "");
    el.textContent = message || "";
    // Errors interrupt screen readers; successes and info are announced politely.
    el.setAttribute("role", type === "error" ? "alert" : "status");
  }

  function setSubmitting(form, isSubmitting) {
    var button = form.querySelector('button[type="submit"]');
    var label = button && button.querySelector(".btn__label");
    form.setAttribute("aria-busy", String(isSubmitting));
    if (!button || !label) return;

    if (isSubmitting) {
      button.dataset.originalLabel = label.textContent;
      label.textContent = button.dataset.loadingText || "Sending\u2026";
    } else if (button.dataset.originalLabel) {
      label.textContent = button.dataset.originalLabel;
    }
    button.disabled = isSubmitting;
    button.classList.toggle("is-loading", isSubmitting);
  }

  // Trims values and normalises the website so the backend receives clean data.
  function buildFormData(form, formType) {
    var data = new FormData(form);
    Array.from(data.entries()).forEach(function (entry) {
      var key = entry[0];
      var value = entry[1];
      if (typeof value !== "string") return;
      value = value.trim();
      if (key === "website" && value) value = normalizeUrl(value);
      data.set(key, value);
    });
    data.append("form_type", formType);
    return data;
  }

  // Subcontractor / Supplier choice: adapts the "Types of Work" label and example text.
  function syncWorkField(form) {
    var labelEl = form.querySelector("[data-work-target]");
    var input = form.querySelector("#reg-work");
    if (!labelEl || !input) return;

    var chosen = form.querySelector('input[name="registrationType"]:checked');
    var text = chosen ? chosen.dataset.workLabel : labelEl.dataset.default;

    labelEl.textContent = text;
    input.dataset.label = text;
    input.placeholder = chosen
      ? chosen.dataset.workPlaceholder
      : input.dataset.defaultPlaceholder;
  }

  // Multi-step form: progress indicator, animated step changes, per-step validation.
  function initWizard(form) {
    var steps = Array.prototype.slice.call(
      form.querySelectorAll("[data-step]"),
    );
    var items = Array.prototype.slice.call(
      form.querySelectorAll("[data-step-indicator]"),
    );
    var actions = form.querySelector("[data-actions]");
    var backBtn = form.querySelector("[data-wizard-back]");
    var nextBtn = form.querySelector("[data-wizard-next]");
    var submitBtn = form.querySelector('button[type="submit"]');
    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0;

    function goTo(index, direction, moveFocus) {
      current = index;

      steps.forEach(function (step, i) {
        step.hidden = i !== index;
        step.classList.remove("is-forward", "is-back");
      });

      var active = steps[index];
      if (direction) {
        void active.offsetWidth; // restart the CSS animation
        active.classList.add(direction > 0 ? "is-forward" : "is-back");
      }

      items.forEach(function (item, i) {
        item.classList.toggle("is-active", i === index);
        item.classList.toggle("is-done", i < index);
        if (i === index) {
          item.setAttribute("aria-current", "step");
        } else {
          item.removeAttribute("aria-current");
        }
      });
      form.style.setProperty("--progress", String((index + 1) / steps.length));

      var isLast = index === steps.length - 1;
      backBtn.hidden = index === 0;
      nextBtn.hidden = isLast;
      submitBtn.hidden = !isLast;
      actions.classList.toggle("is-last", isLast);

      if (moveFocus) {
        if (form.getBoundingClientRect().top < 0) {
          form.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }
        var heading = active.querySelector(".wizard-step__title");
        if (heading) heading.focus({ preventScroll: true });
      }
    }

    // Validates the current step; moves on only when it is valid.
    function next() {
      setStatus(form, "", "");
      var invalid = validateContainer(steps[current]);
      if (invalid.length) {
        setStatus(form, "error", CONFIG.messages.invalid);
        invalid[0].focus();
        return false;
      }
      if (current < steps.length - 1) goTo(current + 1, 1, true);
      return true;
    }

    nextBtn.addEventListener("click", next);
    backBtn.addEventListener("click", function () {
      setStatus(form, "", "");
      if (current > 0) goTo(current - 1, -1, true);
    });

    goTo(0, 0, false);

    return {
      next: next,
      isLast: function () {
        return current === steps.length - 1;
      },
      // Jump to the step that holds a field (used when final validation finds an earlier error).
      showStepOf: function (field) {
        for (var i = 0; i < steps.length; i++) {
          if (steps[i].contains(field)) {
            if (i !== current) goTo(i, i > current ? 1 : -1, false);
            return;
          }
        }
      },
      reset: function () {
        goTo(0, -1, false);
      },
    };
  }

  function initForm(form) {
    var formType = form.dataset.form;
    var isSubmitting = false;
    var wizard = form.hasAttribute("data-wizard") ? initWizard(form) : null;

    // Keep phone inputs to phone characters only.
    form.querySelectorAll('input[type="tel"]').forEach(function (input) {
      input.addEventListener("input", function () {
        var cleaned = input.value.replace(/[^\d\s+\-().]/g, "");
        if (cleaned !== input.value) input.value = cleaned;
      });
    });

    // Subcontractor / Supplier selector
    if (form.querySelector("[data-work-target]")) {
      form.addEventListener("change", function (event) {
        if (event.target.name === "registrationType") syncWorkField(form);
      });
      syncWorkField(form); // also covers browsers that restore a previously chosen radio
    }

    // Validate when leaving a field; once a field shows an error, re-check as the user types.
    form.addEventListener("focusout", function (event) {
      var field = event.target;
      if (field.type === "radio") return; // radios validate on change, not while tabbing through
      if (field.name && field.value !== undefined && field.type !== "submit")
        validateField(field);
    });
    ["input", "change"].forEach(function (type) {
      form.addEventListener(type, function (event) {
        var field = event.target;
        if (field.getAttribute && field.getAttribute("aria-invalid") === "true")
          validateField(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (isSubmitting) return; // guards against double clicks and Enter-key repeats

      // Pressing Enter on an earlier step behaves like "Continue".
      if (wizard && !wizard.isLast()) {
        wizard.next();
        return;
      }

      setStatus(form, "", "");
      var invalidFields = validateForm(form);
      if (invalidFields.length) {
        setStatus(form, "error", CONFIG.messages.invalid);
        if (wizard) wizard.showStepOf(invalidFields[0]);
        invalidFields[0].focus();
        return;
      }

      isSubmitting = true;
      setSubmitting(form, true);

      submitForm(formType, buildFormData(form, formType))
        .then(function (result) {
          if (result.delivered) {
            setStatus(
              form,
              "success",
              result.message || CONFIG.messages.success[formType],
            );
            form.reset();
            syncWorkField(form);
            if (wizard) wizard.reset();
          } else {
            setStatus(form, "info", CONFIG.messages.notConnected);
          }
        })
        .catch(function (error) {
          console.error(
            "[contact.js] Submission failed (" + formType + "):",
            error,
          );
          setStatus(
            form,
            "error",
            error && error.userMessage
              ? error.userMessage
              : CONFIG.messages.failure,
          );
        })
        .then(function () {
          isSubmitting = false;
          setSubmitting(form, false);
        });
    });
  }

  /* ------------------------------------------------------------------------
     4. SUBMISSION LAYER
     ------------------------------------------------------------------------
     The only function to change when connecting a backend or form service.
     Receives the form type and a ready-to-send FormData object.
     Resolve with { delivered: true } once the server confirms; reject on failure.
     ------------------------------------------------------------------------ */

function submitForm(formType, formData) {

  // EmailJS integration for Send Us an Enquiry
  if (formType === 'enquiry') {

    if (!window.emailjs) {
      return Promise.reject(
        new Error('EmailJS SDK is not loaded.')
      );
    }

    var departmentLabels = {
      hr: 'HR',
      tender: 'Tender',
      account: 'Account',
      general: 'General'
    };

    var templateParams = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      subject: formData.get('subject') || '',
      department: departmentLabels[formData.get('department')] ||
        formData.get('department') || '',
      message: formData.get('message') || ''
    };

    return emailjs.send(
      CONFIG.emailjs.serviceID,
      CONFIG.emailjs.templateID,
      templateParams,
      {
        publicKey: CONFIG.emailjs.publicKey
      }
    ).then(function (response) {

      console.log('Enquiry sent successfully:', response.status);

      return {
        delivered: true,
        message: CONFIG.messages.success.enquiry
      };

    }).catch(function (error) {

      console.error('EmailJS error:', error);

      throw new Error('Unable to send enquiry. Please try again.');

    });
  }

  // Keep the existing backend integration for registration.
  var endpoint = CONFIG.endpoints[formType];

  if (!endpoint) {
    return Promise.resolve({
      delivered: false
    });
  }

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: formData
  }).then(function (response) {

    if (!response.ok) {
      throw new Error('Server responded with HTTP ' + response.status);
    }

    return response.json().catch(function () {
      return {};
    });

  }).then(function (json) {

    if (json && json.success === false) {
      throw new Error(json.message || 'Server reported failure');
    }

    return {
      delivered: true,
      message: json && json.message
        ? String(json.message)
        : ''
    };

  });
}


  /* ------------------------------------------------------------------------
     5. SCROLL-REVEAL ANIMATIONS
     ------------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // animate once
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ------------------------------------------------------------------------
     6. GOOGLE MAPS EMBED LOADER
     ------------------------------------------------------------------------
     Paste the embed URL into data-embed-url on #officeMap in contact.html.
     Only Google Maps embed URLs are accepted; otherwise the placeholder stays.
     ------------------------------------------------------------------------ */
  function initMap() {
    var frame = document.getElementById("officeMap");
    if (!frame) return;

    var src = (frame.dataset.embedUrl || "").trim();
    if (!src) return;

    var url;
    try {
      url = new URL(src);
    } catch (e) {
      console.warn("[contact.js] data-embed-url is not a valid URL.");
      return;
    }

    var isGoogleMaps =
      url.protocol === "https:" &&
      /(^|\.)google\.com$/i.test(url.hostname) &&
      url.pathname.indexOf("/maps") === 0;

    if (!isGoogleMaps) {
      console.warn(
        "[contact.js] data-embed-url must be a https://www.google.com/maps/embed... URL.",
      );
      return;
    }

    var iframe = document.createElement("iframe");
    iframe.src = url.href;
    iframe.title =
      "Map showing the location of the AL Habbai Contracting office";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.allowFullscreen = true;

    frame.textContent = "";
    frame.appendChild(iframe);
  }

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  function init() {
    document.querySelectorAll("form[data-form]").forEach(initForm);
    initReveal();
    initMap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
