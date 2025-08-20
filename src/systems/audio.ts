let bgm: HTMLAudioElement | null = null;

export function playBackgroundMusic() {
  if (!bgm) {
    bgm = new Audio("public/sounds/theme.mp3");
    bgm.loop = true;
    bgm.volume = 0.5;
  }

  // many ad networks require music to start after user interaction
  // so we call .play() only after a click/tap
  bgm.play().catch((err) => {
    console.warn("Autoplay blocked until user interaction:", err);
  });
}

export function stopBackgroundMusic() {
  if (bgm) {
    bgm.pause();
    bgm.currentTime = 0;
  }
}
