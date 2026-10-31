"use strict";

// Content, contact links, FAQs and all service panels remain accessible without JS.
function initNavigation() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#mobile-nav");
  if (!header || !toggle || !navigation) return;
  function closeMenu(restoreFocus = false) {
    navigation.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-is-open");
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    navigation.hidden = isOpen;
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
    document.body.classList.toggle("menu-is-open", !isOpen);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !navigation.hidden) closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!navigation.hidden && !header.contains(event.target)) closeMenu();
  });
  window
    .matchMedia("(min-width: 801px)")
    .addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  let ticking = false;
  const updateHeader = () => {
    header.classList.toggle(
      "is-scrolled",
      window.scrollY > window.innerHeight * 0.7,
    );
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHeader);
      }
    },
    { passive: true },
  );
  updateHeader();
}

function initCareSelector() {
  const selector = document.querySelector("[data-care-selector]");
  if (!selector) return;
  const list = selector.querySelector(".care-tabs");
  const tabs = [...selector.querySelectorAll(".care-tab")];
  const panels = tabs.map((tab) => document.getElementById(tab.dataset.panel));
  if (!list || panels.some((panel) => !panel)) return;
  list.setAttribute("role", "tablist");
  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[index].id);
    panels[index].setAttribute("role", "tabpanel");
    panels[index].tabIndex = 0;
  });
  function activate(index, moveFocus = false) {
    tabs.forEach((tab, position) => {
      const selected = index === position;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
    if (moveFocus) tabs[index].focus();
    window.dispatchEvent(new Event("myfisio:layout"));
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(index));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(next, true);
    });
  });
  activate(0);
  selector.classList.add("is-enhanced");
}

function initScrollPhotography() {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scenes = [...document.querySelectorAll("[data-scroll-scene]")]
    .map((element) => ({
      element,
      image: element.querySelector("[data-scroll-image]"),
      progress: element.querySelector("[data-scene-progress]"),
      zoom: Number(element.dataset.zoom) || 0.12,
      travel: Number(element.dataset.travel) || 0,
      sticky: element.hasAttribute("data-sticky-scene"),
      top: 0,
      height: 0,
    }))
    .filter((scene) => scene.image);
  let frame = 0;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  function paint() {
    frame = 0;
    if (preference.matches) return;
    const scrollY = window.scrollY;
    const viewport = window.innerHeight;
    scenes.forEach((scene) => {
      if (
        !scene.height ||
        scrollY + viewport < scene.top ||
        scrollY > scene.top + scene.height
      )
        return;
      const progress = scene.sticky
        ? clamp((scrollY - scene.top) / Math.max(1, scene.height - viewport))
        : clamp((scrollY + viewport - scene.top) / (viewport + scene.height));
      scene.image.style.setProperty(
        "--image-scale",
        (1.025 + progress * scene.zoom).toFixed(4),
      );
      scene.image.style.setProperty(
        "--image-y",
        `${(progress * scene.travel).toFixed(3)}%`,
      );
      if (scene.progress)
        scene.progress.style.setProperty(
          "--scene-progress",
          progress.toFixed(4),
        );
    });
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function measure() {
    // Geometry is read only after layout changes, never during a scroll tick.
    const scrollY = window.scrollY;
    scenes.forEach((scene) => {
      const rect = scene.element.getBoundingClientRect();
      scene.top = rect.top + scrollY;
      scene.height = rect.height;
    });
    schedule();
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("myfisio:layout", measure);
  window.addEventListener("load", measure, { once: true });
  if ("ResizeObserver" in window)
    new ResizeObserver(measure).observe(document.body);
  preference.addEventListener("change", () => {
    if (preference.matches) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      scenes.forEach(({ image, progress }) => {
        image.style.removeProperty("--image-scale");
        image.style.removeProperty("--image-y");
        progress?.style.removeProperty("--scene-progress");
      });
    } else measure();
  });
  measure();
}

function initPrivacy() {
  const dialog = document.querySelector(".privacy-dialog");
  const trigger = document.querySelector("[data-open-privacy]");
  if (!dialog || !trigger || typeof dialog.showModal !== "function") return;
  trigger.addEventListener("click", () => dialog.showModal());
  dialog
    .querySelectorAll(".dialog-close, .dialog-accept")
    .forEach((button) =>
      button.addEventListener("click", () => dialog.close()),
    );
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    if (
      event.clientX < left ||
      event.clientX > right ||
      event.clientY < top ||
      event.clientY > bottom
    )
      dialog.close();
  });
}

initNavigation();
initCareSelector();
initScrollPhotography();
initPrivacy();
const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
