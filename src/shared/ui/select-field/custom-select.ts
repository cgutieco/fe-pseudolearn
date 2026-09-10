const TRIGGER = '.pl-select__trigger';
const OPTION = '.pl-select__option';
const MENU = '.pl-select__menu';
const OPEN = '[data-open="true"]';
const ARIA_SELECTED = 'aria-selected';
const ARIA_EXPANDED = 'aria-expanded';

export function attachCustomSelects(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-custom-select]').forEach((wrapper) => {
    const trigger = wrapper.querySelector<HTMLElement>(TRIGGER);
    if (trigger) trigger.hidden = false;
    wrapper.classList.add('pl-select--enhanced');
  });

  const container = root instanceof HTMLElement ? root : document.body;

  container.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const trigger = target.closest<HTMLButtonElement>(TRIGGER);
    if (trigger) {
      const wrapper = trigger.closest<HTMLElement>('.pl-select');
      if (wrapper) toggleMenu(wrapper, wrapper.dataset.open !== 'true');
      return;
    }
    const option = target.closest<HTMLElement>(OPTION);
    if (option?.dataset.value !== undefined) handleOptionClick(option);
  });

  container.addEventListener('change', (event) => {
    const select = event.target as HTMLSelectElement;
    const wrapper = select.closest<HTMLElement>('.pl-select');
    if (wrapper) syncSelect(wrapper, select);
  });

  container.addEventListener('reset', () => {
    setTimeout(() => {
      container.querySelectorAll<HTMLElement>('[data-custom-select]').forEach((wrapper) => {
        const select = wrapper.querySelector<HTMLSelectElement>('select');
        if (select) syncSelect(wrapper, select);
      });
    }, 0);
  });

  document.addEventListener('click', (event) => {
    const open = document.querySelector<HTMLElement>(OPEN);
    if (open && !open.contains(event.target as Node)) toggleMenu(open, false);
  });

  attachKeyboard(container);
}

function handleOptionClick(option: HTMLElement): void {
  const wrapper = option.closest<HTMLElement>('.pl-select');
  const select = wrapper?.querySelector<HTMLSelectElement>('select');
  if (wrapper && select && option.dataset.value !== undefined) {
    select.value = option.dataset.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    toggleMenu(wrapper, false);
    wrapper.querySelector<HTMLButtonElement>(TRIGGER)?.focus();
  }
}

function syncSelect(wrapper: HTMLElement, select: HTMLSelectElement): void {
  const triggerText = wrapper.querySelector<HTMLElement>('.pl-select__trigger-text');
  if (triggerText) triggerText.textContent = select.selectedOptions[0]?.text ?? '';
  wrapper.querySelectorAll<HTMLElement>(OPTION).forEach((opt) => {
    opt.setAttribute(ARIA_SELECTED, String(opt.dataset.value === select.value));
  });
}

function toggleMenu(wrapper: HTMLElement, isOpen: boolean): void {
  if (isOpen) {
    document.querySelectorAll<HTMLElement>(OPEN).forEach((w) => {
      if (w !== wrapper) toggleMenu(w, false);
    });
    wrapper.dataset.open = 'true';
    (
      wrapper.querySelector<HTMLElement>(`${OPTION}[${ARIA_SELECTED}="true"]`) ??
      wrapper.querySelector<HTMLElement>(OPTION)
    )?.focus();
  } else {
    delete wrapper.dataset.open;
  }
  wrapper.querySelector<HTMLElement>(MENU)?.toggleAttribute('hidden', !isOpen);
  wrapper.querySelector<HTMLButtonElement>(TRIGGER)?.setAttribute(ARIA_EXPANDED, String(isOpen));
}

function attachKeyboard(container: HTMLElement): void {
  container.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    const wrapper = target.closest<HTMLElement>('.pl-select');
    if (!wrapper) return;
    const isTrigger = target.classList.contains('pl-select__trigger');
    const isOption = target.classList.contains('pl-select__option');

    if (isTrigger && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      toggleMenu(wrapper, true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      toggleMenu(wrapper, false);
      if (isOption) wrapper.querySelector<HTMLButtonElement>(TRIGGER)?.focus();
    } else if (isOption) {
      handleOptionKey(event, wrapper, target);
    }
  });
}

function handleOptionKey(event: KeyboardEvent, wrapper: HTMLElement, target: HTMLElement): void {
  const items = Array.from(wrapper.querySelectorAll<HTMLElement>(OPTION));
  const index = items.indexOf(target);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    items[Math.max(0, Math.min(index + step, items.length - 1))]?.focus();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    target.click();
  }
}
