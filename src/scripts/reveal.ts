/**
 * Aparición suave de elementos al entrar en pantalla.
 * Marcar con `data-reveal`; en listas, `data-reveal-stagger` en el contenedor
 * escalona la aparición de sus hijos directos.
 * Con `prefers-reduced-motion` los elementos se muestran sin animación (ver CSS).
 */

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((list) => {
  [...list.children].forEach((child, i) => {
    const el = child as HTMLElement;
    el.setAttribute('data-reveal', '');
    el.style.setProperty('--reveal-i', String(i % 6));
  });
});

const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');

if (reduce || !('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  targets.forEach((el) => io.observe(el));
}
