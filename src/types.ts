/**
 * Core Type Definitions for AI Manufacturing Design Engine
 * Conforms to Master Project Handbook and Parameter State Model
 */

export type ParameterStatus =
  | 'LOCKED'
  | 'VERIFIED'
  | 'CALCULATED'
  | 'INFERRED'
  | 'OPTIMIZED'
  | 'UNKNOWN'
  | 'CONFLICT'
  | 'FAILED';

export interface ProvenanceRecord {
  timestamp: string;
  actor: string;
  action: string;
  previousValue?: number | string | boolean | null;
  ruleReference?: string;
}

export interface CanonicalParameter {
  id: string;
  name: string;
  label: string;
  value: number | string | boolean;
  unit: string;
  status: ParameterStatus;
  source: string;
  rulesetVersion?: string;
  confidence: number;
  allowedRange?: { min: number; max: number };
  description?: string;
  provenance: ProvenanceRecord[];
}

export type ManufacturingProcessType =
  | 'INJECTION_MOLDING'
  | 'CNC_MACHINING'
  | 'SHEET_METAL'
  | 'ADDITIVE';

export interface MaterialSpecification {
  id: string;
  name: string;
  grade: string;
  family: string;
  density: number; // g/cm³
  youngsModulus: number; // MPa
  yieldStrength: number; // MPa
  tensileStrength: number; // MPa
  thermalShrinkage: number; // %
  minWallThickness: number; // mm
  maxWallThickness: number; // mm
  recommendedDraftAngle: number; // deg
  meltTemperature: number; // °C
  moldTemperature: number; // °C
  costPerKg: number; // USD
  foodContactCertified: boolean;
  provenance: string;
}

export interface DSLGeometryProfile {
  bottomDiameter: number;
  topDiameter: number;
  height: number;
  baseThickness?: number;
}

export interface DSLGeometryFeatures {
  shellThickness: number;
  draftAngle: number;
  baseFilletRadius: number;
  rimRadius: number;
  embossDepth?: number;
  ribCount?: number;
  ribThickness?: number;
  bossOuterDia?: number;
  bossHoleDia?: number;
}

export interface ManufacturingDSLModel {
  partName: string;
  revision: number;
  process: ManufacturingProcessType;
  material: string;
  requirements: {
    targetVolumeMl: number;
    maxHeightMm: number;
    stackable: boolean;
    dropTestPassed?: boolean;
    minSafetyFactor: number;
  };
  geometry: {
    profile: DSLGeometryProfile;
    modifiers: DSLGeometryFeatures;
  };
  locks: string[];
  optimizeObjectives: {
    minimizeMass: boolean;
    maintainStiffness: boolean;
    minimizeCycleTime: boolean;
  };
  rawDSLText: string;
}

export type GateStatus =
  | 'PASS'
  | 'FAIL'
  | 'RUNNING'
  | 'SKIPPED'
  | 'PENDING_REVIEW';

export interface ValidationGateResult {
  gateNumber: number;
  gateName: string;
  purpose: string;
  relativeCost: 'Very low' | 'Low' | 'Medium' | 'High' | 'Human' | 'Physical' | 'Production';
  status: GateStatus;
  executionTimeMs: number;
  metrics: Record<string, number | string | boolean>;
  diagnosticMessage: string;
  executor?: string;
  engine_version?: string;
  ruleset_version?: string;
  input_revision?: number;
  started_at?: string;
  completed_at?: string;
  evidence?: Record<string, any>;
  validationType?: 'REAL_VALIDATION' | 'DEMO_RESULT';
  failureEvidence?: {
    errorCode: string;
    region: string;
    measuredValue: number | string;
    requiredValue: number | string;
    lockedConstraints: string[];
    availableActions: string[];
  };
}

export interface DeltaContextPayload {
  jobId: string;
  revision: number;
  failedGate: number;
  errorCode: string;
  cause: string;
  region: string;
  currentValue: string;
  requiredValue: string;
  lockedConstraints: string[];
  availableActions: string[];
  recommendedPatch: string;
}

export interface ExperienceCase {
  caseId: string;
  partName: string;
  process: ManufacturingProcessType;
  material: string;
  geometryFamily: string;
  dataClass: 'SYNTHETIC_DEMO' | 'PRODUCTION_FACTORY';
  trainingAllowed: boolean;
  productionCalibrationAllowed: boolean;
  simulation: {
    predictedWarpageMm: number;
    predictedCycleTimeSec: number;
    predictedSinkMarkRisk?: string;
    predictedCoolingTimeSec?: number;
  };
  production: {
    measuredWarpageMm: number;
    actualCycleTimeSec: number;
    defectRatePercent: number;
    cmmScanVarianceMm?: number;
    machineId?: string;
    measuredWeightGrams?: number;
    outcome?: string;
  };
  correction?: {
    parameterChanged: string;
    deltaValue: string;
    finalDefectRatePercent: number;
  };
  confidenceScore?: number;
  productionDate?: string;
  systematicErrorMm?: number;
}

export interface OpenSourceRepoEntry {
  repository: string;
  url: string;
  category: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Reference' | 'Benchmark';
  decision: 'USE AS DEPENDENCY' | 'RESEARCH / ADAPT CONCEPTS' | 'STUDY REFERENCE' | 'BENCHMARK' | 'REJECT';
  capabilities: string[];
  doWeReimplement: boolean;
  wrapperRequired: boolean;
  license: string;
  risk: string;
  internalInterface: string;
  phase: string;
}

export interface GeometricFaceData {
  id: string | number;
  semanticTag?: string;
  type?: string;
  normal?: [number, number, number];
  areaMm2: number;
  minThicknessMm?: number;
  draftAngleDeg?: number;
  isUndercut?: boolean;
  isBlocked?: boolean;
  positions?: number[];
  indices?: number[];
}

export interface RealInspectorResult {
  revision: string;
  dimensions: [number, number, number];
  volume: number;
  area: number;
  edges: number;
  solids: number;
  faces: GeometricFaceData[];
  provenance: {
    geometry: string;
    analysis: string;
    createdAt: string;
    algorithm: string;
    units: string;
    material: string;
    direction: string;
    [key: string]: any;
  };
  limitations: string[];
  filename: string;
}
