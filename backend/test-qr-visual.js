const { create } = require('venom-bot');

async function testQRCodeVisual() {
  console.log('🚀 Teste visual do QR Code...');
  
  try {
    // Criar sessão VenomBot SEM headless
    console.log('📱 Criando sessão VISUAL...');
    const session = await create('test-visual', {
      headless: false, // Browser visível
      useChrome: true,
      debug: true,
      logQR: true
    });
    
    console.log('✅ Sessão criada! Browser deve estar aberto.');
    console.log('📱 Escaneie o QR Code que aparece no browser!');
    console.log('⏳ Aguardando 30 segundos...');
    
    // Aguardar 30 segundos para você escanear
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('🔍 Testando se conectou...');
    const qrCode = await session.getQrCode();
    console.log('📋 QR Code ainda disponível?', !!qrCode);
    
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testQRCodeVisual();
