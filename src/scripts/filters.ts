/**
 * Motor de filtros reutilizable (sin dependencias).
 *
 * Estructura esperada:
 *   <div data-filter-root>
 *     <input type="search" data-filter-search name="q" />          (opcional)
 *     <select data-filter-key="materia" name="materia">…</select>  (opcional)
 *     <div data-filter-key="estado" data-filter-chips>             (opcional)
 *       <button type="button" data-value="" aria-pressed="true">Todas</button>
 *       <button type="button" data-value="proxima" aria-pressed="false">Próximas</button>
 *     </div>
 *     <button type="button" data-filter-reset>Limpiar</button>
 *     <p data-filter-count data-one="resultado" data-many="resultados"></p>
 *     <div data-filter-group>            (opcional: se oculta si queda vacío)
 *       <article data-filter-item data-f-materia="…" data-f-estado="…" data-search="texto">…</article>
 *     </div>
 *     <div data-filter-empty hidden>…</div>
 *   </div>
 *
 * El estado se refleja en la URL (?materia=…&q=…) para poder compartir búsquedas.
 */

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export type FilterState = { q: string; values: Record<string, string> };

export function initFilters(root: HTMLElement, onChange?: (state: FilterState) => void) {
  const search = root.querySelector<HTMLInputElement>('[data-filter-search]');
  const selects = [...root.querySelectorAll<HTMLSelectElement>('select[data-filter-key]')];
  const chipGroups = [...root.querySelectorAll<HTMLElement>('[data-filter-chips][data-filter-key]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-filter-group]')];
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  const count = root.querySelector<HTMLElement>('[data-filter-count]');
  const resets = [...root.querySelectorAll<HTMLElement>('[data-filter-reset]')];
  const syncUrl = root.dataset.filterUrl !== 'false';

  const searchIndex = new Map(items.map((el) => [el, normalize(el.dataset.search ?? el.textContent ?? '')]));

  const getState = (): FilterState => {
    const values: Record<string, string> = {};
    selects.forEach((s) => (values[s.dataset.filterKey!] = s.value));
    chipGroups.forEach((g) => {
      const active = g.querySelector<HTMLElement>('[aria-pressed="true"]');
      values[g.dataset.filterKey!] = active?.dataset.value ?? '';
    });
    return { q: search?.value ?? '', values };
  };

  const setChip = (group: HTMLElement, value: string) => {
    group.querySelectorAll<HTMLElement>('[data-value]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.value === value));
    });
  };

  const apply = () => {
    const state = getState();
    const terms = normalize(state.q).split(/\s+/).filter(Boolean);
    let visible = 0;

    items.forEach((el) => {
      const matchesValues = Object.entries(state.values).every(
        ([key, value]) => !value || el.getAttribute(`data-f-${key}`) === value,
      );
      const text = searchIndex.get(el)!;
      const matchesText = terms.every((t) => text.includes(t));
      const show = matchesValues && matchesText;
      el.hidden = !show;
      if (show) visible++;
    });

    groups.forEach((g) => {
      g.hidden = !g.querySelector('[data-filter-item]:not([hidden])');
    });

    if (empty) empty.hidden = visible > 0;
    if (count) {
      const word = visible === 1 ? count.dataset.one ?? 'resultado' : count.dataset.many ?? 'resultados';
      count.textContent = `${visible} ${word}`;
    }

    const active = Boolean(state.q) || Object.values(state.values).some(Boolean);
    resets.forEach((r) => r.toggleAttribute('data-active', active));

    if (syncUrl) {
      const params = new URLSearchParams();
      if (state.q) params.set('q', state.q);
      Object.entries(state.values).forEach(([k, v]) => v && params.set(k, v));
      const qs = params.toString();
      history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
    }

    onChange?.(state);
  };

  // Estado inicial desde la URL
  if (syncUrl) {
    const params = new URLSearchParams(location.search);
    if (search && params.has('q')) search.value = params.get('q')!;
    selects.forEach((s) => {
      const v = params.get(s.dataset.filterKey!);
      if (v && [...s.options].some((o) => o.value === v)) s.value = v;
    });
    chipGroups.forEach((g) => {
      const v = params.get(g.dataset.filterKey!);
      if (v && g.querySelector(`[data-value="${CSS.escape(v)}"]`)) setChip(g, v);
    });
  }

  search?.addEventListener('input', apply);
  selects.forEach((s) => s.addEventListener('change', apply));
  chipGroups.forEach((g) =>
    g.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest<HTMLElement>('[data-value]');
      if (!btn) return;
      setChip(g, btn.dataset.value ?? '');
      apply();
    }),
  );
  resets.forEach((r) =>
    r.addEventListener('click', () => {
      if (search) search.value = '';
      selects.forEach((s) => (s.selectedIndex = 0));
      chipGroups.forEach((g) => setChip(g, ''));
      apply();
      (search ?? selects[0])?.focus();
    }),
  );

  apply();
  return { apply, getState };
}

/** Inicializa automáticamente cada `[data-filter-root]` sin lógica adicional. */
export function autoInitFilters() {
  document.querySelectorAll<HTMLElement>('[data-filter-root]:not([data-filter-manual])').forEach((root) => initFilters(root));
}
