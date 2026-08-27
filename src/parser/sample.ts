import { bytesToHex } from './hex.ts'
import { encodeCyclicMessage } from './cyclicMessage.ts'

export const SAMPLE_VALUES = {
  length: 228,
  msgNumber: 10,
  sequenceNumber: 0x5cc8,
  dStatMill: 0x310c,
  dStatMill2: 0x0005,
  coilNumber: 'TM-COIL-001',
  reals: {
    EntryWidth: 1250.5,
    EntryCoilDiameter: 1850.25,
    EntryPyroTemp: 72.3,
    Spare: 0,
    DSEstimatedRollGap: 2.15,
    NDSEstimatedRollGap: 2.18,
    BendForceMV: 450,
    BendTotalForceRef: 480,
    DSCylinderPressureMV: 2100,
    NDSCylinderPressureMV: 2085,
    DSStripForceMV: 12500,
    NDSStripForceMV: 12480,
    EntryTenRunRef: 35,
    EntryTensionInput: 34.8,
    EntryLaserSpeed: 800.5,
    ExitLaserSpeed: 816.5,
    ElongationReference: 1.02,
    ElongationError: 0.001,
    MillSpeed: 800,
    MainDriveAmps: 1250,
    EstimatedForwardSlip: 1.02,
    Torque: 185.5,
    length: 1250.75,
    'Actual Exit Gauge': 0.032,
    Spare1: 0,
    Spare2: 0,
    Spare3: 0,
    Spare4: 0,
    Spare5: 0,
  },
} as const

export function sampleHexDump(): string {
  return bytesToHex(encodeCyclicMessage({ ...SAMPLE_VALUES, reals: { ...SAMPLE_VALUES.reals } }))
}
