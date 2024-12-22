const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Função para hash de dados (e-mail, telefone, etc.)
function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Endpoint para registrar compras
app.post('/register-purchase', async (req, res) => {
    const { userId, purchaseAmount, phoneNumber } = req.body;

    if (!userId || !purchaseAmount) {
        return res.status(400).json({ message: 'Dados inválidos: userId e purchaseAmount são obrigatórios.' });
    }

    try {
        // Dados para enviar à API do Facebook
        const data = {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    user_data: {
                        em: [hashData(userId)], // Hashe o e-mail
                        ph: phoneNumber ? [hashData(phoneNumber)] : undefined, // Hashe o telefone, se disponível
                        client_ip_address: req.ip, // Endereço IP do cliente
                        client_user_agent: req.headers['user-agent'], // User Agent do cliente
                    },
                    custom_data: {
                        currency: 'BRL',
                        value: purchaseAmount,
                    },
                    test_event_code: 'TEST54809' // Código de teste do Facebook
                }
            ],
            access_token: process.env.FB_ACCESS_TOKEN,
        };

        // Enviar evento para a API do Facebook
        const response = await axios.post(`https://graph.facebook.com/v13.0/1183255336100829/events`, data);

        console.log("Evento enviado com sucesso ao Facebook:", response.data);
        res.status(200).json({ message: 'Compra registrada com sucesso!' });
    } catch (error) {
        console.error("Erro ao enviar para a API do Facebook:", error.response?.data || error.message);
        res.status(500).json({ message: 'Erro ao registrar compra' });
    }
});

// Iniciar o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
