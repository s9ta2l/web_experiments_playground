import test from "node:test";
import assert from "node:assert/strict";
import { getStoryCrop, STORY_WIDTH, STORY_HEIGHT } from "./photoCapture.js";

test("a landscape webcam view uses the centered portrait region", () => {
  assert.deepEqual(getStoryCrop(1440, 900), {
    width: 506.25, height: 900, left: 466.875, top: 0,
  });
});

test("a tall phone view keeps its width and crops equally at top and bottom", () => {
  const crop = getStoryCrop(390, 844);
  assert.equal(crop.width, 390);
  assert.ok(Math.abs(crop.height - 693.3333333333334) < 1e-10);
  assert.ok(Math.abs(crop.top - 75.3333333333333) < 1e-10);
  assert.equal(crop.left, 0);
});

test("an existing Story-shaped view needs no cropping", () => {
  assert.deepEqual(getStoryCrop(1080, 1920), {
    width: 1080, height: 1920, left: 0, top: 0,
  });
});

test("all screen shapes export a centered, bounded crop without stretching", () => {
  for (const [width, height] of [[320, 568], [568, 320], [844, 390], [1000, 1000], [3840, 2160]]) {
    const crop = getStoryCrop(width, height);
    assert.ok(crop.left >= 0 && crop.top >= 0);
    assert.ok(crop.width <= width && crop.height <= height);
    assert.equal(crop.left * 2 + crop.width, width);
    assert.equal(crop.top * 2 + crop.height, height);
    assert.ok(Math.abs(STORY_WIDTH / crop.width - STORY_HEIGHT / crop.height) < 1e-10);
  }
});
