const { create } = require('venom-bot');

async function testQRCodeBrowser() {
  console.log('🚀 Teste QR Code no Browser...');
  
  try {
    // Criar sessão VenomBot SEM headless
    console.log('📱 Criando sessão VISUAL...');
    const session = await create('browser-test', {
      headless: false, // Browser visível
      useChrome: true,
      debug: true,
      logQR: true
    });
    
    console.log('✅ Sessão criada! Browser deve estar aberto.');
    console.log('📱 Escaneie o QR Code que aparece no browser!');
    console.log('⏳ Aguardando 60 segundos para você escanear...');
    
    // Aguardar 60 segundos para você escanear
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    console.log('🔍 Testando se conectou...');
    const qrCode = await session.getQrCode();
    console.log('📋 QR Code ainda disponível?', !!qrCode);
    
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testQRCodeBrowser();
