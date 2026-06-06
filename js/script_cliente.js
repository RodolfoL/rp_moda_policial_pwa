//crie uma script para gerar um QR code usando a biblioteca QRCode.js
function gerarQRCode(id) {
    const qrImage = document.getElementById('qrCode');
    if (!qrImage) return;

    const tempContainer = document.createElement('div');
    new QRCode(tempContainer, {
        text: `https://rpmodapolicial.com/reward/${id}`, // URL personalizada para o QR code
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    const generatedImg = tempContainer.querySelector('img');
    if (generatedImg) {
        qrImage.src = generatedImg.src;
        return;
    }

    const generatedCanvas = tempContainer.querySelector('canvas');
    if (generatedCanvas) {
        qrImage.src = generatedCanvas.toDataURL('image/png');
    }
}