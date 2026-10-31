"use strict";

// Small, independent behaviors. The content and contact links work without JavaScript.
function initNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#mobile-nav");
  if (!toggle || !navigation) return;
  function closeMenu(restoreFocus = false) {
    navigation.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    navigation.hidden = isOpen;
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !navigation.hidden) closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!navigation.hidden && !event.target.closest(".site-header"))
      closeMenu();
  });
  const desktop = window.matchMedia("(min-width: 801px)");
  desktop.addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

function initServices() {
  const services = [...document.querySelectorAll(".service-item")];
  services.forEach((service) => {
    service.addEventListener("toggle", () => {
      if (service.open)
        services.forEach((other) => {
          if (other !== service && other.open) other.open = false;
        });
    });
  });
}

function initPrivacy() {
  const dialog = document.querySelector(".privacy-dialog");
  const trigger = document.querySelector("[data-open-privacy]");
  if (!dialog || !trigger || typeof dialog.showModal !== "function") return;
  trigger.addEventListener("click", () => dialog.showModal());
  dialog.querySelectorAll(".dialog-close, .dialog-accept").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
}

function initMotion() {
  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !("IntersectionObserver" in window)
  )
    return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );
  document.documentElement.classList.add("js-motion");
  document
    .querySelectorAll(
      ".about-content, .section-heading, .process-steps li, .questions>div, .contact-top",
    )
    .forEach((element) => {
      // Never conceal content already in the viewport during initialization.
      element.classList.add("reveal");
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add("reveal-pending");
        observer.observe(element);
      }
    });
}

initNavigation();
initServices();
initPrivacy();
initMotion();
document.querySelector("#year").textContent = String(new Date().getFullYear());
