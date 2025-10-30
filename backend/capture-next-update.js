const { exec } = require('child_process');

console.log('🎯 Aguardando próxima requisição de updateLead...\n');
console.log('Por favor, teste agora salvando o lead com duração de 2 horas (180 minutos)\n');

// Monitorar logs em tempo real
const monitor = exec('npm run start:dev 2>&1 | grep --line-buffered -A 20 "DEBUG updateLead"');

let captureCount = 0;
monitor.stdout.on('data', (data) => {
  console.log(data);
  captureCount++;
  if (captureCount >= 3) {
    console.log('\n✅ Captura completa! Encerrando...');
    process.exit(0);
  }
});

monitor.stderr.on('data', (data) => {
  console.error('Erro:', data);
});

setTimeout(() => {
  console.log('\n⏱️ Timeout - nenhuma requisição detectada em 60 segundos');
  process.exit(0);
}, 60000);
