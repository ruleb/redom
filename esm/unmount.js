import { getEl } from './util.js';
import { trigger } from './mount.js';

export function unmount (parent, child) {
  const parentEl = getEl(parent);
  const childEl = getEl(child);

  if (child === childEl && childEl.__redom_view) {
    // try to look up the view if not provided
    child = childEl.__redom_view;
  }

  if (childEl.parentNode) {
    doUnmount(child, childEl, parentEl);

    parentEl.removeChild(childEl);
  }

  return child;
}

export function doUnmount (child, childEl, parentEl) {
  const hooks = childEl.__redom_lifecycle;

  if (hooksAreEmpty(hooks)) {
    childEl.__redom_lifecycle = {};
    return;
  }

  let traverse = parentEl;

  if (childEl.__redom_mounted) {
    trigger(childEl, 'onunmount');
  }

  // Triggered = if we see a redom parent, we stop walking up, since the mount function also does the same.
  let triggered = false;

  while (traverse) {
    if (triggered) {
      break;
    }
    const traverseHooks = (traverse.__redom_lifecycle || {});

    // Search for a redom traverse view and trigger
    for (const hook in hooks) {
      if (traverseHooks[hook]) {
        traverseHooks[hook] -= hooks[hook];
        triggered = true;
      }
    }

    traverse = traverse.parentNode;
  }
}

function hooksAreEmpty (hooks) {
  if (hooks == null) {
    return true;
  }
  for (const key in hooks) {
    if (hooks[key]) {
      return false;
    }
  }
  return true;
}
