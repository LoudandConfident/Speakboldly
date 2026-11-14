export function initializeBeyondBookmarks(doc) {
  const win = doc.defaultView;
  const sidebar = doc.querySelector('.editorial-sidebar');
  if (!sidebar || doc.querySelector('.beyond-mobile-bookmarks')) return;

  const media = win.matchMedia('(max-width:999px)');
  const rail = doc.createElement('aside');
  rail.className = 'beyond-mobile-bookmarks';
  rail.setAttribute('aria-label', 'More from Beyond');
  let expanded = null;

  function collapse(restoreFocus = false) {
    if (!expanded) return;
    const { slot, button, panel, label } = expanded;
    panel.hidden = true;
    slot.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Expand ' + label);
    expanded = null;
    if (restoreFocus) button.focus({ preventScroll: true });
  }

  // Keep the expanded card beside its bookmark, including in landscape view.
  function positionCard() {
    if (!expanded) return;
    const { slot, button, panel } = expanded;
    const buttonRect = button.getBoundingClientRect();
    const center = buttonRect.top + buttonRect.height / 2;
    const height = panel.getBoundingClientRect().height;
    const top = Math.max(12, Math.min(center - height / 2, win.innerHeight - height - 12));
    panel.style.top = top - slot.getBoundingClientRect().top + 'px';
    panel.style.setProperty('--bookmark-origin-y', center - top + 'px');
  }

  for (const [key, label, selector] of [
    ['monthly', 'Monthly edit', '.monthly-edit-card'],
    ['interpret', 'Interpret Boldly', '.interpret-preview-card'],
    ['sign', 'Sign language', '.sign-language-preview-card']
  ]) {
    const source = sidebar.querySelector(selector);
    if (!source) continue;
    const slot = doc.createElement('div');
    slot.className = 'beyond-bookmark-slot beyond-bookmark-slot-' + key;
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'beyond-bookmark beyond-bookmark-' + key;
    button.textContent = label;
    button.setAttribute('aria-label', 'Expand ' + label);
    button.setAttribute('aria-expanded', 'false');

    const panel = doc.createElement('section');
    panel.className = 'beyond-bookmark-panel';
    panel.id = 'beyond-bookmark-' + key + '-card';
    panel.hidden = true;
    const preview = source.cloneNode(true);
    preview.querySelector('h2').id = panel.id + '-heading';
    panel.setAttribute('aria-labelledby', panel.id + '-heading');
    button.setAttribute('aria-controls', panel.id);
    panel.append(preview);
    slot.append(button, panel);
    rail.append(slot);

    button.addEventListener('click', () => {
      if (!media.matches) return;
      if (expanded?.button === button) {
        collapse();
        return;
      }
      collapse();
      expanded = { slot, button, panel, label };
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Collapse ' + label);
      positionCard();
      slot.classList.add('is-open');
    });
  }

  // This is an ordinary card: the rest of the page stays usable and scrollable.
  doc.addEventListener('pointerdown', event => {
    if (expanded && !expanded.slot.contains(event.target)) collapse();
  });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) collapse(true);
  });
  media.addEventListener('change', () => {
    if (!media.matches) collapse();
  });
  win.addEventListener('resize', positionCard);
  win.visualViewport?.addEventListener('resize', positionCard);
  win.addEventListener('pagehide', () => collapse());
  doc.body.append(rail);
  doc.body.classList.add('beyond-bookmarks-ready');
}

if (typeof document !== 'undefined') initializeBeyondBookmarks(document);
