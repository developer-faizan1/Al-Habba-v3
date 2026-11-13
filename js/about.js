/* About page animations – works alongside main.js (does not touch it) */
(() => {
  const root = document.documentElement;
  root.classList.add("ab-js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const init = () => {
    /* ---------- 1. Split titles into masked words ---------- */
    const splitNode = (node, counter) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            const outer = document.createElement("span");
            outer.className = "ab-word";
            const inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", counter.i++);
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          splitNode(child, counter);
        }
      });
    };
    document.querySelectorAll("[data-split]").forEach((el) => {
      const label = el.textContent.replace(/\s+/g, " ").trim();
      el.setAttribute("aria-label", label);
      splitNode(el, { i: 0 });
      el.querySelectorAll(".ab-word").forEach((w) =>
        w.setAttribute("aria-hidden", "true"),
      );
    });

    /* ---------- 2. Counters ---------- */
    const animateCount = (el) => {
      const since = el.dataset.since;
      const target = since
        ? new Date().getFullYear() - parseInt(since, 10)
        : parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      if (reduce) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1800;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    /* ---------- 3. Reveal on scroll ---------- */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-in");
          el.querySelectorAll("[data-count], [data-since]").forEach(
            animateCount,
          );
          if (el.matches("[data-count], [data-since]")) animateCount(el);
          io.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    document
      .querySelectorAll("[data-reveal], [data-split]")
      .forEach((el) => {
        if (el.dataset.delay) el.style.setProperty("--d", el.dataset.delay);
        io.observe(el);
      });

    /* ---------- 4. Parallax images ---------- */
    const parallaxEls = [...document.querySelectorAll("[data-parallax]")];
    let ticking = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        const speed = parseFloat(el.dataset.parallax) || 0.08;
        const offset = (rect.top + rect.height / 2 - vh / 2) * speed * -1;
        const img = el.querySelector("img");
        if (img) img.style.setProperty("--py", offset.toFixed(1) + "px");
      });
      ticking = false;
    };
    if (!reduce && parallaxEls.length) {
      window.addEventListener(
        "scroll",
        () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateParallax);
          }
        },
        { passive: true },
      );
      window.addEventListener("resize", updateParallax);
      updateParallax();
    }

    /* ---------- 5. Card tilt + spotlight ---------- */
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) {
      document.querySelectorAll(".ab-card__inner").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          card.style.setProperty("--mx", x + "px");
          card.style.setProperty("--my", y + "px");
          if (!reduce) {
            const rx = ((y / r.height) * 2 - 1) * -6;
            const ry = ((x / r.width) * 2 - 1) * 6;
            card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
          }
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    }

    /* ---------- 6. Leadership rows: quote split, expand, pointer drift ---------- */
    document.querySelectorAll(".ab-ldr").forEach((row) => {
      // split the quote into masked words
      const qp = row.querySelector(".ab-ldr__quote p");
      if (qp) {
        const words = qp.textContent.trim().split(/\s+/);
        qp.setAttribute("aria-label", words.join(" "));
        qp.textContent = "";
        words.forEach((w, i) => {
          const outer = document.createElement("span");
          outer.className = "ab-qw";
          outer.setAttribute("aria-hidden", "true");
          const inner = document.createElement("span");
          inner.textContent = w;
          inner.style.setProperty("--i", i);
          outer.appendChild(inner);
          qp.appendChild(outer);
          if (i < words.length - 1) qp.appendChild(document.createTextNode(" "));
        });
      }

      // expand / collapse the full message
      const btn = row.querySelector(".ab-more__btn");
      const more = row.querySelector(".ab-more");
      if (btn && more) {
        const label = btn.querySelector("span");
        btn.addEventListener("click", () => {
          const open = more.classList.toggle("is-open");
          btn.setAttribute("aria-expanded", open);
          label.textContent = open ? "Show less" : "Read full message";
        });
      }

      // pointer drives layered depth on the portrait (tilt, parallax, glare)
      const media = row.querySelector(".ab-ldr__media");
      if (canHover && !reduce && media) {
        let raf = 0;
        media.addEventListener("mousemove", (e) => {
          const r = media.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            media.style.setProperty("--mx", x.toFixed(3));
            media.style.setProperty("--my", y.toFixed(3));
          });
        });
        media.addEventListener("mouseleave", () => {
          cancelAnimationFrame(raf);
          media.style.setProperty("--mx", 0);
          media.style.setProperty("--my", 0);
        });
      }

      // magnetic button
      if (canHover && !reduce && btn) {
        btn.addEventListener("mousemove", (e) => {
          const r = btn.getBoundingClientRect();
          btn.style.setProperty("--bx", (e.clientX - (r.left + r.width / 2)) * 0.22 + "px");
          btn.style.setProperty("--by", (e.clientY - (r.top + r.height / 2)) * 0.35 + "px");
        });
        btn.addEventListener("mouseleave", () => {
          btn.style.setProperty("--bx", "0px");
          btn.style.setProperty("--by", "0px");
        });
      }
    });

    /* ---------- 7. Ghost titles drift with scroll ---------- */
    const ghosts = [...document.querySelectorAll(".ab-ldr__ghost")];
    if (!reduce && ghosts.length) {
      let gTick = false;
      const moveGhosts = () => {
        const vh = window.innerHeight;
        ghosts.forEach((g) => {
          const r = g.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
          g.style.setProperty("--gx", (p * -90).toFixed(1) + "px");
        });
        gTick = false;
      };
      window.addEventListener(
        "scroll",
        () => {
          if (!gTick) {
            gTick = true;
            requestAnimationFrame(moveGhosts);
          }
        },
        { passive: true },
      );
      moveGhosts();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();