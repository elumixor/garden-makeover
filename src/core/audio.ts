let bgm: HTMLAudioElement | null = null;

export function playBackgroundMusic() {
  // Example: start music after first click/tap
  window.addEventListener(
    "pointerdown",
    () => {
      if (import.meta.env.DEV) return;

      if (!bgm) {
        bgm = new Audio("public/sounds/theme.mp3");
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
