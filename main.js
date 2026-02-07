const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Custom cursor: small filled dot → larger stroke ring on hover */
(function initCustomCursor() {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor || REDUCED_MOTION) { if (cursor) cursor.style.display = "none"; return; }

  let mx = -100, my = -100;
  let cx = -100, cy = -100;

  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
  document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { cursor.style.opacity = "1"; });

  const hoverTargets = "a, button, [role='button'], input, textarea, select, label, .bento__card";
  const cursorLabel = document.getElementById("cursor-label");
  const aboutCard = document.getElementById("about-card");
  let insideAbout = false;

  document.addEventListener("mouseover", (e) => {
    if (aboutCard && e.target.closest("#about-card")) {
      insideAbout = true;
      cursor.classList.remove("is-hover");
      cursor.classList.add("is-about");
      return;
    }
    if (e.target.closest(hoverTargets)) cursor.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (aboutCard && e.target.closest("#about-card")) {
      insideAbout = false;
      cursor.classList.remove("is-about");
      cursorLabel.innerHTML = "";
    }
    if (e.target.closest(hoverTargets)) cursor.classList.remove("is-hover");
  });

  if (aboutCard) {
    aboutCard.addEventListener("mousemove", (e) => {
      if (!insideAbout) return;
      const rect = aboutCard.getBoundingClientRect();
      const isLeft = (e.clientX - rect.left) < rect.width / 2;
      const name = isLeft ? aboutCard.dataset.nameLeft : aboutCard.dataset.nameRight;
      const role = isLeft ? aboutCard.dataset.roleLeft : aboutCard.dataset.roleRight;
      cursorLabel.innerHTML = `${name}<br>${role}`;
    });
    aboutCard.addEventListener("click", (e) => {
      e.preventDefault();
      const rect = aboutCard.getBoundingClientRect();
      const isLeft = (e.clientX - rect.left) < rect.width / 2;
      const link = isLeft ? aboutCard.dataset.linkLeft : aboutCard.dataset.linkRight;
      if (link && link !== "#") window.open(link, "_blank");
    });
  }

  function tick() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

const hero = document.getElementById("hero");
const footer = document.getElementById("footer");
const fixedHeader = document.getElementById("fixed-header");
const heroTextLeft = document.getElementById("hero-text-left");
const heroTextRight = document.getElementById("hero-text-right");
const heroMediaWrap = document.getElementById("hero-media-wrap");
const wordSwapSection = document.getElementById("features");
const wordSwapPin = document.getElementById("word-swap-pin");
const wordSwapSlides = document.querySelectorAll(".word-swap__slide");
const wordSwapDots = document.querySelectorAll(".word-swap__dot");

/** Shape overlays (3 path layers) for features section - scroll-driven wave like template */
let shapeOverlaysPaths = [];
let shapeOverlaysAllPoints = [];
let shapeOverlaysPointsDelay = []; // per-point delay for wave stagger (0..delayPointsMax)
const SHAPE_NUM_POINTS = 10;
const SHAPE_NUM_PATHS = 5;
const SHAPE_DELAY_POINTS_MAX = 0.35; // max delay per point (fraction of segment)
const SHAPE_POINT_DURATION = 0.25;  // how long each point takes to go 100→0 (fraction of segment)

