const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let purchases = new Set(); // Controle de compras já registradas

app.post('/register-purchase', async (req, res) => {
    const { userId, purchaseAmount } = req.body;

    if (!userId || !purchaseAmount) {
        return res.status(400).json({ message: 'Dados inválidos' });
    }

    // Verificar duplicidade
    if (purchases.has(userId)) {
        return res.status(200).json({ message: 'Compra já registrada' });
    }

    // Adicionar ao controle
    purchases.add(userId);

    // Enviar evento para a API de Conversões do Facebook
    try {
        await axios.post(`https://graph.facebook.com/v13.0/1183255336100829/events`, {
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            user_data: {
                em: [hashEmail(userId)], // Hashe o e-mail ou ID
            },
            custom_data: {
                currency: 'BRL',
                value: purchaseAmount,
            },
            access_token: 'EAADFdaJM3XoBO2xbWKeyHri222SZBBZBHckQuZBDhyM2r89bqUTP75AV632aP56E1XqGWTm0UZAlFGPkQ8n3W3tmHiqFdjC2mmpSBU2LzuepZC9PS5gsj9ZADMQdUBeinXGk6a38mlc8tlPhthPfSCE9ZAXeKRcr5ywNIjH3MLEQowdhQt3fHhwNH64qUscj59mgAZDZD',
        });

        res.status(200).json({ message: 'Compra registrada com sucesso!' });
    } catch (error) {
        console.error(error.response?.data || error);
        res.status(500).json({ message: 'Erro ao registrar compra' });
    }
});

// Função para hash (usar SHA256)
const crypto = require('crypto');
function hashEmail(email) {
    return crypto.createHash('sha256').update(email).digest('hex');
}

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
