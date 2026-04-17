import { meta as triangleMeta } from "./triangle/meta.js";
import { startTriangleExperiment } from "./triangle/Experiment.js";
import { meta as ecgMeta } from "./ecg/meta.js";
import { startECGExperiment } from "./ecg/Experiment.js";
import { meta as linesMeta } from "./lines/meta.js";
import { startLineSpectrumExperiment } from "./lines/Experiment.js";
import { meta as pendulumMeta } from "./pendulum/meta.js";
import { startChaosPendulumExperiment } from "./pendulum/Experiment.js";
import { meta as spiralMeta } from "./spiral/meta.js";
import { startSpiralOrbitExperiment } from "./spiral/Experiment.js";

function defineExperiment(meta, start) {
  return {
    ...meta,
    start,
  };
}

export const experiments = [
  defineExperiment(triangleMeta, startTriangleExperiment),
  defineExperiment(ecgMeta, startECGExperiment),
  defineExperiment(linesMeta, startLineSpectrumExperiment),
  defineExperiment(pendulumMeta, startChaosPendulumExperiment),
  defineExperiment(spiralMeta, startSpiralOrbitExperiment),
];

export const experimentsById = Object.fromEntries(
  experiments.map((experiment) => [experiment.id, experiment])
);
