(function () {
  const shellSelector = '.game-shell';

  function isCoarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  function lockScroll(event) {
    if (!isCoarsePointer()) {
      return;
    }

    if (event.pointerType === 'mouse') {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
  }

  function attachScrollLock() {
    const shells = document.querySelectorAll(shellSelector);

    shells.forEach((shell) => {
      shell.addEventListener('pointerdown', lockScroll, { passive: false });
      shell.addEventListener('pointermove', lockScroll, { passive: false });
      shell.addEventListener('touchstart', (event) => {
        if (event.cancelable) {
          event.preventDefault();
        }
      }, { passive: false });
      shell.addEventListener('touchmove', (event) => {
        if (event.cancelable) {
          event.preventDefault();
        }
      }, { passive: false });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachScrollLock, { once: true });
    return;
  }

  attachScrollLock();
})();
