import { meta as triangleMeta } from "./triangle/meta.js";
import { meta as ecgMeta } from "./ecg/meta.js";
import { meta as linesMeta } from "./lines/meta.js";
import { meta as pendulumMeta } from "./pendulum/meta.js";
import { meta as spiralMeta } from "./spiral/meta.js";
import { meta as rotationsMeta } from "./rotations/meta.js";

function defineExperiment(meta, load) {
  return {
    ...meta,
    start: async (options) => (await load())(options),
  };
}

export const experiments = [
  defineExperiment(triangleMeta, () =>
    import("./triangle/Experiment.js").then(({ startTriangleExperiment }) => startTriangleExperiment)
  ),
  defineExperiment(ecgMeta, () =>
    import("./ecg/Experiment.js").then(({ startECGExperiment }) => startECGExperiment)
  ),
  defineExperiment(linesMeta, () =>
    import("./lines/Experiment.js").then(({ startLineSpectrumExperiment }) => startLineSpectrumExperiment)
  ),
  defineExperiment(pendulumMeta, () =>
    import("./pendulum/Experiment.js").then(({ startChaosPendulumExperiment }) => startChaosPendulumExperiment)
  ),
  defineExperiment(spiralMeta, () =>
    import("./spiral/Experiment.js").then(({ startSpiralOrbitExperiment }) => startSpiralOrbitExperiment)
  ),
  defineExperiment(rotationsMeta, () =>
    import("./rotations/Experiment.js").then(({ startRotationsExperiment }) => startRotationsExperiment)
  ),
];

export const experimentsById = Object.fromEntries(
  experiments.map((experiment) => [experiment.id, experiment])
);
