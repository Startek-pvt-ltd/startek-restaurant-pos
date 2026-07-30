export async function waitForReceiptImages() {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(".receipt img"));

  await Promise.all(images.map(async (image) => {
    if (!image.complete) {
      await new Promise<void>((resolve, reject) => {
        const loaded = () => { cleanup(); resolve(); };
        const failed = () => { cleanup(); reject(new Error("Receipt logo failed to load.")); };
        const cleanup = () => {
          image.removeEventListener("load", loaded);
          image.removeEventListener("error", failed);
        };
        image.addEventListener("load", loaded, { once: true });
        image.addEventListener("error", failed, { once: true });
      });
    }

    if (image.naturalWidth === 0 || image.naturalHeight === 0) throw new Error("Receipt logo failed to load.");
    await image.decode().catch(() => {
      if (image.naturalWidth === 0) throw new Error("Receipt logo could not be decoded.");
    });
  }));
}

export async function printReceiptWhenReady() {
  await waitForReceiptImages();
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  window.print();
}
