#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';

const DAYS = 180;
const START = new Date(Date.UTC(2026, 2, 18));
const catalog = [
  ['NR-05','Surface Mining Equipment','Poor','Engine oil filter','FLT-ENG-797',5,0.35],
  ['NR-05','Surface Mining Equipment','Poor','Engine oil 15W-40','LUB-15W40-205',100,5.0],
  ['NR-05','Surface Mining Equipment','Poor','Engine bearing set','BRG-ENG-797',1,0.08],
  ['NR-12','Surface Mining Equipment','Fair','Pump seal kit','KIT-PMP-793',2,0.12],
  ['NR-12','Surface Mining Equipment','Fair','Coolant concentrate','CLT-50-205',120,3.2],
  ['NR-DR-03','Surface Mining Equipment','Fair','Drill rod 89 mm','WR-D89-600',20,0.7],
  ['NR-SH-01','Surface Mining Equipment','Good','Dipper tooth set','SUR-DIP-410',12,0.3],
  ['NR-DG-02','Surface Mining Equipment','Fair','Drag rope assembly','SUR-ROP-875',2,0.08],
  ['UG-CM-01','Underground Mining Equipment','Good','Cutting head pick set','UG-PCK-030',20,0.25],
  ['UG-LHD-02','Underground Mining Equipment','Fair','Lift-cylinder seal kit','UG-LFT-517',2,0.12],
  ['UG-JD-01','Underground Mining Equipment','Good','Boom hose kit','UG-HOS-422',3,0.10],
  ['UG-LW-01','Underground Mining Equipment','Fair','Hydraulic hose assembly','UG-HOS-LW1',2,0.12],
  ['PR-CR-01','Processing & Support Equipment','Good','Hydraulic accumulator','PR-ACC-450',2,0.08],
  ['PR-GM-02','Processing & Support Equipment','Fair','Mill bearing pad','PR-BRG-SAG',2,0.06],
  ['PR-CV-07','Processing & Support Equipment','Good','Idler roller set','PR-IDL-240',24,0.18],
  ['PR-PM-03','Processing & Support Equipment','Poor','Pump impeller','PR-IMP-XJ9',1,0.05],
  ['HC-PPE-01','Human consumables','Good','P2 dust respirator','PPE-RES-P2',24,0.45],
  ['HC-LGT-02','Human consumables','Good','Lamp battery pack','PPE-BAT-LMP',30,0.38],
  ['HC-HYG-03','Human consumables','Good','Class 5 earplugs','PPE-EAR-C5',50,0.75],
  ['HC-FST-04','Human consumables','Good','Eye wash bottle','MED-EYE-500',12,0.16],
];
const conditionFactor = { Excellent: 0.8, Good: 1, Fair: 1.2, Poor: 1.5, Critical: 2 };
const seeded = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
const rows = [];
for (let partIndex = 0; partIndex < catalog.length; partIndex += 1) {
  const [equipment, category, condition, part, number, , baseline] = catalog[partIndex];
  for (let day = 0; day < DAYS; day += 1) {
    const date = new Date(START); date.setUTCDate(date.getUTCDate() + day);
    const seasonality = 1 + 0.08 * Math.sin((day / DAYS) * Math.PI * 2);
    const maintenanceSpike = day > 0 && day % 37 === partIndex % 7;
    const anomaly = seeded(partIndex * 1000 + day) > 0.985;
    const spike = maintenanceSpike ? baseline * 2.8 : 0;
    const quantity = Math.max(0, Math.round((baseline * conditionFactor[condition] * seasonality + spike + (anomaly ? baseline * 3 : 0) + seeded(day + partIndex * 17) * baseline * 0.35) * 10) / 10);
    rows.push({ date: date.toISOString().slice(0, 10), equipment, category, condition, part, part_number: number, quantity, reason: maintenanceSpike ? 'Maintenance spike' : anomaly ? 'Anomaly' : 'Routine issue', anomaly });
  }
}
await mkdir('data', { recursive: true });
const header = 'date,equipment,category,condition,part,part_number,quantity,reason,anomaly\n';
const csv = header + rows.map((row) => [row.date, row.equipment, row.category, row.condition, row.part, row.part_number, row.quantity, row.reason, row.anomaly].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n';
await writeFile('data/forecast-consumption-180d.csv', csv);
await writeFile('data/forecast-summary.json', JSON.stringify({ generatedAt: '2026-09-14', days: DAYS, parts: catalog.length, rows: rows.length, scenarios: ['baseline usage', 'maintenance spikes', 'condition multiplier', 'seasonality', 'anomalies'] }, null, 2) + '\n');
console.log(`Generated ${rows.length} daily consumption rows for ${catalog.length} parts.`);
