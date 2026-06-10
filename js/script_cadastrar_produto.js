document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();
    enviarImagem();
});

async function enviarImagem() {
    const fileInput = document.getElementById('productImage');
    const productName = document.getElementById('productName').value;
   
    
    if (!fileInput.files.length) {
        alert('Selecione uma imagem');
        return;
    }
    
    const formData = new FormData();
    formData.append('arquivo', fileInput.files[0]);
    formData.append('productName', productName);
    
    try {
        const response = await fetch('https://rp-moda-policial-backend.onrender.com/upload_imagem_produto', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const resultado = await response.json();
            alert('Produto cadastrado com sucesso!');
            document.getElementById('productForm').reset();
        } else {
            alert('Erro ao cadastrar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar imagem: ' + error.message);
    }
}
