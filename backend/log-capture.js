const fs = require('fs');

// Interceptar console.log original
const originalLog = console.log;
let capturing = false;
let buffer = '';

console.log = function(...args) {
  const msg = args.join(' ');
  
  if (msg.includes('DEBUG updateLead - Dados recebidos:')) {
    capturing = true;
    buffer = '========== CAPTURA ==========\n';
  }
  
  if (capturing) {
    buffer += msg + '\n';
  }
  
  if (capturing && msg.includes('Lead retornado do banco:')) {
    capturing = false;
    buffer += '========== FIM ==========\n';
    fs.writeFileSync('/tmp/last-update-log.txt', buffer);
  }
  
  originalLog.apply(console, args);
};

console.log('✅ Log capture instalado');
