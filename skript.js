// =====================
//  Допоміжні функції
// =====================
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

// =====================
//  Рік у футері
// =====================
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =====================
//  Мобільне меню (бургер)
// =====================
const burger = $("#burger");
const mobileMenu = $("#mobileMenu");

function toggleMobile(forceOpen = null) {
  if (!burger || !mobileMenu) return;

  const isOpen = mobileMenu.classList.contains("open");
  const next = forceOpen === null ? !isOpen : forceOpen;

  mobileMenu.classList.toggle("open", next);
  burger.setAttribute("aria-expanded", String(next));
  mobileMenu.setAttribute("aria-hidden", String(!next));
}

if (burger) {
  burger.addEventListener("click", () => toggleMobile());
}

// Закриваємо мобільне меню при кліку на пункт
$$(".mobile__link").forEach((a) => {
  a.addEventListener("click", () => toggleMobile(false));
});

// =====================
//  Модалка (Зворотний звʼязок)
// =====================
const modal = $("#modal");
const form = $("#form");

function openModal() {
  if (!modal) return;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // фокус на перше поле
  setTimeout(() => {
    const first = $("input[name='name']", modal);
    if (first) first.focus();
  }, 60);
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Кнопки, які відкривають модалку
[
  "#openFeedback",
  "#openFeedback2",
  "#openFeedback3",
  "#fab",
  "[data-open='feedback']",
].forEach((sel) => {
  $$(sel).forEach((btn) => btn.addEventListener("click", openModal));
});

// Закриття по оверлею та хрестику
$$("[data-close='modal']").forEach((el) => el.addEventListener("click", closeModal));

// Закриття по ESC
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal?.classList.contains("open")) closeModal();
});

// =====================
//  Надсилання форми (демо)
// =====================
// ЗАРАЗ: показує "Надіслано ✓" і відкриває Telegram-лінк.
// Встав свого бота: https://t.me/your_bot
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !contact || !message) return;

    const text = encodeURIComponent(
      `Заявка з сайту:\nІмʼя: ${name}\nКонтакт: ${contact}\nПовідомлення: ${message}`
    );

    // ВАЖЛИВО: заміни your_bot на свій Telegram-бот/юзернейм
    // Варіант 1 (юзернейм): https://t.me/USERNAME?text=...
    // Варіант 2 (бот):      https://t.me/your_bot?text=...
    const tgLink = `https://t.me/your_bot?text=${text}`;

    const btn = $("button[type='submit']", form);
    const old = btn ? btn.textContent : "";

    if (btn) {
      btn.textContent = "Надіслано ✓";
      btn.disabled = true;
    }

    setTimeout(() => {
      window.open(tgLink, "_blank", "noopener,noreferrer");
      if (btn) {
        btn.textContent = old;
        btn.disabled = false;
      }
      form.reset();
      closeModal();
    }, 650);
  });
}

// =====================
//  Анімації появи блоків (reveal)
// =====================
const revealEls = $$(".reveal");

if ("IntersectionObserver" in window && revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  // fallback: якщо браузер старий
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

// =====================
//  Підсвітка активного пункту меню (скрол)
// =====================
const sections = ["services", "about", "reviews", "contacts"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const navLinks = $$(".nav__link");

if ("IntersectionObserver" in window && sections.length && navLinks.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
        });
      });
    },
    { threshold: 0.55 }
  );

  sections.forEach((sec) => navObserver.observe(sec));
}

// =====================
//  Слайдер відгуків (без бібліотек)
// =====================
const track = $("#track");
const prev = $("#prev");
const next = $("#next");
const dotsRow = $("#dotsRow");

if (track) {
  const cards = $$(".review", track);
  let index = 0;

  // Створюємо "крапки"
  if (dotsRow) {
    dotsRow.innerHTML = cards
      .map((_, i) => `<span class="dot ${i === 0 ? "active" : ""}"></span>`)
      .join("");
  }
  const dots = dotsRow ? $$(".dot", dotsRow) : [];

  function scrollToIndex(i) {
    if (!cards.length) return;

    index = Math.max(0, Math.min(cards.length - 1, i));
    const left = cards[index].offsetLeft;

    track.scrollTo({ left, behavior: "smooth" });

    dots.forEach((d, di) => d.classList.toggle("active", di === index));
  }

  prev?.addEventListener("click", () => scrollToIndex(index - 1));
  next?.addEventListener("click", () => scrollToIndex(index + 1));

  // Клік по крапках
  dots.forEach((d, i) => d.addEventListener("click", () => scrollToIndex(i)));

  // При ручному скролі — визначаємо найближчу картку
  let t;
  track.addEventListener("scroll", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const x = track.scrollLeft + track.clientWidth * 0.35;

      let best = 0;
      let bestDist = Infinity;

      cards.forEach((c, i) => {
        const dist = Math.abs(c.offsetLeft - x);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });

      scrollToIndex(best);
    }, 120);
  });
}
