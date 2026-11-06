/**
 * Mejoras progresivas para formularios (el sitio funciona también sin JS):
 * - Estado de carga en el botón que envía el formulario.
 * - Confirmación antes de acciones destructivas (`data-confirm`).
 * - Validación de tamaño y tipo de archivo antes de subirlo.
 * - Vista previa de imágenes seleccionadas.
 * - Filas repetibles (p. ej. oradores de una charla).
 * - Mostrar u ocultar contraseñas.
 */

/* ---------- Estado de carga ---------- */

document.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement;
  if (e.defaultPrevented || form.method.toLowerCase() !== 'post') return;
  const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
  const btn = submitter ?? form.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
  if (!btn) return;
  // Se difiere para que el valor del botón se incluya en el envío.
  requestAnimationFrame(() => {
    btn.setAttribute('data-loading', '');
    btn.setAttribute('aria-disabled', 'true');
    const text = btn.dataset.loadingText;
    const label = btn.querySelector('[data-label]') ?? btn;
    if (text && label === btn) btn.textContent = text;
    else if (text) label.textContent = text;
    form.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((b) => {
      if (b !== btn) b.disabled = true;
    });
  });
});

// Al volver con el botón "atrás", restablecer botones.
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  document.querySelectorAll<HTMLButtonElement>('button[data-loading]').forEach((b) => {
    b.removeAttribute('data-loading');
    b.removeAttribute('aria-disabled');
  });
  document.querySelectorAll<HTMLButtonElement>('form button[disabled]').forEach((b) => (b.disabled = false));
});

/* ---------- Confirmación ---------- */

let dialog: HTMLDialogElement | null = null;
let pending: { form: HTMLFormElement; button: HTMLButtonElement } | null = null;

function getDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'confirm-dialog';
  dialog.setAttribute('aria-labelledby', 'confirm-title');
  dialog.innerHTML = `
    <form method="dialog" class="confirm-dialog__box">
      <span class="confirm-dialog__icon" aria-hidden="true">!</span>
      <h2 class="confirm-dialog__title" id="confirm-title"></h2>
      <p class="confirm-dialog__text"></p>
      <div class="confirm-dialog__actions">
        <button value="cancel" class="btn btn--outline btn--sm" autofocus>Cancelar</button>
        <button value="ok" class="btn btn--sm confirm-dialog__ok"></button>
      </div>
    </form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => {
    if (dialog!.returnValue === 'ok' && pending) {
      const { form, button } = pending;
      button.dataset.confirmed = 'true';
      form.requestSubmit(button);
    }
    pending = null;
  });
  return dialog;
}

document.addEventListener('click', (e) => {
  const button = (e.target as Element).closest<HTMLButtonElement>('button[data-confirm]');
  if (!button || !button.form) return;
  if (button.dataset.confirmed === 'true') {
    delete button.dataset.confirmed;
    return;
  }
  e.preventDefault();
  const d = getDialog();
  d.querySelector('.confirm-dialog__title')!.textContent = button.dataset.confirmTitle ?? '¿Confirmás esta acción?';
  d.querySelector('.confirm-dialog__text')!.textContent = button.dataset.confirm ?? '';
  d.querySelector('.confirm-dialog__ok')!.textContent = button.dataset.confirmLabel ?? 'Eliminar';
  pending = { form: button.form, button };
  d.returnValue = '';
  d.showModal();
});

/* ---------- Archivos: validación y vista previa ---------- */

const formatMB = (n: number) => `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

function fileErrorEl(input: HTMLInputElement) {
  const field = input.closest('.field') ?? input.parentElement!;
  let el = field.querySelector<HTMLElement>('[data-file-error]');
  if (!el) {
    el = document.createElement('p');
    el.className = 'field__error';
    el.setAttribute('data-file-error', '');
    el.setAttribute('role', 'alert');
    field.append(el);
  }
  return el;
}

function validateFiles(input: HTMLInputElement) {
  const max = Number(input.dataset.maxBytes || 0);
  const exts = (input.dataset.extensions || '').split(',').filter(Boolean);
  const maxCount = Number(input.dataset.maxFiles || 0);
  const files = [...(input.files ?? [])];
  let error = '';
  if (maxCount && files.length > maxCount) error = `Podés seleccionar hasta ${maxCount} archivos a la vez.`;
  for (const f of files) {
    const ext = f.name.toLowerCase().split('.').pop() ?? '';
    if (exts.length && !exts.includes(ext)) {
      error = `«${f.name}» no tiene un formato permitido (${exts.join(', ').toUpperCase()}).`;
      break;
    }
    if (max && f.size > max) {
      error = `«${f.name}» pesa ${formatMB(f.size)}; el máximo es ${formatMB(max)}.`;
      break;
    }
  }
  const el = fileErrorEl(input);
  el.textContent = error;
  el.hidden = !error;
  input.setCustomValidity(error);
  return !error;
}

function renderPreview(input: HTMLInputElement) {
  const target = document.getElementById(input.dataset.preview ?? '');
  if (!target) return;
  target.querySelectorAll('[data-new-preview]').forEach((n) => n.remove());
  const files = [...(input.files ?? [])].filter((f) => f.type.startsWith('image/'));
  target.toggleAttribute('data-has-new', files.length > 0);
  files.forEach((f) => {
    const fig = document.createElement('figure');
    fig.className = 'preview-thumb preview-thumb--new';
    fig.setAttribute('data-new-preview', '');
    const img = document.createElement('img');
    img.src = URL.createObjectURL(f);
    img.alt = `Vista previa de ${f.name}`;
    img.onload = () => URL.revokeObjectURL(img.src);
    const cap = document.createElement('figcaption');
    cap.textContent = 'Nueva';
    fig.append(img, cap);
    target.append(fig);
  });
}

document.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  if (input.type !== 'file') return;
  const ok = validateFiles(input);
  if (!ok) {
    input.value = '';
    input.setCustomValidity('');
  }
  if (input.dataset.preview) renderPreview(input);
  const name = input.closest('.file-drop')?.querySelector<HTMLElement>('[data-file-name]');
  if (name) {
    const files = [...(input.files ?? [])];
    name.textContent = files.length === 0 ? '' : files.length === 1 ? files[0].name : `${files.length} archivos seleccionados`;
  }
});

/* ---------- Filas repetibles ---------- */

document.addEventListener('click', (e) => {
  const add = (e.target as Element).closest<HTMLButtonElement>('[data-repeat-add]');
  if (add) {
    const box = add.closest('[data-repeat]')!;
    const tpl = box.querySelector<HTMLTemplateElement>('template[data-repeat-template]')!;
    const list = box.querySelector('[data-repeat-list]')!;
    const node = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const uid = `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    node.querySelectorAll<HTMLElement>('[id], [for]').forEach((el) => {
      if (el.id) el.id = el.id.replace('__i__', uid);
      const f = el.getAttribute('for');
      if (f) el.setAttribute('for', f.replace('__i__', uid));
    });
    list.append(node);
    node.querySelector<HTMLInputElement>('input')?.focus();
    return;
  }
  const remove = (e.target as Element).closest<HTMLButtonElement>('[data-repeat-remove]');
  if (remove) remove.closest('[data-repeat-row]')?.remove();
});

/* ---------- Mostrar contraseña ---------- */

document.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-toggle-password]');
  if (!btn) return;
  const input = document.getElementById(btn.getAttribute('aria-controls') ?? '') as HTMLInputElement | null;
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.setAttribute('aria-pressed', String(show));
  btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});
