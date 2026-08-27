import type { FieldSpec } from './types.ts'

export const D_STAT_MILL_BITS = [
  { name: 'UseSimulatorInputs', description: 'UseSimulatorInputs' },
  { name: '', description: 'thread in progress' },
  { name: 'PassInProgress', description: 'PassInProgress' },
  { name: 'MillRolling', description: 'MillRolling' },
  { name: 'MillAccelerating', description: 'MillAccelerating' },
  { name: 'MillDecelerating', description: 'MillDecelerating' },
  { name: 'MillStopped', description: 'MillStopped' },
  { name: 'MillVented', description: 'MillVented' },
  { name: '', description: 'Coil on Pay Off Reel' },
  { name: '', description: '' },
  { name: 'EndOfCoil', description: 'EndOfCoil' },
  { name: '', description: '' },
  { name: 'EntryTensionEstablished', description: 'EntryTensionEstablished' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: 'RollChangeFlag', description: 'Set on Roll Change' },
] as const

export const D_STAT_MILL2_BITS = [
  { name: 'DrivesInEStop', description: 'DrivesInHold' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: 'DrivesInNStop', description: 'DrivesInNStop' },
  { name: 'DrivesInRun', description: 'DrivesInRun' },
  { name: 'DrivesInThread', description: 'DrivesInThread' },
  { name: 'StripInStand', description: 'StripInStand' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: '', description: '' },
  { name: '', description: 'request setup' },
  { name: '', description: '' },
] as const

export const CYCLIC_MESSAGE_LAYOUT: FieldSpec[] = [
  { kind: 'word', name: 'Length', description: '' },
  { kind: 'word', name: 'Msg Number', description: '' },
  { kind: 'long', name: 'Sequence Number', description: '' },
  {
    kind: 'bitfield',
    name: 'D_STAT_MILL',
    description: 'Word(bit#)',
    bits: [...D_STAT_MILL_BITS],
  },
  {
    kind: 'bitfield',
    name: 'D_STAT_MILL2',
    description: 'Word(bit#)',
    bits: [...D_STAT_MILL2_BITS],
  },
  { kind: 'real', name: 'EntryWidth', description: 'from EMS' },
  { kind: 'spacer' },
  { kind: 'real', name: 'EntryCoilDiameter', description: '' },
  { kind: 'real', name: 'EntryPyroTemp', description: '' },
  { kind: 'real', name: 'Spare', description: '' },
  { kind: 'real', name: 'DSEstimatedRollGap', description: 'actual gaps' },
  { kind: 'real', name: 'NDSEstimatedRollGap', description: 'actual gaps' },
  { kind: 'real', name: 'BendForceMV', description: 'actual' },
  { kind: 'real', name: 'BendTotalForceRef', description: 'actual' },
  { kind: 'real', name: 'DSCylinderPressureMV', description: 'actual' },
  { kind: 'real', name: 'NDSCylinderPressureMV', description: 'actual' },
  { kind: 'real', name: 'DSStripForceMV', description: 'actual' },
  { kind: 'real', name: 'NDSStripForceMV', description: 'actual' },
  { kind: 'real', name: 'EntryTenRunRef', description: 'target' },
  { kind: 'real', name: 'EntryTensionInput', description: 'actual' },
  { kind: 'real', name: 'EntryLaserSpeed', description: '' },
  { kind: 'real', name: 'ExitLaserSpeed', description: '' },
  { kind: 'real', name: 'ElongationReference', description: '' },
  { kind: 'real', name: 'ElongationError', description: '' },
  { kind: 'real', name: 'MillSpeed', description: 'actual speed' },
  { kind: 'real', name: 'MainDriveAmps', description: 'total amps' },
  {
    kind: 'real',
    name: 'EstimatedForwardSlip',
    description: 'fixed number in vantage (1.02)',
  },
  { kind: 'char', name: 'CoilNumber', description: 'echo back', length: 20 },
  { kind: 'real', name: 'Torque', description: 'feedback for model' },
  { kind: 'real', name: 'length', description: 'feedback for model' },
  { kind: 'real', name: 'Actual Exit Gauge', description: 'future' },
  { kind: 'spacer' },
  { kind: 'real', name: 'Spare1', description: '' },
  { kind: 'real', name: 'Spare2', description: '' },
  { kind: 'real', name: 'Spare3', description: '' },
  { kind: 'real', name: 'Spare4', description: '' },
  { kind: 'real', name: 'Spare5', description: '' },
  {
    kind: 'padding',
    name: 'Spares(20)',
    description: '',
    length: 80,
  },
]

export function cyclicMessageByteLength(): number {
  let size = 0
  for (const field of CYCLIC_MESSAGE_LAYOUT) {
    switch (field.kind) {
      case 'word':
      case 'bitfield':
        size += 2
        break
      case 'long':
      case 'real':
        size += 4
        break
      case 'char':
      case 'padding':
        size += field.length
        break
      case 'spacer':
        break
    }
  }
  return size
}
