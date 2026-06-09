 function handleCredentialResponse(response) {
    console.log('Google ID token:', response.credential);
    // Aqui você pode enviar o token para o servidor ou processar o login.
    //caso o login seja bem-sucedido, exiba o alert com a mensagem bem-vindo, o nome do usuário e o seu email, que pode ser extraído do token usando uma biblioteca JWT no backend ou frontend.
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    alert(`Bem-vindo, ${payload.name}! Seu email é ${payload.email}.`);
    
    if (payload.name === "Rodolfo Leite") {
    window.location.href = "html/dashboard_gerente.html";
    } else {
    window.location.href = "html/dashboard_cliente.html";
    }
}

function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: "279526279825-funokmsk6feafdkthprajc10at14mt12.apps.googleusercontent.com",
        callback: handleCredentialResponse
});

    google.accounts.id.renderButton(
        document.getElementById('googleSignInContainer'),
        { theme: 'filled_black', size: 'large', width: '100%', text: 'signin_with' }
    );
}