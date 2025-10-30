const fs = require('fs');
const { exec } = require('child_process');

exec('npm run start:dev 2>&1', (error, stdout) => {
  // This won't execute, just capture
});

// Create a simple log viewer
let lastLog = '';
console.log('⏳ Aguardando próximo request...');

setTimeout(() => {
  console.log('Tempo esgotado');
  process.exit(0);
}, 30000);
