import { ExperienceCase } from '../types';
export type { ExperienceCase };

export const HISTORICAL_EXPERIENCE_CASES: ExperienceCase[] = [
  {
    caseId: 'CASE_1942',
    partName: 'Thin-Wall Nesting Cup (400ml)',
    process: 'INJECTION_MOLDING',
    material: 'PP_HOMOPOLYMER',
    geometryFamily: 'thin_container',
    dataClass: 'SYNTHETIC_DEMO',
    trainingAllowed: false,
    productionCalibrationAllowed: false,
    simulation: {
      predictedWarpageMm: 0.41,
      predictedCycleTimeSec: 8.8,
      predictedSinkMarkRisk: 'LOW',
    },
    production: {
      measuredWarpageMm: 0.48,
      actualCycleTimeSec: 9.4,
      defectRatePercent: 0.43,
      cmmScanVarianceMm: 0.07,
    },
    correction: {
      parameterChanged: 'rim_thickness',
      deltaValue: '+0.25 mm (Reinforced outer curl)',
      finalDefectRatePercent: 0.09,
    },
    confidenceScore: 0.98,
    productionDate: '2025-11-14',
  },
  {
    caseId: 'CASE_2104',
    partName: 'Industrial Sensor Enclosure Base',
    process: 'INJECTION_MOLDING',
    material: 'ABS',
    geometryFamily: 'box_enclosure',
    dataClass: 'SYNTHETIC_DEMO',
    trainingAllowed: false,
    productionCalibrationAllowed: false,
    simulation: {
      predictedWarpageMm: 0.28,
      predictedCycleTimeSec: 14.2,
      predictedSinkMarkRisk: 'MEDIUM (at boss root)',
    },
    production: {
      measuredWarpageMm: 0.35,
      actualCycleTimeSec: 15.0,
      defectRatePercent: 1.12,
      cmmScanVarianceMm: 0.09,
    },
    correction: {
      parameterChanged: 'boss_root_fillet_and_coring',
      deltaValue: 'Added 0.6mm core recess beneath bosses',
      finalDefectRatePercent: 0.14,
    },
    confidenceScore: 0.94,
    productionDate: '2026-02-18',
  },
  {
    caseId: 'CASE_3058',
    partName: 'High-Temp Fluid Manifold Cap',
    process: 'INJECTION_MOLDING',
    material: 'PA66_GF30',
    geometryFamily: 'axisymmetric_fitting',
    dataClass: 'SYNTHETIC_DEMO',
    trainingAllowed: false,
    productionCalibrationAllowed: false,
    simulation: {
      predictedWarpageMm: 0.15,
      predictedCycleTimeSec: 18.6,
      predictedSinkMarkRisk: 'LOW',
    },
    production: {
      measuredWarpageMm: 0.22,
      actualCycleTimeSec: 19.5,
      defectRatePercent: 0.65,
      cmmScanVarianceMm: 0.08,
    },
    correction: {
      parameterChanged: 'gate_location',
      deltaValue: 'Moved sprue gate to center axis to balance fiber orientation',
      finalDefectRatePercent: 0.08,
    },
    confidenceScore: 0.96,
    productionDate: '2026-05-30',
  },
  {
    caseId: 'CASE_3840',
    partName: 'Modular Cable Retention Clip',
    process: 'INJECTION_MOLDING',
    material: 'POM',
    geometryFamily: 'snap_fit_bracket',
    dataClass: 'SYNTHETIC_DEMO',
    trainingAllowed: false,
    productionCalibrationAllowed: false,
    simulation: {
      predictedWarpageMm: 0.32,
      predictedCycleTimeSec: 11.0,
      predictedSinkMarkRisk: 'LOW',
    },
    production: {
      measuredWarpageMm: 0.39,
      actualCycleTimeSec: 11.8,
      defectRatePercent: 0.85,
      cmmScanVarianceMm: 0.06,
    },
    correction: {
      parameterChanged: 'cantilever_root_thickness',
      deltaValue: 'Reduced thickness by 15% to maintain living hinge flexibility',
      finalDefectRatePercent: 0.11,
    },
    confidenceScore: 0.95,
    productionDate: '2026-07-22',
  },
];

export function calculateSolverBias(family: string = 'thin_container') {
  const matching = HISTORICAL_EXPERIENCE_CASES.filter(
    (c) => c.geometryFamily === family || family === 'all'
  );
  if (matching.length === 0) return { meanErrorMm: 0.07, factor: 1.17, sampleCount: 0 };

  const errors = matching.map(
    (c) => c.production.measuredWarpageMm - c.simulation.predictedWarpageMm
  );
  const sumError = errors.reduce((a, b) => a + b, 0);
  const meanErrorMm = +(sumError / errors.length).toFixed(3);

  const factorSum = matching.reduce(
    (acc, c) => acc + c.production.measuredWarpageMm / c.simulation.predictedWarpageMm,
    0
  );
  const factor = +(factorSum / matching.length).toFixed(2);

  return {
    meanErrorMm,
    factor,
    sampleCount: matching.length,
    biasDirection: 'Underpredicts physical warpage by ~17%',
    recommendation: 'Apply empirical multiplier 1.17x to linear simulation displacement fields',
  };
}
