/**
 * Acciones pendientes: cualquier elemento con `data-pending="mensaje"` muestra
 * un aviso explicando que la acción todavía no está disponible.
 * No simula envíos, descargas ni inscripciones.
 */

const region = document.querySelector<HTMLElement>('[data-toast-region]');
let timer: number | undefined;

const icon =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/></svg>';

export function showToast(message: string, title = 'Disponible próximamente') {
  if (!region) return;
  window.clearTimeout(timer);
  region.innerHTML = '';
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `${icon}<div><strong></strong><span></span></div>`;
  toast.querySelector('strong')!.textContent = title;
  toast.querySelector('span')!.textContent = message;
  region.append(toast);
  timer = window.setTimeout(() => {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 4200);
}

document.addEventListener('click', (e) => {
  const trigger = (e.target as Element).closest<HTMLElement>('[data-pending]');
  if (!trigger) return;
  e.preventDefault();
  showToast(trigger.dataset.pending ?? 'Esta acción todavía no está disponible.');
});