/** Nav load animation: nav texts fade in first, then nav line, logo rotates with ease-out */
function initNavLoadAnimation() {
  if (!fixedHeader || REDUCED_MOTION) return;
  const gsap = window.gsap;
  if (!gsap) return;

  const nav = fixedHeader.querySelector(".fixed-header__nav");
  const links = fixedHeader.querySelectorAll(".fixed-header__link");
  const logo = fixedHeader.querySelector(".fixed-header__logo");
  const buttons = fixedHeader.querySelectorAll(".fixed-header__btn");

  gsap.set(links, { opacity: 0 });
  gsap.set(buttons, { opacity: 0 });
  gsap.set(logo, { rotation: -540 });

  const tl = gsap.timeline({ onComplete: () => fixedHeader.classList.add("fixed-header--ready") });
  tl.to(links, { opacity: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" })
    .to(buttons, { opacity: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" }, "<")
    .to(logo, { rotation: 0, duration: 1.8, ease: "power2.out" }, 0);
}
initNavLoadAnimation();

/** Smooth scroll to section on nav link click (offset for fixed header) */
function initNavSmoothScroll() {
  const links = document.querySelectorAll('.fixed-header__link[href^="#"]');
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const headerHeight = window.innerWidth >= 768 ? 72 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}
initNavSmoothScroll();

/** Hero typing: type "Instant product photos ", then image expand, then " from one shot." */
function initHeroTyping() {
  if (!heroTextLeft || !heroTextRight || !hero || REDUCED_MOTION) return;

  const leftText = "Instant product photos from one shot ";
  const rightText = " On mobile.";
  const typeSpeed = 55;

  function typeInto(el, text, cursorClass = "hero__text-typing") {
    return new Promise((resolve) => {
      el.classList.add(cursorClass);
      el.textContent = "";
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          el.textContent += text[i];
          i++;
          setTimeout(tick, typeSpeed);
        } else {
          el.classList.remove(cursorClass);
          resolve();
        }
      };
      tick();
    });
  }

  (async () => {
    await new Promise((r) => setTimeout(r, 500));
    await typeInto(heroTextLeft, leftText);
    await typeInto(heroTextRight, rightText);
  })();
}
initHeroTyping();

/** Hero image expand: show between text 3s after load */
function initHeroImageDelay() {
  if (!hero || REDUCED_MOTION) return;
  const t = setTimeout(() => {
    hero.classList.add("hero--in-view");
  }, 3000);
}
initHeroImageDelay();

/** Hero media-between: expand image when hero is in view (only when scrolling back, not on load) */
function initHeroInView() {
  if (!hero || REDUCED_MOTION) return;
  let heroHasBeenLeft = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) heroHasBeenLeft = true;
        if (entry.isIntersecting && heroHasBeenLeft) hero.classList.add("hero--in-view");
      });
    },
    { threshold: 0.5, rootMargin: "0px" }
  );
  observer.observe(hero);
}
initHeroInView();

/** Cursor flair animation: only in hero (first page), uses images/cursor_animation/1–3.png */
function initCursorFlair() {
  const wrap = document.getElementById("hero-flair-wrap");
  if (!wrap || !hero || REDUCED_MOTION) return;
  const gsap = window.gsap;
  if (!gsap) return;

  const flair = gsap.utils.toArray(".hero .flair");
  if (!flair.length) return;

  const gap = 100;
  let index = 0;
  const wrapper = gsap.utils.wrap(0, flair.length);
  const mousePos = { x: 0, y: 0 };
  let lastMousePos = { x: 0, y: 0 };
  const cachedMousePos = { x: 0, y: 0 };

  function isInHero() {
    const rect = hero.getBoundingClientRect();
    return (
      window.scrollY < window.innerHeight &&
      mousePos.x >= rect.left &&
      mousePos.x <= rect.right &&
      mousePos.y >= rect.top &&
      mousePos.y <= rect.bottom
    );
  }

  function playAnimation(shape) {
    const tl = gsap.timeline();
    tl.from(shape, {
      opacity: 0,
      scale: 0,
      ease: "elastic.out(1, 0.3)",
    })
      .to(shape, { rotation: "random([-360, 360])" }, "<")
      .to(
        shape,
        { y: "120vh", ease: "back.in(0.4)", duration: 1 },
        0
      );
  }

  function animateImage() {
    const wrappedIndex = wrapper(index);
    const img = flair[wrappedIndex];
    gsap.killTweensOf(img);
    gsap.set(img, { clearProps: "all" });
    gsap.set(img, {
      opacity: 1,
      left: mousePos.x,
      top: mousePos.y,
      xPercent: -50,
      yPercent: -50,
    });
    playAnimation(img);
    index++;
  }

  window.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  });

  gsap.ticker.add(() => {
    if (!isInHero()) return;
    const travelDistance = Math.hypot(
      lastMousePos.x - mousePos.x,
      lastMousePos.y - mousePos.y
    );
    cachedMousePos.x = gsap.utils.interpolate(
      cachedMousePos.x ?? mousePos.x,
      mousePos.x,
      0.1
    );
    cachedMousePos.y = gsap.utils.interpolate(
      cachedMousePos.y ?? mousePos.y,
      mousePos.y,
      0.1
    );
    if (travelDistance > gap) {
      animateImage();
      lastMousePos = { x: mousePos.x, y: mousePos.y };
    }
  });
}
initCursorFlair();

/** Interface tilt: cursor-driven 3D tilt on the interface image block (below intro text) */
function initInterfaceTilt() {
  const section = document.getElementById("interface-tilt");
  const outer = section?.querySelector(".interface-tilt__outer");
  if (!section || !outer || REDUCED_MOTION) return;
  const gsap = window.gsap;
  if (!gsap) return;

  gsap.set(section, { perspective: 650 });

  const outerRX = gsap.quickTo(outer, "rotationX", { ease: "power3" });
  const outerRY = gsap.quickTo(outer, "rotationY", { ease: "power3" });

  section.addEventListener("pointermove", (e) => {
    const rect = section.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    outerRX(gsap.utils.interpolate(15, -15, y));
    outerRY(gsap.utils.interpolate(-15, 15, x));
  });

  section.addEventListener("pointerleave", () => {
    outerRX(0);
    outerRY(0);
  });
}
initInterfaceTilt();

