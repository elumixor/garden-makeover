export function openStore(url: string) {
  const w = window as unknown as Window & {
    mraid?: { open: (url: string) => void };
  };

  if (w.mraid && typeof w.mraid.open === "function") {
    w.mraid.open(url);
  } else {
    window.open(url, "_blank");
  }
}
