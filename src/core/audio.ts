let bgm: HTMLAudioElement | null = null;

export function playBackgroundMusic() {
  // Example: start music after first click/tap
  window.addEventListener(
    "pointerdown",
    () => {
      if (!bgm) {
        bgm = new Audio("sounds/theme.mp3");
        bgm.loop = true;
        bgm.volume = 0.5;
      }

      // many ad networks require music to start after user interaction
      // so we call .play() only after a click/tap
      bgm.play().catch((err) =>
        // eslint-disable-next-line no-console
        console.warn("Autoplay blocked until user interaction:", err),
      );
    },
    { once: true },
  );
}

export function stopBackgroundMusic() {
  if (!bgm) return;

  bgm.pause();
  bgm.currentTime = 0;
}

export function playClick() {
  void new Audio("sounds/click.mp3").play();
}

export function playPlaceSound() {
  void new Audio("sounds/place.mp3").play();
}

export function playWinSound() {
  void new Audio("sounds/win.mp3").play();
}
