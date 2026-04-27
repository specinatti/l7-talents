document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const formMessage = document.getElementById('formMessage');

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (response.ok) {
            formMessage.textContent = '✅ Mensagem enviada com sucesso!';
            formMessage.className = 'success';
            document.getElementById('contactForm').reset();
        } else {
            formMessage.textContent = '❌ Erro ao enviar mensagem: ' + data.error;
            formMessage.className = 'error';
        }
    } catch (error) {
        formMessage.textContent = '❌ Erro de conexão: ' + error.message;
        formMessage.className = 'error';
    }
});
