const { create } = require('venom-bot');
const QRCode = require('qrcode');

async function testQRCodeTerminal() {
  console.log('🚀 Teste QR Code no Terminal...');
  
  try {
    // Criar sessão VenomBot
    console.log('📱 Criando sessão...');
    const session = await create('terminal-test');
    
    console.log('✅ Sessão criada!');
    console.log('⏳ Aguardando QR Code...');
    
    // Aguardar 15 segundos
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Tentar obter QR Code
    console.log('🔍 Buscando QR Code...');
    const qrCode = await session.getQrCode();
    
    console.log('📋 QR Code encontrado:', !!qrCode);
    
    if (qrCode && qrCode.base64Image) {
      console.log('🎉 QR Code real obtido!');
      console.log('📏 Tamanho:', qrCode.base64Image.length, 'caracteres');
      
      // Gerar QR Code visual no terminal
      console.log('\n📱 QR Code para escanear:');
      console.log('='.repeat(50));
      
      try {
        const terminalQR = await QRCode.toString(qrCode.base64Image, { 
          type: 'terminal',
          width: 40
        });
        console.log(terminalQR);
      } catch (error) {
        console.log('❌ Erro ao mostrar QR Code no terminal:', error.message);
      }
      
      // Salvar em arquivo HTML para visualizar
      const fs = require('fs');
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>QR Code WhatsApp</title>
    <style>
        body { 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0; 
            background: #f0f0f0; 
        }
        .qr-container { 
            text-align: center; 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
        }
        img { 
            max-width: 300px; 
            border: 2px solid #ddd; 
        }
        h1 { 
            color: #333; 
            margin-bottom: 20px; 
        }
    </style>
</head>
<body>
    <div class="qr-container">
        <h1>📱 QR Code WhatsApp</h1>
        <p>Escaneie com seu WhatsApp</p>
        <img src="data:image/png;base64,${qrCode.base64Image}" alt="QR Code">
    </div>
</body>
</html>`;
      
      fs.writeFileSync('qr-code.html', htmlContent);
      console.log('💾 QR Code salvo em qr-code.html');
      console.log('🌐 Abra o arquivo qr-code.html no navegador para visualizar');
      
    } else {
      console.log('❌ QR Code não encontrado');
      console.log('QR Code object:', qrCode);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testQRCodeTerminal();
