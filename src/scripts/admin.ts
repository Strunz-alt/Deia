/** Interacciones del panel de administración. */

/* ---------- Menú lateral en pantallas chicas ---------- */

const side = document.querySelector<HTMLElement>('[data-admin-side]');
const scrim = document.querySelector<HTMLElement>('[data-admin-scrim]');
const menuBtn = document.querySelector<HTMLButtonElement>('[data-admin-menu]');

const setSide = (open: boolean) => {
  side?.toggleAttribute('data-open', open);
  if (scrim) scrim.hidden = !open;
  menuBtn?.setAttribute('aria-expanded', String(open));
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (open) side?.querySelector<HTMLElement>('a')?.focus();
};
menuBtn?.addEventListener('click', () => setSide(!side?.hasAttribute('data-open')));
scrim?.addEventListener('click', () => setSide(false));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && side?.hasAttribute('data-open')) {
    setSide(false);
    menuBtn?.focus();
  }
});

/* ---------- Filtro de tablas en el navegador ---------- */

document.querySelectorAll<HTMLInputElement>('[data-table-filter]').forEach((input) => {
  const table = document.getElementById(input.dataset.tableFilter!);
  const empty = document.getElementById(`${input.dataset.tableFilter}-empty`);
  if (!table) return;
  const rows = [...table.querySelectorAll<HTMLElement>('[data-row]')];
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  input.addEventListener('input', () => {
    const q = norm(input.value.trim());
    let visible = 0;
    rows.forEach((r) => {
      const show = !q || norm(r.textContent ?? '').includes(q);
      r.hidden = !show;
      if (show) visible++;
    });
    if (empty) empty.hidden = visible > 0;
  });
});

/* ---------- Cátedras según la materia elegida ---------- */

document.querySelectorAll<HTMLSelectElement>('select[data-catedra-for]').forEach((catedra) => {
  const materia = document.getElementById(catedra.dataset.catedraFor!) as HTMLSelectElement | null;
  if (!materia) return;
  const hint = document.getElementById(`${catedra.id}-sin`);
  const sync = () => {
    let available = 0;
    [...catedra.options].forEach((o) => {
      if (!o.value || o.value === '-1') return;
      const ok = !materia.value || o.dataset.materia === materia.value;
      o.hidden = !ok;
      o.disabled = !ok;
      if (ok) available++;
    });
    if (catedra.selectedOptions[0]?.disabled) catedra.value = '';
    if (hint) hint.hidden = !materia.value || available > 0;
  };
  materia.addEventListener('change', sync);
  sync();
});

/* ---------- Filtros que se aplican al cambiar ---------- */

document.querySelectorAll<HTMLFormElement>('form[data-autosubmit]').forEach((form) => {
  form.querySelectorAll('select').forEach((s) => s.addEventListener('change', () => form.requestSubmit()));
});