/** Footer bounce: SVG path morphs from curved (down) to flat with elastic.out (CodePen bGeZvpO style) */
function initFooterBounce() {
  const pathEl = document.getElementById("bouncy-path");
  if (!footer || !pathEl) return;

  if (REDUCED_MOTION) {
    pathEl.setAttribute("d", "M0-0.3C0-0.3,464,0,1139,0S2278-0.3,2278-0.3V683H0V-0.3z");
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const downY = 156;
  const pathData = { y: downY };

  function setPathD(y) {
    pathEl.setAttribute(
      "d",
      `M0-0.3C0-0.3,464,${y},1139,${y}S2278-0.3,2278-0.3V683H0V-0.3z`
    );
  }

  setPathD(downY);

  function playBounce(self) {
    if (window.scrollY < 100) return;
    pathData.y = downY;
    setPathD(downY);
    const velocity = Math.abs(self.getVelocity() || 0);
    const variation = Math.max(-0.3, Math.min(0.3, velocity / 10000));
    gsap.fromTo(
      pathData,
      { y: downY },
      {
        y: 0,
        duration: 2,
        ease: `elastic.out(${1 + variation}, ${Math.max(0.3, 1 - variation)})`,
        overwrite: true,
        onUpdate: () => setPathD(pathData.y),
      }
    );
  }

  ScrollTrigger.create({
    trigger: ".footer",
    start: "top bottom",
    onEnter: playBounce,
    onEnterBack: playBounce,
  });
}
initFooterBounce();

function initShapeOverlays() {
  const overlay = wordSwapSection?.querySelector(".shape-overlays");
  const paths = overlay?.querySelectorAll(".shape-overlays__path");
  if (!paths || paths.length !== SHAPE_NUM_PATHS) return;
  shapeOverlaysPaths = Array.from(paths);
  shapeOverlaysAllPoints = [];
  shapeOverlaysPointsDelay = [];
  for (let j = 0; j < SHAPE_NUM_POINTS; j++) {
    shapeOverlaysPointsDelay[j] = Math.random() * SHAPE_DELAY_POINTS_MAX;
  }
  for (let i = 0; i < SHAPE_NUM_PATHS; i++) {
    const points = [];
    for (let j = 0; j < SHAPE_NUM_POINTS; j++) points.push(100);
    shapeOverlaysAllPoints.push(points);
  }
}

function renderShapeOverlays(progress) {
  if (!shapeOverlaysPaths.length || !shapeOverlaysAllPoints.length || !shapeOverlaysPointsDelay.length) return;
  const seg = 1 / SHAPE_NUM_PATHS; // 0.2 each
  const easeOut = (u) => 1 - (1 - u) * (1 - u);
  // 5 segments: 0 entry wave, 1 CAPTURE→GENERATE, 2 GENERATE→POLISH, 3 POLISH→EXPORT, 4 EXPORT→bg
  // Path 4 (entry) in seg 0, path 3 (CAPTURE) in seg 1, path 2 (GENERATE) in seg 2, path 1 (POLISH) in seg 3, path 0 (EXPORT) in seg 4
  const segProgress = [
    progress <= seg * 4 ? 0 : Math.min(1, (progress - seg * 4) / seg),
    progress <= seg * 3 ? 0 : progress >= seg * 4 ? 1 : Math.min(1, (progress - seg * 3) / seg),
    progress <= seg * 2 ? 0 : progress >= seg * 3 ? 1 : Math.min(1, (progress - seg * 2) / seg),
    progress <= seg ? 0 : progress >= seg * 2 ? 1 : Math.min(1, (progress - seg) / seg),
    progress <= seg ? Math.min(1, progress / seg) : 1,
  ];
  // Wave: each point j animates 100→0 with delay shapeOverlaysPointsDelay[j], over SHAPE_POINT_DURATION of the segment
  for (let i = 0; i < SHAPE_NUM_PATHS; i++) {
    const sp = segProgress[i];
    const points = shapeOverlaysAllPoints[i];
    for (let j = 0; j < SHAPE_NUM_POINTS; j++) {
      const delay = shapeOverlaysPointsDelay[j];
      if (sp <= delay) {
        points[j] = 100;
      } else if (sp >= delay + SHAPE_POINT_DURATION) {
        points[j] = 0;
      } else {
        const u = (sp - delay) / SHAPE_POINT_DURATION;
        points[j] = 100 * (1 - easeOut(u));
      }
    }
  }
  for (let i = 0; i < SHAPE_NUM_PATHS; i++) {
    const path = shapeOverlaysPaths[i];
    const points = shapeOverlaysAllPoints[i];
    const isOpened = points.some((p) => p < 100);
    let d = "";
    d += isOpened ? `M 0 0 V ${points[0]} C` : `M 0 ${points[0]} C`;
    for (let j = 0; j < SHAPE_NUM_POINTS - 1; j++) {
      const p = ((j + 1) / (SHAPE_NUM_POINTS - 1)) * 100;
      const cp = p - (1 / (SHAPE_NUM_POINTS - 1)) * 100 / 2;
      d += ` ${cp} ${points[j]} ${cp} ${points[j + 1]} ${p} ${points[j + 1]}`;
    }
    d += isOpened ? ` V 100 H 0` : ` V 0 H 0`;
    path.setAttribute("d", d);
  }
}

window.addEventListener("scroll", updateWordSwap, { passive: true });
window.addEventListener("resize", updateWordSwap);
if (wordSwapSection && wordSwapPin) {
  initShapeOverlays();
  updateWordSwap();
}

/** Split word-swap titles into letters for staggered reveal (GSAP-style) */
function initWordSwapLetters() {
  const LETTER_STAGGER_MS = 35;
  const words = document.querySelectorAll(".word-swap__word");
  words.forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.className = "word-swap__letter";
      span.textContent = text[i];
      span.style.transitionDelay = `${i * LETTER_STAGGER_MS}ms`;
      el.appendChild(span);
    }
  });
}
initWordSwapLetters();

