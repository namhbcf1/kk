// This file imports component data from module files and makes them available globally
// to be used by the non-module scripts

// Import all component data
import { vgaData } from './js/data/vga.js';
import { ramData } from './js/data/ram.js';
import { ssdData } from './js/data/ssd.js';
import { cpuData } from './js/data/cpu.js';
import { mainboardData } from './js/data/mainboard.js';
import { caseData } from './js/data/case.js';
import { cpuCoolerData } from './js/data/cpuCooler.js';
import { psuData } from './js/data/psu.js';
import { hddData } from './js/data/hdd.js';
import { monitorData } from './js/data/monitor.js';

// Log the data being imported for debugging
console.log('Importing component data from module files:');
console.log('- VGA data:', Object.keys(vgaData).length, 'items');
console.log('- RAM data:', Object.keys(ramData).length, 'items');
console.log('- SSD data:', Object.keys(ssdData).length, 'items');
console.log('- CPU data:', Object.keys(cpuData).length, 'items');
console.log('- Mainboard data:', Object.keys(mainboardData).length, 'items');
console.log('- Case data:', Object.keys(caseData).length, 'items');
console.log('- CPU Cooler data:', Object.keys(cpuCoolerData).length, 'items');
console.log('- PSU data:', Object.keys(psuData).length, 'items');
console.log('- HDD data:', Object.keys(hddData).length, 'items');
console.log('- Monitor data:', Object.keys(monitorData).length, 'items');

// Export all data to global window object
window.vgaData = vgaData;
window.ramData = ramData;
window.ssdData = ssdData;
window.cpuData = cpuData;
window.mainboardData = mainboardData;
window.caseData = caseData;
window.cpuCoolerData = cpuCoolerData;
window.psuData = psuData;
window.hddData = hddData;
window.monitorData = monitorData;

console.log('✅ All component data has been imported and attached to window object'); 