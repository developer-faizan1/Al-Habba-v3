/* =========================================================
   AL HABBAI – HOME PAGE INTERACTIONS (v2)
   Place at: /js/home.js  (load with defer)
   - scroll reveal + masked title reveal
   - mouse-follow spotlight on cards
   - 3D tilt on about image
   - animated counters
   - parallax background text
   - leadership carousel (drag / swipe, arrows, dots, autoplay)
========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("ah-js");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Scroll reveal ---------- */
  /* ---------- 1b. Scroll-linked word fill ---------- */
  var wordBlocks = [];
  document.querySelectorAll("[data-words]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    var spans = words.map(function (w, i) {
      var s = document.createElement("span");
      s.className = "ah-w" + (reduce ? " is-lit" : "");
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
    wordBlocks.push({ el: el, spans: spans });
  });
  if (wordBlocks.length && !reduce) {
    var wTick = false;
    var fillWords = function () {
      var vh = window.innerHeight;
      wordBlocks.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        var p = (vh * 0.9 - r.top) / (vh * 0.3 + r.height);
        p = Math.max(0, Math.min(1, p));
        var lit = Math.round(p * b.spans.length);
        b.spans.forEach(function (s, i) {
          s.classList.toggle("is-lit", i < lit);
        });
      });
      wTick = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!wTick) {
          requestAnimationFrame(fillWords);
          wTick = true;
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", fillWords);
    fillWords();
  }

  /* section-level flag: starts the background animations (skyline, swoosh) */
  var aboutSec = document.querySelector(".ah-about");
  if (aboutSec) {
    if ("IntersectionObserver" in window && !reduce) {
      var secIO = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            aboutSec.classList.add("is-in");
            secIO.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      secIO.observe(aboutSec);
    } else {
      aboutSec.classList.add("is-in");
    }
  }

  var revealEls = document.querySelectorAll("[data-reveal], [data-split]");

  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseFloat(group.getAttribute("data-stagger")) || 0.12;
    group.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--d", i * step + "s");
    });
  });

  if ("IntersectionObserver" in window && !reduce) {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) {
      revealIO.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- 2. Mouse-follow spotlight ---------- */
  document.querySelectorAll("[data-spot]").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- 2b. Services card tilt ---------- */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".ah-svc").forEach(function (card) {
      var MAX = 7;
      card.addEventListener("pointerenter", function () {
        if (!card.classList.contains("is-in")) return;
        card.style.transition =
          "transform .25s ease-out, box-shadow .5s, border-color .4s, opacity .3s";
      });
      card.addEventListener("pointermove", function (e) {
        if (!card.classList.contains("is-in")) return;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", (x * MAX * 2).toFixed(2) + "deg");
        card.style.setProperty("--rx", (-y * MAX * 2).toFixed(2) + "deg");
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition =
          "transform .8s cubic-bezier(.2,.8,.2,1), box-shadow .5s, border-color .4s, opacity .3s";
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- 2c. Mouse-depth parallax (about image layers) ---------- */
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-mouse]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        el.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--px", 0);
        el.style.setProperty("--py", 0);
      });
    });
  }

  /* ---------- 3. 3D tilt (about image) ---------- */
  var tiltWrap = document.querySelector("[data-tilt]");
  if (tiltWrap && !reduce && window.matchMedia("(hover: hover)").matches) {
    var frame = tiltWrap.querySelector(".ah-about__frame");
    tiltWrap.addEventListener("pointermove", function (e) {
      var r = tiltWrap.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform =
        "rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg)";
    });
    tiltWrap.addEventListener("pointerleave", function () {
      frame.style.transform = "";
    });
  }

  /* ---------- 4. Counters ---------- */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var duration = 2200;
    if (reduce) {
      el.textContent = target;
      return;
    }
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(easeOutExpo(p) * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll(".ah-count");
  if ("IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            countIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (c) {
      countIO.observe(c);
    });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- 5. Parallax background text ---------- */
  var parallax = document.querySelectorAll("[data-parallax]");
  if (parallax.length && !reduce) {
    var ticking = false;
    var update = function () {
      parallax.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        el.style.transform = "translate3d(" + rect.top * speed + "px,0,0)";
      });
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------- 6. Leadership carousel ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var viewport = car.querySelector(".ah-lcar__viewport");
    var track = car.querySelector(".ah-lcar__track");
    var slides = Array.prototype.slice.call(track.children);
    var dots = Array.prototype.slice.call(car.querySelectorAll(".ah-dot"));
    var cur = car.querySelector("[data-cur]");
    var prevBtn = car.querySelector("[data-prev]");
    var nextBtn = car.querySelector("[data-next]");
    var n = slides.length;
    var index = 0;

    if (reduce) car.classList.add("no-auto");

    function pad(v) {
      return v < 10 ? "0" + v : "" + v;
    }

    function go(i) {
      index = (i + n) % n;
      track.style.transform = "translateX(" + -index * 100 + "%)";
      slides.forEach(function (s, k) {
        s.classList.toggle("is-active", k === index);
      });
      dots.forEach(function (d, k) {
        d.classList.remove("is-active");
        if (k === index) {
          void d.offsetWidth; // restart progress animation
          d.classList.add("is-active");
        }
      });
      if (cur) cur.textContent = pad(index + 1);
    }

    /* autoplay is driven by the dot progress animation */
    dots.forEach(function (d, k) {
      d.addEventListener("click", function () {
        go(k);
      });
      d.addEventListener("animationend", function (e) {
        if (e.animationName === "ahProg") go(index + 1);
      });
    });
    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        go(index - 1);
      });
    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        go(index + 1);
      });

    /* pause on hover / focus */
    car.addEventListener("pointerenter", function () {
      car.classList.add("is-paused");
    });
    car.addEventListener("pointerleave", function () {
      car.classList.remove("is-paused");
    });

    /* keyboard */
    car.setAttribute("tabindex", "0");
    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    });

    /* drag / swipe */
    var startX = 0,
      dx = 0,
      dragging = false,
      moved = false;

    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      dx = 0;
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        track.classList.add("is-drag");
        viewport.classList.add("is-drag");
        car.classList.add("is-paused");
      }
      if (moved) {
        var w = viewport.offsetWidth;
        var pct = (-index * 100 + (dx / w) * 100).toFixed(3);
        track.style.transform = "translateX(" + pct + "%)";
      }
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-drag");
      viewport.classList.remove("is-drag");
      if (moved) {
        if (dx < -60) go(index + 1);
        else if (dx > 60) go(index - 1);
        else go(index);
      }
    }
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    /* hover tilt */
    if (!reduce && window.matchMedia("(hover: hover)").matches) {
      var TMAX = 3.5;
      viewport.addEventListener("pointermove", function (e) {
        if (dragging && moved) return;
        var r = viewport.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        viewport.style.setProperty("--ry", (x * TMAX * 2).toFixed(2) + "deg");
        viewport.style.setProperty("--rx", (-y * TMAX * 2).toFixed(2) + "deg");
      });
      viewport.addEventListener("pointerleave", function () {
        viewport.style.setProperty("--rx", "0deg");
        viewport.style.setProperty("--ry", "0deg");
      });
    }

    /* stop link clicks after a drag */
    viewport.addEventListener(
      "click",
      function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      },
      true
    );
    viewport.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    /* start autoplay only once the carousel is visible */
    if ("IntersectionObserver" in window) {
      car.classList.add("is-paused");
      go(0);
      var carIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              car.classList.remove("is-paused");
              go(index);
              carIO.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      carIO.observe(car);
    } else {
      go(0);
    }
  });
})();