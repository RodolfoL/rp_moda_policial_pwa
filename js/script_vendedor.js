const qrScannerState = {
  rawValue: '',
  format: '',
  detectedAt: null,
  scanned: false
};

document.addEventListener('DOMContentLoaded', () => {
  const btnVenda = document.getElementById('btn-venda');
  if (!btnVenda) return;

  btnVenda.addEventListener('click', () => {
    openQrCodeReader().catch((error) => {
      console.error('Falha ao abrir leitor de QR Code:', error);
      alert('Não foi possível abrir o leitor de QR Code. Verifique as permissões de câmera e tente novamente.');
    });
  });
});

async function openQrCodeReader() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  const overlay = createScannerOverlay();
  document.body.appendChild(overlay);

  const video = overlay.querySelector('video');
  const statusLabel = overlay.querySelector('.qr-status');
  const stopButton = overlay.querySelector('.qr-stop');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  video.srcObject = stream;
  await video.play();

  let scanning = true;
  let detector = null;
  const useBarcodeDetector = await supportsBarcodeDetector();

  if (useBarcodeDetector) {
    detector = new BarcodeDetector({ formats: ['qr_code'] });
  } else {
    await loadJsQR();
  }

  stopButton.addEventListener('click', () => {
    scanning = false;
    cleanup();
  });

  scanFrame();

  async function scanFrame() {
    if (!scanning) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let result = null;

      if (detector) {
        try {
          const codes = await detector.detect(canvas);
          if (codes && codes.length) {
            result = codes[0];
          }
        } catch (error) {
          console.warn('BarcodeDetector falhou:', error);
        }
      } else if (window.jsQR) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(imageData.data, imageData.width, imageData.height);
        if (qr) {
          result = { rawValue: qr.data, format: 'qr_code' };
        }
      }

      if (result && result.rawValue) {
        qrScannerState.rawValue = result.rawValue;
        qrScannerState.format = result.format || 'qr_code';
        qrScannerState.detectedAt = new Date().toISOString();
        qrScannerState.scanned = true;

        statusLabel.textContent = 'QR code encontrado: ' + qrScannerState.rawValue;
        //Exibe os dados lidos no qrcode
        alert('Dados lidos: ' + qrScannerState.rawValue);
        scanning = false;

        setTimeout(cleanup, 1200);
        return;
      }

      statusLabel.textContent = 'Aguardando QR code...';
    }

    requestAnimationFrame(scanFrame);
  }

  function cleanup() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }
}

function createScannerOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'qr-scanner-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0, 0, 0, 0.85)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '1rem';

  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.maxWidth = '100%';
  wrapper.style.width = '420px';
  wrapper.style.borderRadius = '14px';
  wrapper.style.overflow = 'hidden';
  wrapper.style.background = '#111';
  wrapper.style.boxShadow = '0 0 30px rgba(0,0,0,0.5)';

  const video = document.createElement('video');
  video.style.width = '100%';
  video.style.height = 'auto';
  video.style.display = 'block';
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');

  const bottomBar = document.createElement('div');
  bottomBar.style.display = 'flex';
  bottomBar.style.flexDirection = 'column';
  bottomBar.style.alignItems = 'center';
  bottomBar.style.padding = '1rem';
  bottomBar.style.background = '#121212';
  bottomBar.style.color = '#f1f1f1';
  bottomBar.style.gap = '0.75rem';

  const statusLabel = document.createElement('div');
  statusLabel.className = 'qr-status';
  statusLabel.textContent = 'Aguardando QR code...';
  statusLabel.style.textAlign = 'center';

  const stopButton = document.createElement('button');
  stopButton.className = 'qr-stop';
  stopButton.textContent = 'Fechar leitor';
  stopButton.style.padding = '0.75rem 1rem';
  stopButton.style.border = 'none';
  stopButton.style.borderRadius = '8px';
  stopButton.style.background = '#1b6bff';
  stopButton.style.color = '#fff';
  stopButton.style.cursor = 'pointer';

  const helpText = document.createElement('div');
  helpText.textContent = 'Aponte a câmera para o QR code para capturar os dados.';
  helpText.style.fontSize = '0.9rem';
  helpText.style.opacity = '0.85';
  helpText.style.textAlign = 'center';

  bottomBar.appendChild(statusLabel);
  bottomBar.appendChild(helpText);
  bottomBar.appendChild(stopButton);

  wrapper.appendChild(video);
  wrapper.appendChild(bottomBar);
  overlay.appendChild(wrapper);

  return overlay;
}

async function supportsBarcodeDetector() {
  if (!('BarcodeDetector' in window)) return false;
  try {
    const formats = await BarcodeDetector.getSupportedFormats();
    return formats.includes('qr_code');
  } catch {
    return false;
  }
}

function loadJsQR() {
  if (window.jsQR) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar jsQR'));
    document.head.appendChild(script);
  });
}
