export function openStore(url: string) {
  const w = window as any;
  if (w.mraid && typeof w.mraid.open === "function") {
    w.mraid.open(url);
  } else {
    window.open(url, "_blank");
  }
}
