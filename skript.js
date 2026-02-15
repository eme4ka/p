// ===== Helpers =====
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];

// ===== Mobile nav =====
const navToggle = qs("#navToggle");
const navList = qs("#navList");

function setNav(open) {
  const isOpen = open ?? !navList.classList.contains("isOpen");
  navList.classList.toggle("isOpen", isOpen);
  navToggle?.setAttribute("aria-expanded", String(isOpen));
}

navToggle?.addEventListener("click", () => setNav());
qsa(".nav__link").forEach(a => a.addEventListener("click", () => setNav(false)));

document.addEventListener("click", (e) => {
  if (!navList || !navToggle) return;
  const inside = navList.contains(e.target) || navToggle.contains(e.target);
  if (!inside) setNav(false);
});

// ===== Reveal on scroll =====
const revealEls = qsa(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add("isVisible");
      io.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

// ===== Counters =====
function animateCounter(el, to) {
  const start = 0;
  const dur = 900;
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const val = Math.round(start + (to - start) * (1 - Math.pow(1 - p, 3)));
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterEls = qsa("[data-counter]");
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const to = Number(el.getAttribute("data-counter")) || 0;
    animateCounter(el, to);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });

counterEls.forEach(el => counterIO.observe(el));

// ===== Modal =====
const modal = qs("#modal");
const overlay = qs("#modalOverlay");
const closeBtn = qs("#closeModalBtn");
const openBtns = ["#openModalBtn","#openModalBtn2","#openModalBtn3","#openModalBtn4","#openModalBtn5","#floatBtn"]
  .map(id => qs(id))
  .filter(Boolean);

function openModal() {
  modal.classList.add("isOpen");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("isOpen");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openBtns.forEach(b => b.addEventListener("click", openModal));
overlay?.addEventListener("click", closeModal);
closeBtn?.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ===== Form -> mailto (Gmail) =====
const form = qs("#contactForm");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);

  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const message = String(data.get("message") || "").trim();

  const to = "nazarvichirko@gmail.com";
  const subject = encodeURIComponent("Зворотний зв’язок із сайту");
  const body = encodeURIComponent(
    `Ім’я: ${name}\nКонтакт: ${contact}\n\nПовідомлення:\n${message}\n\n---\nНадіслано з сайту-візитки`
  );

  // Открывает почтовый клиент / Gmail в браузере (если настроено)
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

  closeModal();
  form.reset();
});

// ===== Year =====
qs("#year").textContent = String(new Date().getFullYear());
