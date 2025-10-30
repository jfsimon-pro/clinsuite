const { create } = require('venom-bot');

async function testQRCodeSimple() {
  console.log('🚀 Teste simples do QR Code...');
  
  try {
    // Criar sessão VenomBot
    console.log('📱 Criando sessão...');
    const session = await create('test-simple');
    
    console.log('✅ Sessão criada!');
    console.log('⏳ Aguardando 10 segundos para QR Code...');
    
    // Aguardar 10 segundos
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Tentar obter QR Code
    console.log('🔍 Buscando QR Code...');
    const qrCode = await session.getQrCode();
    
    console.log('📋 Resultado:', qrCode);
    
    if (qrCode && qrCode.base64Image) {
      console.log('🎉 QR Code encontrado!');
      console.log('📏 Tamanho:', qrCode.base64Image.length, 'caracteres');
      
      // Salvar em arquivo
      const fs = require('fs');
      fs.writeFileSync('qr-real.txt', qrCode.base64Image);
      console.log('💾 Salvo em qr-real.txt');
      
    } else {
      console.log('❌ QR Code não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testQRCodeSimple();
