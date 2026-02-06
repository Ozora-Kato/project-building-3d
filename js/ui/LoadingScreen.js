export class LoadingScreen {
  constructor() {
    this.screen = document.getElementById('loading-screen');
    this.barFill = document.getElementById('loading-bar-fill');
    this.textEl = document.getElementById('loading-text');
    this.progress = 0;
  }

  setProgress(value, label) {
    this.progress = Math.min(value, 100);
    this.barFill.style.width = `${this.progress}%`;
    if (label) {
      this.textEl.textContent = label;
    }
  }

  hide() {
    this.setProgress(100, 'READY');
    setTimeout(() => {
      this.screen.classList.add('fade-out');
      setTimeout(() => {
        this.screen.style.display = 'none';
      }, 1500);
    }, 500);
  }
}
