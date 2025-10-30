const { create } = require('venom-bot');
const QRCode = require('qrcode');

async function testQRCode() {
  console.log('🚀 Iniciando teste do QR Code...');
  
  try {
    // Criar sessão VenomBot
    console.log('📱 Criando sessão VenomBot...');
    const session = await create('test-session');
    
    console.log('✅ Sessão criada com sucesso!');
    console.log('⏳ Aguardando QR Code...');
    
    // Aguardar um pouco para o VenomBot inicializar
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Tentar obter QR Code
    console.log('🔍 Tentando obter QR Code...');
    const qrCode = await session.getQrCode();
    
    if (qrCode && qrCode.base64Image) {
      console.log('🎉 QR Code obtido com sucesso!');
      console.log('📋 QR Code (base64):', qrCode.base64Image.substring(0, 100) + '...');
      
      // Salvar QR Code em arquivo
      const fs = require('fs');
      const qrDataUrl = `data:image/png;base64,${qrCode.base64Image}`;
      fs.writeFileSync('qr-code-test.txt', qrDataUrl);
      console.log('💾 QR Code salvo em qr-code-test.txt');
      
      // Gerar QR Code visual no terminal
      console.log('\n📱 QR Code para escanear:');
      console.log('='.repeat(50));
      
      // Tentar gerar QR Code visual (se possível)
      try {
        const terminalQR = await QRCode.toString(qrCode.base64Image, { type: 'terminal' });
        console.log(terminalQR);
      } catch (error) {
        console.log('❌ Não foi possível mostrar QR Code no terminal');
        console.log('📱 Use o arquivo qr-code-test.txt para visualizar');
      }
      
    } else {
      console.log('❌ QR Code não encontrado');
      console.log('QR Code object:', qrCode);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testQRCode();
