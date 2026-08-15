(function () {
  const shellSelector = '.game-shell';

  function isCoarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  function attachScrollLock() {
    const shells = document.querySelectorAll(shellSelector);

    shells.forEach((shell) => {
      shell.addEventListener('touchmove', (event) => {
        if (!isCoarsePointer()) {
          return;
        }

        if (event.cancelable) {
          event.preventDefault();
        }
      }, { passive: false });

      shell.addEventListener('wheel', (event) => {
        if (!isCoarsePointer()) {
          return;
        }

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
