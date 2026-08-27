# TM-L2-Interface

Data parsers for Wireshark captures of the mill Level 2 cyclic telegram.

Paste a hex dump (raw stream, space/colon separated bytes, or a Wireshark hex
dump with offsets) into the parser. It decodes little-endian words, longs,
IEEE-754 `REAL` values, the coil-number string, and the `D_STAT_MILL` /
`D_STAT_MILL2` bitfields, then can export the table to CSV.

## Run (no install)

Open `hex-parser.html` in any web browser. Double-click the file, or use
**File → Open**. Node, npm, and a web server are not required.

Paste a capture and click **Parse Hex Dump**, or click **Load Sample**.

## Message layout

Offsets are in bytes from the start of the cyclic payload. Multi-byte fields
are little-endian.

| Offset | Field | Type | Size |
| --- | --- | --- | --- |
| 0 | Length | Word | 2 |
| 2 | Msg Number | Word | 2 |
| 4 | Sequence Number | Long | 4 |
| 8 | D_STAT_MILL | Word (bitfield) | 2 |
| 10 | D_STAT_MILL2 | Word (bitfield) | 2 |
| 12 | EntryWidth | REAL | 4 |
| 16 | EntryCoilDiameter | REAL | 4 |
| 20 | EntryPyroTemp | REAL | 4 |
| 24 | Spare | REAL | 4 |
| 28 | DSEstimatedRollGap | REAL | 4 |
| 32 | NDSEstimatedRollGap | REAL | 4 |
| 36 | BendForceMV | REAL | 4 |
| 40 | BendTotalForceRef | REAL | 4 |
| 44 | DSCylinderPressureMV | REAL | 4 |
| 48 | NDSCylinderPressureMV | REAL | 4 |
| 52 | DSStripForceMV | REAL | 4 |
| 56 | NDSStripForceMV | REAL | 4 |
| 60 | EntryTenRunRef | REAL | 4 |
| 64 | EntryTensionInput | REAL | 4 |
| 68 | EntryLaserSpeed | REAL | 4 |
| 72 | ExitLaserSpeed | REAL | 4 |
| 76 | ElongationReference | REAL | 4 |
| 80 | ElongationError | REAL | 4 |
| 84 | MillSpeed | REAL | 4 |
| 88 | MainDriveAmps | REAL | 4 |
| 92 | EstimatedForwardSlip | REAL | 4 |
| 96 | CoilNumber | char | 20 |
| 116 | Torque | REAL | 4 |
| 120 | length | REAL | 4 |
| 124 | Actual Exit Gauge | REAL | 4 |
| 128 | Spare1–Spare5 | REAL | 4 each |
| 148 | Spares(20) | padding | 80 |

Total encoded size is 228 bytes.