function updateWordSwap() {
  if (REDUCED_MOTION || !wordSwapSection || !wordSwapPin) return;
  const pinHeight = wordSwapPin.offsetHeight;
  const sectionTop = wordSwapSection.offsetTop;
  const scrollWithin = window.scrollY - sectionTop;
  const progress = Math.max(0, Math.min(1, scrollWithin / pinHeight));

  const overlay = wordSwapSection.querySelector(".shape-overlays");
  if (overlay) {
    const inSection = scrollWithin >= -100 && scrollWithin <= pinHeight + 100;
    overlay.style.display = inSection ? "" : "none";
    if (inSection) renderShapeOverlays(progress);
  }

  // 5 segments (0.2 each): CAPTURE, GENERATE, POLISH, EXPORT
  const t1 = 0.15;
  const t2 = 0.2;
  const t3 = 0.35;
  const t4 = 0.4;
  const t5 = 0.55;
  const t6 = 0.6;
  const t7 = 0.75;
  const t8 = 0.8;

  wordSwapSlides.forEach((slide, i) => {
    let opacity = 0;
    if (i === 0) {
      if (progress < t1) opacity = 1;
      else if (progress < t2) {
        const u = (progress - t1) / (t2 - t1);
        const e = 1 - (1 - u) * (1 - u);
        opacity = 1 - e;
      } else if (progress >= t2 && progress < t3) opacity = 1;
      else if (progress < t4) {
        const u = (progress - t3) / (t4 - t3);
        const e = u * u;
        opacity = 1 - e;
      }
    } else if (i === 1) {
      if (progress >= t3 && progress < t4) {
        const u = (progress - t3) / (t4 - t3);
        const e = 1 - (1 - u) * (1 - u);
        opacity = e;
      } else if (progress >= t4 && progress < t5) opacity = 1;
      else if (progress >= t5 && progress < t6) {
        const u = (progress - t5) / (t6 - t5);
        const e = u * u;
        opacity = 1 - e;
      }
    } else if (i === 2) {
      if (progress >= t5 && progress < t6) {
        const u = (progress - t5) / (t6 - t5);
        const e = 1 - (1 - u) * (1 - u);
        opacity = e;
      } else if (progress >= t6 && progress < t7) opacity = 1;
      else if (progress >= t7 && progress < t8) {
        const u = (progress - t7) / (t8 - t7);
        const e = u * u;
        opacity = 1 - e;
      }
    } else {
      if (progress >= t7 && progress < t8) {
        const u = (progress - t7) / (t8 - t7);
        const e = 1 - (1 - u) * (1 - u);
        opacity = e;
      } else if (progress >= t8) opacity = 1;
    }
    slide.style.opacity = String(opacity);
    slide.classList.toggle("is-active", opacity > 0.5);
  });

  let activeDot = 0;
  if (progress < t4) activeDot = 0;
  else if (progress < t6) activeDot = 1;
  else if (progress < t8) activeDot = 2;
  else activeDot = 3;
  wordSwapDots.forEach((dot, i) => dot.classList.toggle("is-active", i === activeDot));
}
