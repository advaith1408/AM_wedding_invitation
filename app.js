(function () {
  "use strict";

  const cfg = window.WEDDING_CONFIG || {};
  gsap.registerPlugin(ScrollTrigger);
  if (window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("kmArrive", "M0,0 C0.12,0 0.16,1 0.34,1 0.52,1 0.62,1 1,1");
  }

  const arrivalEase = window.CustomEase ? "kmArrive" : "power3.out";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------------
  // 0. HELPERS
  // ---------------------------------------------------------------------------
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatNonBreakingTitles(str) {
    return String(str || "").replace(/\b(Mr|Mrs|Ms|Dr|Sri|Smt|Shri)\.\s+/g, "$1.\u00a0");
  }

  function renderSplitWordsHtml(name) {
    const words = String(name || "").trim().split(/\s+/).filter(Boolean);
    return words
      .map((word) => {
        const chars = word
          .split("")
          .map((ch) => `<span class="km-hero__char">${escapeHtml(ch)}</span>`)
          .join("");
        return `<span class="km-hero__word">${chars}</span>`;
      })
      .join(" ");
  }

  function renderStyledCapAName(name) {
    const str = String(name || "");
    if (!str.includes("A")) return escapeHtml(str);
    return str
      .split(/(\s+)/)
      .map((part) => {
        if (part.startsWith("A")) {
          return `<span><span class="km-couple__cap-a">A</span>${escapeHtml(part.slice(1))}</span>`;
        }
        return escapeHtml(part);
      })
      .join("");
  }

  // ---------------------------------------------------------------------------
  // 1. POPULATE CONTENT FROM CONFIG.JS
  // ---------------------------------------------------------------------------
  if (cfg.pageTitle) {
    document.title = cfg.pageTitle;
  }

  const bride = (cfg.couple && cfg.couple.bride) || {};
  const groom = (cfg.couple && cfg.couple.groom) || {};
  const firstPerson = cfg.brideFirst !== false ? bride : groom;
  const secondPerson = cfg.brideFirst !== false ? groom : bride;

  // Entry Overlay
  const entryNamesEl = document.getElementById("entry-names");
  if (entryNamesEl) {
    const maxLen = Math.max((firstPerson.firstName || "").length, (secondPerson.firstName || "").length);
    if (maxLen > 12) entryNamesEl.classList.add("km-entry__names--xlong");
    else if (maxLen > 9) entryNamesEl.classList.add("km-entry__names--long");

    entryNamesEl.innerHTML = `${escapeHtml(firstPerson.firstName)}<span class="km-entry__amp km-font-serif" aria-hidden="true">&amp;</span>${escapeHtml(secondPerson.firstName)}`;
  }

  const entryDateEl = document.getElementById("entry-date");
  if (entryDateEl && cfg.wedding) {
    entryDateEl.textContent = cfg.wedding.entryDateDisplay || "";
  }
  const entryCityEl = document.getElementById("entry-city");
  if (entryCityEl && cfg.wedding) {
    entryCityEl.textContent = cfg.wedding.venueCity || "";
  }

  // Hero Section
  const heroInvocationEl = document.getElementById("hero-invocation");
  if (heroInvocationEl && cfg.invocationText) {
    heroInvocationEl.textContent = cfg.invocationText;
  }
  const heroFirstEl = document.getElementById("hero-first-name");
  if (heroFirstEl) {
    heroFirstEl.innerHTML = renderSplitWordsHtml(firstPerson.firstName);
  }
  const heroSecondEl = document.getElementById("hero-second-name");
  if (heroSecondEl) {
    heroSecondEl.innerHTML = renderSplitWordsHtml(secondPerson.firstName);
  }
  const heroDateEl = document.getElementById("hero-date");
  if (heroDateEl && cfg.wedding) {
    heroDateEl.textContent = cfg.wedding.heroDateDisplay || "";
  }
  const herovenueEl = document.getElementById("hero-venue");
  if (herovenueEl && cfg.wedding) {
    herovenueEl.textContent = cfg.wedding.venueCity || "";
  }

  // Couple Section
  const coupleHeadingEl = document.getElementById("couple-heading");
  if (coupleHeadingEl && cfg.couple && cfg.couple.sectionHeading) {
    coupleHeadingEl.textContent = cfg.couple.sectionHeading;
  }
  const coupleSubEl = document.getElementById("couple-sub");
  if (coupleSubEl && cfg.couple && cfg.couple.sectionSubtitle) {
    coupleSubEl.textContent = cfg.couple.sectionSubtitle;
  }

  const coupleUnitsRoot = document.getElementById("couple-units-root");
  if (coupleUnitsRoot) {
    const orderedUnits = [firstPerson, secondPerson];
    coupleUnitsRoot.innerHTML = orderedUnits
      .map((person, idx) => {
        const dividerHtml =
          idx === 1
            ? `<img class="km-couple__divider" src="assets/kalyana-mandapam/gold-divider.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />`
            : "";
        const mirrorClass = idx === 1 ? " km-couple__card--mirror" : "";
        const parentsFormatted = escapeHtml(formatNonBreakingTitles(person.parents || ""));
        return `
          <div class="km-couple__unit">
            ${dividerHtml}
            <div class="km-couple__card${mirrorClass}">
              <div class="km-couple__halo" aria-hidden="true"></div>
              <div class="km-couple__photo-window">
                <img class="km-couple__photo" src="${escapeHtml(person.photo)}" alt="${escapeHtml(person.fullName || person.firstName)}" loading="lazy" decoding="async" />
              </div>
              <img class="km-couple__ornament" src="assets/kalyana-mandapam/peacock-arch.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
            </div>
            <div class="km-couple__meta">
              <h3 class="km-couple__name km-font-script">${renderStyledCapAName(person.fullName || person.firstName)}</h3>
              ${person.parentLabel ? `<p class="km-couple__parent-label km-font-label">${escapeHtml(person.parentLabel)}</p>` : ""}
              ${person.parents ? `<p class="km-couple__parents km-font-serif">${parentsFormatted}</p>` : ""}
            </div>
          </div>
        `;
      })
      .join("");
  }

  // ---------------------------------------------------------------------------
  // 2. AUDIO & ENTRY OVERLAY INTERACTION
  // ---------------------------------------------------------------------------
  const bellBtn = document.getElementById("km-bell");
  const bellIcon = document.getElementById("km-bell-icon");
  let bgAudio = null;

  if (cfg.musicUrl) {
    bgAudio = new Audio(cfg.musicUrl);
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    bgAudio.preload = "auto";

    const updateBellState = (playing) => {
      if (!bellBtn || !bellIcon) return;
      bellBtn.classList.toggle("km-bell--playing", playing);
      bellBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      bellBtn.setAttribute("aria-label", playing ? "Mute background music" : "Play background music");
      bellIcon.src = playing
        ? "assets/kalyana-mandapam/km-audio-on.png"
        : "assets/kalyana-mandapam/km-audio-off.png";
    };

    bgAudio.addEventListener("play", () => updateBellState(true));
    bgAudio.addEventListener("pause", () => updateBellState(false));

    if (bellBtn) {
      bellBtn.addEventListener("click", () => {
        if (bgAudio.paused) {
          bgAudio.play().catch(() => { });
        } else {
          bgAudio.pause();
        }
      });
    }

    // Pause audio when tab is hidden, resume if it was playing
    let pausedByVisibility = false;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        if (bgAudio && !bgAudio.paused) {
          pausedByVisibility = true;
          bgAudio.pause();
        }
      } else if (document.visibilityState === "visible" && pausedByVisibility) {
        pausedByVisibility = false;
        bgAudio.play().catch(() => { });
      }
    });
  } else if (bellBtn) {
    bellBtn.style.display = "none";
  }

  // Lock body scroll while Entry Overlay is visible
  const entryEl = document.getElementById("km-entry");
  let entryClosing = false;
  document.body.style.overflow = "hidden";

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);

  function openInvitation() {
    if (entryClosing || !entryEl) return;
    entryClosing = true;
    entryEl.classList.add("km-entry--closing");

    if (bgAudio) {
      bgAudio.play().catch(() => { });
    }

    gsap
      .timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          window.scrollTo(0, 0);
          document.body.style.overflow = "";
          entryEl.style.display = "none";
          ScrollTrigger.refresh();
        }
      })
      .to(".km-entry__cta", { y: 10, opacity: 0, duration: 0.28, ease: "power2.in" })
      .to(".km-entry__names", { y: -18, opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.16")
      .to(".km-entry__label, .km-entry__meta", { y: -14, opacity: 0, duration: 0.34, ease: "power2.in" }, "<0.04")
      .to(".km-entry__bloom", { opacity: 1, scale: 1.6, duration: 0.55, ease: "power2.out" }, "-=0.2")
      .to(".km-entry__card", { scale: 1.12, opacity: 0, duration: 0.95, ease: "power2.inOut" }, "-=0.35")
      .to(".km-entry__bloom", { opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.6")
      .to(".km-entry__veil", { opacity: 0, duration: 0.55, ease: "power1.out" }, "-=0.55");
  }

  if (entryEl) {
    entryEl.addEventListener("click", openInvitation);
  }

  // ---------------------------------------------------------------------------
  // 3. LENIS SMOOTH SCROLL
  // ---------------------------------------------------------------------------
  if (window.Lenis && !reducedMotion) {
    const lenis = new Lenis({
      duration: 1.18,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      touchMultiplier: 1.24,
      wheelMultiplier: 0.92
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // ---------------------------------------------------------------------------
  // 4. HERO VIDEO CANVAS & GSAP ANIMATIONS
  // ---------------------------------------------------------------------------
  (function initHero() {
    const heroSection = document.getElementById("km-hero");
    const videoWrap = document.getElementById("km-hero-video-wrap");
    const video = document.getElementById("km-hero-video");
    const canvas = document.getElementById("km-hero-canvas");
    const srcHevc = document.getElementById("km-video-src-hevc");
    const srcMp4 = document.getElementById("km-video-src-mp4");

    if (!heroSection || !video || !canvas || !videoWrap) return;

    if (window.innerWidth >= 900) {
      if (srcHevc) srcHevc.src = "assets/kalyana-mandapam/hero-procession-bg-2x-hevc.mp4";
      if (srcMp4) srcMp4.src = "assets/kalyana-mandapam/hero-procession-bg-2x-v2.mp4";
    }

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    let readyTriggered = false;
    let hasVideoFrame = false;
    let posterImg = new Image();

    function triggerHeroIntro() {
      if (readyTriggered) return;
      readyTriggered = true;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(".km-hero__invocation", { y: 14, opacity: 0, duration: 0.6, delay: 0.1 })
        .from(
          ".km-hero__groom .km-hero__char",
          {
            y: 40,
            opacity: 0,
            rotateX: -30,
            scale: 0.85,
            filter: "blur(8px)",
            stagger: 0.05,
            duration: 0.85,
            ease: "back.out(1.6)"
          },
          "-=0.2"
        )
        .from(".km-hero__amp", { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(2)" }, "-=0.2")
        .from(
          ".km-hero__bride .km-hero__char",
          {
            y: 40,
            opacity: 0,
            rotateX: -30,
            scale: 0.85,
            filter: "blur(8px)",
            stagger: 0.05,
            duration: 0.85,
            ease: "back.out(1.6)"
          },
          "-=0.15"
        )
        .from(".km-hero__date", { y: 10, opacity: 0, duration: 0.5 }, "-=0.2")
        .from(".km-hero__venue", { opacity: 0, duration: 0.6 }, "-=0.1");

      gsap.to(".km-hero__video", {
        yPercent: 12,
        scale: 1.06,
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1.2
        },
        ease: "none"
      });

      gsap.to(".km-hero__content", {
        yPercent: -18,
        opacity: 0.4,
        scrollTrigger: {
          trigger: heroSection,
          start: "20% top",
          end: "bottom top",
          scrub: 1
        },
        ease: "none"
      });
    }

    function drawCover(source, sw, sh) {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / sw, ch / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      ctx.drawImage(source, 0, 0, sw, sh, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    function renderVideoFrame() {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw && vh) {
        hasVideoFrame = true;
        drawCover(video, vw, vh);
        triggerHeroIntro();
        if (!video.paused && video.duration && video.duration - video.currentTime <= 0.09) {
          video.currentTime = 0;
        }
      }
    }

    function resizeCanvas() {
      const rect = videoWrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (hasVideoFrame && video.videoWidth) {
        renderVideoFrame();
      } else if (posterImg.complete && posterImg.naturalWidth) {
        drawCover(posterImg, posterImg.naturalWidth, posterImg.naturalHeight);
        triggerHeroIntro();
      }
    }

    posterImg.onload = () => {
      if (!hasVideoFrame && posterImg.naturalWidth) {
        drawCover(posterImg, posterImg.naturalWidth, posterImg.naturalHeight);
        triggerHeroIntro();
      }
    };
    posterImg.src = "assets/kalyana-mandapam/hero-poster.jpg";

    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(videoWrap);
    resizeCanvas();

    const hasRVFC = typeof video.requestVideoFrameCallback === "function";
    function loopDraw() {
      renderVideoFrame();
      if (hasRVFC) {
        video.requestVideoFrameCallback(loopDraw);
      } else {
        requestAnimationFrame(loopDraw);
      }
    }

    video.addEventListener("loadeddata", renderVideoFrame);
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.play().catch(() => { });
    });

    video.load();
    video.muted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {
        const startOnGesture = () => {
          video.play().catch(() => { });
          window.removeEventListener("click", startOnGesture);
          window.removeEventListener("touchstart", startOnGesture);
        };
        window.addEventListener("click", startOnGesture, { passive: true });
        window.addEventListener("touchstart", startOnGesture, { passive: true });
      });
    }
    loopDraw();
  })();

  // ---------------------------------------------------------------------------
  // 5. COUPLE SECTION ANIMATIONS
  // ---------------------------------------------------------------------------
  (function initCoupleAnimations() {
    const coupleSection = document.getElementById("km-couple");
    if (!coupleSection) return;

    gsap.from(".km-couple__heading, .km-couple__sub", {
      scrollTrigger: { trigger: coupleSection, start: "top 75%" },
      y: 24,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.utils.toArray(".km-couple__unit").forEach((unit) => {
      const card = unit.querySelector(".km-couple__card");
      if (card) {
        gsap.from(card, {
          scrollTrigger: { trigger: unit, start: "top 82%" },
          y: 36,
          opacity: 0,
          scale: 0.95,
          duration: 1,
          ease: "power3.out"
        });
      }
      const meta = unit.querySelector(".km-couple__meta");
      if (meta) {
        gsap.from(meta.children, {
          scrollTrigger: { trigger: meta, start: "top 88%" },
          y: 16,
          opacity: 0,
          stagger: 0.09,
          duration: 0.6,
          ease: "power2.out"
        });
      }
    });

    const divider = coupleSection.querySelector(".km-couple__divider");
    if (divider) {
      gsap.from(divider, {
        scrollTrigger: { trigger: divider, start: "top 90%" },
        scaleX: 0.4,
        opacity: 0,
        duration: 0.9,
        ease: "power2.out"
      });
    }

    gsap.utils.toArray(".km-couple__scenery").forEach((scenery, idx) => {
      gsap.to(scenery, {
        yPercent: idx === 0 ? -2.5 : 2.5,
        scrollTrigger: {
          trigger: coupleSection,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.8
        },
        ease: "none"
      });

      if (!reducedMotion) {
        gsap.to(scenery, {
          x: idx === 0 ? 7 : -7,
          duration: 27 + 8 * idx,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
        gsap.fromTo(
          scenery,
          { opacity: 0.5 },
          {
            opacity: 0.62,
            duration: 13 + 4 * idx,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 5 * idx
          }
        );
      }
    });

    if (!reducedMotion) {
      gsap.utils.toArray(".km-couple__bird").forEach((bird, idx) => {
        const dur = 38 + 11 * idx;
        gsap.set(bird, { left: "-6%" });
        gsap.fromTo(
          bird,
          { x: 0 },
          { x: "110vw", duration: dur, ease: "none", repeat: -1, delay: 13 * idx }
        );
        gsap.to(bird, {
          y: 9,
          duration: 4.6 + 1.3 * idx,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
        gsap.fromTo(
          bird,
          { opacity: 0 },
          {
            keyframes: [
              { opacity: 0.55, duration: 0.12 * dur },
              { opacity: 0.55, duration: 0.72 * dur },
              { opacity: 0, duration: 0.16 * dur }
            ],
            repeat: -1,
            delay: 13 * idx
          }
        );
      });

      gsap.utils.toArray(".km-couple__halo").forEach((halo, idx) => {
        gsap.fromTo(
          halo,
          { scale: 1, opacity: 0.55 },
          {
            scale: 1.12,
            opacity: 0.9,
            duration: 4.6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.7 * idx
          }
        );
      });
    }
  })();

  // ---------------------------------------------------------------------------
  // 6. COUNTDOWN SECTION
  // ---------------------------------------------------------------------------
  (function initCountdown() {
    const cdSection = document.getElementById("km-countdown");
    const stage = document.getElementById("countdown-stage");
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minutesEl = document.getElementById("cd-minutes");
    const secondsEl = document.getElementById("cd-seconds");
    if (!cdSection || !stage) return;

    const targetTime = new Date(
      (cfg.wedding && cfg.wedding.countdownTargetIso) || "2026-11-22T10:17:00"
    ).getTime();

    let prev = { days: null, hours: null, minutes: null, seconds: null };

    function pad2(n) {
      return String(n).padStart(2, "0");
    }

    function updateCountdown() {
      const now = Date.now();
      const diffSec = Math.floor((targetTime - now) / 1000);

      if (diffSec <= 0) {
        stage.innerHTML = `
          <img class="km-countdown__panel" src="assets/kalyana-mandapam/countdown-wall.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <p class="km-countdown__arrived km-font-script">The sacred hour has arrived</p>
        `;
        return;
      }

      const d = String(Math.floor(diffSec / 86400));
      const h = pad2(Math.floor((diffSec % 86400) / 3600));
      const m = pad2(Math.floor((diffSec % 3600) / 60));
      const s = pad2(diffSec % 60);

      const next = { days: d, hours: h, minutes: m, seconds: s };
      const mapEl = { days: daysEl, hours: hoursEl, minutes: minutesEl, seconds: secondsEl };

      ["days", "hours", "minutes", "seconds"].forEach((key) => {
        const el = mapEl[key];
        if (el && prev[key] !== next[key]) {
          el.textContent = next[key];
          if (prev[key] !== null && !reducedMotion) {
            gsap.fromTo(
              el,
              { y: -5, opacity: 0.55, filter: "blur(2px)" },
              { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.38, ease: "power2.out" }
            );
          }
        }
      });

      prev = next;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    if (!reducedMotion) {
      gsap
        .timeline({ scrollTrigger: { trigger: cdSection, start: "top 80%" } })
        .from(".km-countdown__unit", {
          y: 12,
          opacity: 0,
          filter: "blur(4px)",
          stagger: 0.12,
          duration: 0.7,
          ease: "power3.out"
        });
    }
  })();

  // ---------------------------------------------------------------------------
  // 7. THE WEDDING JOURNEY (EVENTS PATH, FOOTPRINTS, SCROLL EFFECTS)
  // ---------------------------------------------------------------------------
  (function initEvents() {
    const eventsSection = document.getElementById("km-events");
    const stage = document.getElementById("events-stage");
    const svg = document.getElementById("events-svg");
    const pathEl = document.getElementById("events-path");
    const footprintsRoot = document.getElementById("events-footprints-root");
    const stopsRoot = document.getElementById("events-stops-root");

    if (!eventsSection || !stage || !svg || !pathEl || !footprintsRoot || !stopsRoot) return;

    const eventsList = Array.isArray(cfg.events) ? cfg.events : [];
    if (eventsList.length === 0) {
      eventsSection.style.display = "none";
      return;
    }

    const headingEl = document.getElementById("events-heading");
    if (headingEl && cfg.eventsHeading) headingEl.textContent = cfg.eventsHeading;
    const subEl = document.getElementById("events-sub");
    if (subEl && cfg.eventsSubtitle) subEl.textContent = cfg.eventsSubtitle;

    const iconMap = {
      haldi: "haldi-bowl",
      "pasupu-kotnam": "pasupu-kotnam",
      "bonalu-pellikuthuru": "bonalu-pellikuthuru",
      bonalu: "bonalu-pellikuthuru",
      pellikuthuru: "pelli-seat",
      pellikoduku: "pelli-seat",
      mehendi: "mehendi",
      mehndi: "mehendi",
      sangeet: "sangeet-music",
      wedding: "nadaswaram",
      muhurtham: "nadaswaram",
      reception: "reception-sofa",
      engagement: "engagement-betel",
      madhurumveppu: "sweets",
      pooja: "pooja-plate",
      "ganesh-puja": "pooja-plate",
      other: "lotus"
    };

    // Build SVG curve geometry exactly matching original formula
    const count = Math.max(eventsList.length, 1);
    const stepY = 250;
    const bottomPad = 96;
    const r = 112;
    const s = stepY / 2;
    const anchors = Array.from({ length: count }, (_, i) => ({
      x: i % 2 === 0 ? 118 : 282,
      y: r + i * stepY + s,
      side: i % 2 === 0 ? "left" : "right"
    }));
    const height = anchors[anchors.length - 1].y + bottomPad;
    const startPt = { x: 200, y: r - 60 };
    const endPt = { x: 200, y: height };
    const pts = [startPt, ...anchors, endPt];

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const midY = (p0.y + p1.y) / 2;
      d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
    }

    stage.style.aspectRatio = `400 / ${height}`;
    svg.setAttribute("viewBox", `0 0 400 ${height}`);
    pathEl.setAttribute("d", d);

    // Render event stop cards
    stopsRoot.innerHTML = eventsList
      .map((ev, i) => {
        const anchor = anchors[i];
        const typeKey = String(ev.type || "other").toLowerCase();
        const artFile = iconMap[typeKey] || "lotus";
        const topPct = (anchor.y / height) * 100;
        const leftPct = (anchor.x / 400) * 100;

        // Split event name into words & chars for character reveal animation
        const splitNameHtml = String(ev.name || "")
          .trim()
          .split(/(\s+)/)
          .map((token) => {
            if (/^\s+$/.test(token)) return token;
            return token
              .split("")
              .map((ch) => `<span class="km-events__char">${escapeHtml(ch)}</span>`)
              .join("");
          })
          .join("");

        const formattedTime = String(ev.time || "")
          .replace(/(\d{1,2}:\d{2})\s+(AM|PM)/gi, "$1\u00a0$2");

        const mapUrl =
          ev.mapLink ||
          (ev.venue
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.venue)}`
            : null);

        return `
          <div class="km-events__stop km-events__stop--${anchor.side}" style="top:${topPct}%">
            <div class="km-events__medallion" style="left:${leftPct}%" aria-hidden="true">
              <img class="km-events__medallion-art" src="assets/kalyana-mandapam/events/${artFile}.png" alt="" loading="lazy" decoding="async" />
            </div>
            <div class="km-events__card">
              <div class="km-events__card-head">
                <h3 class="km-events__name km-font-heading">${splitNameHtml}</h3>
              </div>
              ${ev.date || ev.time
            ? `<p class="km-events__when km-font-serif">
                      <span class="km-events__when-date">${escapeHtml(ev.date)}</span>
                      ${ev.date && ev.time ? `<span class="km-events__when-sep" aria-hidden="true"> · </span>` : ""}
                      <span class="km-events__when-time">${escapeHtml(formattedTime)}</span>
                    </p>`
            : ""
          }
              ${ev.venue ? `<p class="km-events__venue km-font-serif">${escapeHtml(ev.venue)}</p>` : ""}
              ${ev.dressCode ? `<p class="km-events__dress km-font-serif">${escapeHtml(ev.dressCode)}</p>` : ""}
              ${mapUrl
            ? `<a class="km-events__map km-font-label" href="${escapeHtml(mapUrl)}" target="_blank" rel="noopener noreferrer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin" aria-hidden="true">
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>View Map
                    </a>`
            : ""
          }
            </div>
          </div>
        `;
      })
      .join("");

    // Calculate yatra footprints along the SVG path
    const totalLen = pathEl.getTotalLength();
    const footprints = [];
    {
      const p0 = pathEl.getPointAtLength(0);
      const p1 = pathEl.getPointAtLength(1);
      let dx = p1.x - p0.x;
      let dy = p1.y - p0.y;
      const dist = Math.hypot(dx, dy) || 1;
      dx /= dist;
      dy /= dist;
      const angle = (180 * Math.atan2(dy, dx)) / Math.PI + 90;
      ["left", "right"].forEach((side) => {
        const offset = 6 * (side === "left" ? 1 : -1);
        footprints.push({
          side,
          xPct: ((p0.x + dy * offset) / 400) * 100,
          yPct: ((p0.y - dx * offset) / height) * 100,
          angle,
          frac: 0
        });
      });
    }

    let lastAnchorLen = totalLen;
    {
      const lastAnchor = anchors[anchors.length - 1];
      let minDistSq = Infinity;
      for (let i = 0; i <= 400; i++) {
        const l = (i / 400) * totalLen;
        const pt = pathEl.getPointAtLength(l);
        const dSq = (pt.x - lastAnchor.x) ** 2 + (pt.y - lastAnchor.y) ** 2;
        if (dSq < minDistSq) {
          minDistSq = dSq;
          lastAnchorLen = l;
        }
      }
    }

    for (let l = 35.2, stepIdx = 0; l < lastAnchorLen; l += 22, stepIdx++) {
      const pt = pathEl.getPointAtLength(l);
      const ptNext = pathEl.getPointAtLength(Math.min(l + 1, totalLen));
      let dx = ptNext.x - pt.x;
      let dy = ptNext.y - pt.y;
      const dist = Math.hypot(dx, dy) || 1;
      dx /= dist;
      dy /= dist;
      const side = stepIdx % 2 === 0 ? "left" : "right";
      const offset = 6 * (side === "left" ? 1 : -1);
      footprints.push({
        side,
        xPct: ((pt.x + dy * offset) / 400) * 100,
        yPct: ((pt.y - dx * offset) / height) * 100,
        angle: (180 * Math.atan2(dy, dx)) / Math.PI + 90,
        frac: l / totalLen
      });
    }

    footprintsRoot.innerHTML = footprints
      .map(
        (fp, idx) => `
        <img
          class="km-events__foot km-events__foot--${fp.side}"
          data-frac="${fp.frac}"
          style="left:${fp.xPct}%;top:${fp.yPct}%;transform:translate(-50%, -50%) rotate(${fp.angle}deg);transition-delay:${(idx % 2) * 40}ms"
          src="assets/kalyana-mandapam/yatra-foot-${fp.side}.png"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />`
      )
      .join("");

    // Scroll animations for stops, footprints, and kolam parallax
    const stopEls = gsap.utils.toArray(".km-events__stop", eventsSection);
    const footEls = gsap.utils.toArray(".km-events__foot", eventsSection);
    const kolamEl = eventsSection.querySelector(".km-events__kolam");

    if (reducedMotion) {
      stopEls.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      footEls.forEach((el) => {
        el.style.opacity = "0.85";
      });
      return;
    }

    const lerp = (t, a, b, outMin, outMax) =>
      outMin + (outMax - outMin) * Math.min(1, Math.max(0, (t - a) / (b - a)));

    const stopControllers = stopEls.map((el) => {
      const setScaleX = gsap.quickSetter(el, "scaleX");
      const setScaleY = gsap.quickSetter(el, "scaleY");
      const chars = el.querySelectorAll(".km-events__char");
      const card = el.querySelector(".km-events__card");
      gsap.set(chars, { yPercent: 60, opacity: 0 });
      return {
        el,
        y: gsap.quickSetter(el, "y", "px"),
        scale: (v) => {
          setScaleX(v);
          setScaleY(v);
        },
        opacity: gsap.quickSetter(el, "opacity"),
        centre: 0,
        revealed: false,
        chars,
        card
      };
    });

    const footControllers = footEls.map((el) => ({
      el,
      frac: parseFloat(el.dataset.frac || "0"),
      landed: false,
      top: 0
    }));

    function measurePositions() {
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      stopControllers.forEach((s) => {
        s.centre = stageTop + s.el.offsetTop + s.el.offsetHeight / 2;
      });
      footControllers.forEach((f) => {
        f.top = stageTop + f.el.offsetTop;
      });
    }

    measurePositions();
    ScrollTrigger.addEventListener("refreshInit", measurePositions);
    window.addEventListener("resize", measurePositions);

    stopControllers.forEach((s) => {
      s.y(34);
      s.scale(0.94);
      s.opacity(0.38);
    });

    const charObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const item = stopControllers.find((s) => s.card === entry.target);
          if (item && !item.revealed) {
            item.revealed = true;
            charObserver.unobserve(entry.target);
            gsap.to(item.chars, {
              yPercent: 0,
              opacity: 1,
              duration: 0.75,
              ease: arrivalEase,
              stagger: 0.022,
              overwrite: "auto"
            });
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );

    stopControllers.forEach((s) => {
      if (s.card) charObserver.observe(s.card);
    });

    let sectionVisible = false;
    let forceTick = true;
    let lastScrollY = window.scrollY;
    let skewVelocity = 0;

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        sectionVisible = entries[0].isIntersecting;
        if (sectionVisible) {
          measurePositions();
          lastScrollY = window.scrollY;
          forceTick = true;
        }
      },
      { rootMargin: "60% 0px 60% 0px" }
    );
    sectionObserver.observe(eventsSection);

    gsap.ticker.add(() => {
      if (!sectionVisible) return;
      const scrollY = window.scrollY;
      if (scrollY === lastScrollY && Math.abs(skewVelocity) <= 0.01 && !forceTick) return;
      forceTick = false;

      const vh = window.innerHeight;
      const viewCenter = scrollY + vh / 2;

      for (let i = 0; i < stopControllers.length; i++) {
        const s = stopControllers[i];
        const offset = s.centre - viewCenter;
        if (offset > 1.15 * vh || offset < -1.15 * vh) continue;
        const norm = Math.min(1, Math.max(0, Math.abs(offset) / vh - 0.3) / 0.55);
        let ty, sc, op;
        if (offset >= 0) {
          ty = lerp(norm, 0, 1, 0, 34);
          sc = lerp(norm, 0, 1, 1, 0.94);
          op = lerp(norm, 0, 1, 1, 0.38);
        } else {
          ty = lerp(norm, 0, 1, 0, -12);
          sc = lerp(norm, 0, 1, 1, 0.99);
          op = lerp(norm, 0, 1, 1, 0.62);
        }
        s.y(ty);
        s.scale(sc);
        s.opacity(op);
      }

      for (let i = 0; i < footControllers.length; i++) {
        const f = footControllers[i];
        if (!f.landed && f.top - scrollY < 0.92 * vh) {
          f.landed = true;
          gsap.fromTo(
            f.el,
            { opacity: 0, scale: 0.72, rotate: "-=8" },
            { opacity: 0.85, scale: 1, rotate: "+=8", duration: 0.5, ease: arrivalEase }
          );
        }
      }

      if (kolamEl) {
        gsap.set(kolamEl, { backgroundPositionY: `${0.06 * scrollY}px` });
      }

      const delta = scrollY - lastScrollY;
      lastScrollY = scrollY;
      const targetSkew = gsap.utils.clamp(-2.5, 2.5, delta / 9);
      skewVelocity += (targetSkew - skewVelocity) * 0.12;
      if (Math.abs(skewVelocity) > 0.01) {
        gsap.set(stage, { skewY: skewVelocity });
      }
    });
  })();

  // ---------------------------------------------------------------------------
  // 8. PHOTO GALLERY & LIGHTBOX
  // ---------------------------------------------------------------------------
  (function initGallery() {
    const gallerySection = document.getElementById("km-gallery");
    const gridEl = document.getElementById("gallery-grid");
    if (!gallerySection || !gridEl) return;

    const photos = Array.isArray(cfg.galleryPhotos) ? cfg.galleryPhotos : [];
    if (photos.length === 0) {
      gallerySection.style.display = "none";
      return;
    }

    const headingEl = document.getElementById("gallery-heading");
    if (headingEl && cfg.galleryHeading) headingEl.textContent = cfg.galleryHeading;
    const subEl = document.getElementById("gallery-sub");
    if (subEl && cfg.gallerySubtitle) subEl.textContent = cfg.gallerySubtitle;

    gridEl.innerHTML = photos
      .map((src, idx) => {
        const isFeature =
          idx === 0 || (idx === photos.length - 1 && (photos.length - 1) % 2 === 1);
        const col = isFeature ? 0 : idx % 2;
        return `
          <button
            type="button"
            data-col="${col}"
            data-idx="${idx}"
            class="km-gallery__cell${isFeature ? " km-gallery__cell--feature" : ""}"
            aria-label="Open photo ${idx + 1} of ${photos.length}"
          >
            <img
              alt=""
              loading="lazy"
              decoding="async"
              class="km-gallery__img"
              style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent"
              src="${escapeHtml(src)}"
            />
            <span class="km-gallery__frame" aria-hidden="true"></span>
          </button>
        `;
      })
      .join("");

    const cells = Array.from(gridEl.querySelectorAll(".km-gallery__cell"));
    if (reducedMotion) {
      cells.forEach((c) => c.classList.add("is-revealed"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const cell = entry.target;
            const delay = 90 * (Number(cell.dataset.col) || 0);
            window.setTimeout(() => cell.classList.add("is-revealed"), delay);
            revealObserver.unobserve(cell);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.01 }
      );
      cells.forEach((c) => revealObserver.observe(c));

      gsap.from(".km-gallery__heading, .km-gallery__sub", {
        scrollTrigger: { trigger: gallerySection, start: "top 82%" },
        y: 22,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out"
      });

      const parasol = gallerySection.querySelector(".km-gallery__parasol");
      if (parasol) {
        gsap.set(parasol, { scaleX: 1 });
        gsap.fromTo(
          parasol,
          { y: 0 },
          {
            y: () =>
              Math.max(
                0,
                gallerySection.offsetHeight - parasol.offsetHeight - 2 * parasol.offsetTop
              ),
            ease: "none",
            scrollTrigger: {
              trigger: gallerySection,
              start: "top 78%",
              end: "bottom bottom",
              scrub: 1.6,
              invalidateOnRefresh: true
            }
          }
        );
      }

      gsap.utils.toArray(".km-gallery__mote").forEach((mote, idx) => {
        const dur = 7 + (idx % 5) * 2.4;
        const delay = (idx % 7) * 1.15;
        gsap.to(mote, {
          keyframes: [
            { opacity: 0.55, duration: 0.28 * dur },
            { opacity: 0.55, duration: 0.42 * dur },
            { opacity: 0, duration: 0.3 * dur }
          ],
          repeat: -1,
          delay
        });
        gsap.to(mote, {
          y: idx % 2 === 0 ? -26 : -38,
          x: idx % 3 === 0 ? 14 : -11,
          duration: dur,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay
        });
      });

      gsap.utils.toArray(".km-gallery__img").forEach((img) => {
        gsap.fromTo(
          img,
          { yPercent: -3.5 },
          {
            yPercent: 3.5,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest(".km-gallery__cell"),
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1
            }
          }
        );
      });
    }

    // Lightbox Viewer
    const lightbox = document.getElementById("km-lightbox");
    const lbImg = document.getElementById("lightbox-img");
    const lbClose = document.getElementById("lightbox-close");
    const lbPrev = document.getElementById("lightbox-prev");
    const lbNext = document.getElementById("lightbox-next");
    const lbCounter = document.getElementById("lightbox-counter");
    let currentIndex = -1;

    function showPhoto(idx) {
      if (!lightbox || !lbImg || photos.length === 0) return;
      currentIndex = (idx + photos.length) % photos.length;
      lbImg.src = photos[currentIndex];
      if (lbCounter) {
        lbCounter.textContent = `${currentIndex + 1} / ${photos.length}`;
      }
      lightbox.classList.add("is-open");
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-open");
      currentIndex = -1;
    }

    cells.forEach((cell) => {
      cell.addEventListener("click", () => {
        showPhoto(Number(cell.dataset.idx) || 0);
      });
    });

    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", (e) => { e.stopPropagation(); showPhoto(currentIndex - 1); });
    if (lbNext) lbNext.addEventListener("click", (e) => { e.stopPropagation(); showPhoto(currentIndex + 1); });
    if (lightbox) {
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
      });
    }
    window.addEventListener("keydown", (e) => {
      if (currentIndex < 0) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPhoto(currentIndex - 1);
      if (e.key === "ArrowRight") showPhoto(currentIndex + 1);
    });
  })();

  // ---------------------------------------------------------------------------
  // 9. RSVP SECTION
  // ---------------------------------------------------------------------------
  (function initRsvp() {
    const rsvpSection = document.getElementById("km-rsvp");
    if (!rsvpSection) return;

    const rsvpCfg = cfg.rsvp || {};
    if (rsvpCfg.enabled === false) {
      rsvpSection.style.display = "none";
      return;
    }

    const headingEl = document.getElementById("rsvp-heading");
    if (headingEl && rsvpCfg.heading) headingEl.textContent = rsvpCfg.heading;
    const subEl = document.getElementById("rsvp-sub");
    if (subEl && rsvpCfg.subtitle) subEl.textContent = rsvpCfg.subtitle;
    const noteEl = document.getElementById("rsvp-note");
    if (noteEl) {
      if (rsvpCfg.deadlineNote) {
        noteEl.textContent = rsvpCfg.deadlineNote;
      } else {
        noteEl.style.display = "none";
      }
    }

    const btnYes = document.getElementById("rsvp-choice-yes");
    const btnNo = document.getElementById("rsvp-choice-no");
    const revealWrap = document.getElementById("rsvp-reveal");
    const countsWrap = document.getElementById("rsvp-counts-wrap");
    const eventsWrap = document.getElementById("rsvp-events-wrap");
    const nameInput = document.getElementById("km-rsvp-name");
    const adultsInput = document.getElementById("km-rsvp-adults");
    const kidsInput = document.getElementById("km-rsvp-kids");
    const submitBtn = document.getElementById("rsvp-submit");
    const form = document.getElementById("rsvp-form");
    const doneWrap = document.getElementById("rsvp-done");
    const doneTitle = document.getElementById("rsvp-done-title");
    const doneBody = document.getElementById("rsvp-done-body");

    let attending = null;
    const selectedEvents = new Set();
    const eventsList = Array.isArray(cfg.events) ? cfg.events : [];

    if (eventsWrap && eventsList.length > 1) {
      eventsWrap.innerHTML = eventsList
        .map(
          (ev, idx) =>
            `<button type="button" class="km-rsvp__event" data-ev="${escapeHtml(ev.name)}" aria-pressed="false">${escapeHtml(ev.name)}</button>`
        )
        .join("");

      eventsWrap.querySelectorAll(".km-rsvp__event").forEach((btn) => {
        btn.addEventListener("click", () => {
          const evName = btn.dataset.ev;
          if (selectedEvents.has(evName)) {
            selectedEvents.delete(evName);
            btn.classList.remove("is-on");
            btn.setAttribute("aria-pressed", "false");
          } else {
            selectedEvents.add(evName);
            btn.classList.add("is-on");
            btn.setAttribute("aria-pressed", "true");
          }
        });
      });
    } else if (eventsWrap) {
      eventsWrap.style.display = "none";
    }

    function renderMarkerSvg(isOn) {
      return `
        <path d="M8 1 L15 8 L8 15 L1 8 Z" fill="${isOn ? "var(--km-maroon)" : "none"}" stroke="var(--km-gold)" stroke-width="1.2"></path>
        ${isOn ? `<path d="M8 4.4 L11.6 8 L8 11.6 L4.4 8 Z" fill="#fbeeb8"></path>` : ""}
      `;
    }

    function updateValidation() {
      const hasName = nameInput && nameInput.value.trim().length > 0;
      if (submitBtn) {
        submitBtn.disabled = attending === null || !hasName;
      }
    }

    function setAttendingChoice(val) {
      attending = val;
      if (btnYes) {
        btnYes.classList.toggle("is-on", val === true);
        btnYes.setAttribute("aria-pressed", val === true ? "true" : "false");
        const svgYes = btnYes.querySelector("svg");
        if (svgYes) svgYes.innerHTML = renderMarkerSvg(val === true);
      }
      if (btnNo) {
        btnNo.classList.toggle("is-on", val === false);
        btnNo.setAttribute("aria-pressed", val === false ? "true" : "false");
        const svgNo = btnNo.querySelector("svg");
        if (svgNo) svgNo.innerHTML = renderMarkerSvg(val === false);
      }
      if (revealWrap) {
        revealWrap.style.display = "flex";
      }
      if (countsWrap) {
        countsWrap.style.display = val === true ? "grid" : "none";
      }
      if (eventsWrap && eventsList.length > 1) {
        eventsWrap.style.display = val === true ? "flex" : "none";
      }
      updateValidation();
    }

    if (btnYes) btnYes.addEventListener("click", () => setAttendingChoice(true));
    if (btnNo) btnNo.addEventListener("click", () => setAttendingChoice(false));
    if (nameInput) nameInput.addEventListener("input", updateValidation);

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (attending === null || !nameInput.value.trim()) return;

        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";

        const payload = {
          name: nameInput.value.trim(),
          attending,
          adults: attending ? adultsInput.value : "0",
          children: attending ? kidsInput.value : "0",
          events: attending ? Array.from(selectedEvents) : []
        };

        if (rsvpCfg.webhookUrl) {
          try {
            await fetch(rsvpCfg.webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify(payload)
            });
          } catch (_) { }
        }

        form.style.display = "none";
        if (doneWrap) {
          if (doneTitle) {
            doneTitle.textContent = attending ? "We are blessed." : "You will be missed.";
          }
          if (doneBody) {
            doneBody.textContent = attending
              ? "Thank you. We will be looking for you at the mandapam."
              : "Thank you for letting us know. Your blessings reach us all the same.";
          }
          doneWrap.style.display = "block";
          doneWrap.focus();
        }
      });
    }

    if (!reducedMotion) {
      gsap.from(".km-rsvp__heading, .km-rsvp__sub", {
        scrollTrigger: { trigger: rsvpSection, start: "top 80%" },
        y: 22,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out"
      });
      gsap.from(".km-rsvp__slip", {
        scrollTrigger: { trigger: ".km-rsvp__slip", start: "top 88%" },
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out"
      });
    }
  })();

  // ---------------------------------------------------------------------------
  // 10. FOOTER SECTION
  // ---------------------------------------------------------------------------
  (function initFooter() {
    const footerEl = document.getElementById("km-footer");
    if (!footerEl) return;

    const fCfg = cfg.footer || {};
    const leadEl = document.getElementById("footer-lead");
    const mainEl = document.getElementById("footer-main");
    const markEl = document.getElementById("footer-mark");
    const creditEl = document.getElementById("footer-credit");

    if (leadEl && fCfg.leadText) leadEl.textContent = fCfg.leadText;
    if (mainEl && fCfg.mainText) mainEl.textContent = fCfg.mainText;
    if (markEl && fCfg.teluguBlessing) markEl.textContent = fCfg.teluguBlessing;
    if (creditEl && fCfg.showCredit === false) {
      creditEl.style.display = "none";
    }
  })();
})();
