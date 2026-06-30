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
    formData.append('productImage', fileInput.files[0]);
    formData.append('productName', productName);
    
    
    try {
        /*
        const response = await fetch('https://rp-moda-policial-backend.fly.dev/upload_imagem_produto', {
            method: 'POST',
            body: formData
        });
        */
        
        const response = await fetch('http://localhost:8080/upload_imagem_produto', {
            method: 'POST', 
            headers: {    'Content-Type': 'application/json'
                },
            body: formData
        });
        
        

        if (response.ok) {
            const resultado = await response.json();
            alert('Produto cadastrado com sucesso!');
            document.getElementById('productForm').reset();
        } else {
            alert('Erro ao cadastrar produto' + resultado.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar imagem: ' + error.message);
    }
}
