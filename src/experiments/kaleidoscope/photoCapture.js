export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
export const JPEG_QUALITY = 0.92;

// Use the same centered, unstretched portrait crop for the guide and export.
export function getStoryCrop(width, height) {
  const cropWidth = Math.min(width, height * STORY_WIDTH / STORY_HEIGHT);
  const cropHeight = cropWidth * STORY_HEIGHT / STORY_WIDTH;
  return {
    width: cropWidth,
    height: cropHeight,
    left: (width - cropWidth) / 2,
    top: (height - cropHeight) / 2,
  };
}

export function captureStoryPhoto(sketch, shader, width, height) {
  const crop = getStoryCrop(width, height);
  // Allocate the full-size surface only on capture, sharing the live WebGL context.
  const frame = sketch.createFramebuffer({
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    density: 1,
    format: sketch.UNSIGNED_BYTE,
    channels: sketch.RGBA,
    depth: false,
    antialias: false,
  });
  let canvas;
  try {
    if (frame.width !== STORY_WIDTH || frame.height !== STORY_HEIGHT) {
      throw new Error("The device cannot render the Story photo size.");
    }
    frame.begin();
    try {
      sketch.clear();
      sketch.noStroke();
      sketch.shader(shader);
      shader.setUniform("uFrameSize", [crop.width, crop.height]);
      sketch.plane(STORY_WIDTH, STORY_HEIGHT);
    } finally {
      frame.end();
      shader.setUniform("uFrameSize", [width, height]);
    }
    // Read once into a stable image: encoding must not depend on future camera frames.
    canvas = frame.get().canvas;
  } finally {
    frame.remove();
  }

  // Future artwork overlays can be composed on this image before encoding.
  return new Promise((resolve, reject) => {
    const release = () => { canvas.width = canvas.height = 1; };
    try {
      canvas.toBlob((blob) => {
        release();
        if (blob?.type === "image/jpeg") resolve(blob);
        else reject(new Error("The browser could not encode the photo as a JPEG."));
      }, "image/jpeg", JPEG_QUALITY);
    } catch (error) {
      release();
      reject(error);
    }
  });
}
