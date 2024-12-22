const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto'); // Para converter dados sensíveis em hash

const app = express();
app.use(bodyParser.json());

// Configurações
const PIXEL_ID = '1183255336100829'; // Substitua pelo seu ID do Pixel
const PIXEL_TOKEN = 'EAADFdaJM3XoBO2xbWKeyHri222SZBBZBHckQuZBDhyM2r89bqUTP75AV632aP56E1XqGWTm0UZAlFGPkQ8n3W3tmHiqFdjC2mmpSBU2LzuepZC9PS5gsj9ZADMQdUBeinXGk6a38mlc8tlPhthPfSCE9ZAXeKRcr5ywNIjH3MLEQowdhQt3fHhwNH64qUscj59mgAZDZD'; // Substitua pelo token

// Função para converter dados em hash SHA256
function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

app.post('/register-purchase', async (req, res) => {
    const { userId, purchaseAmount, phoneNumber } = req.body;

    // Capturar IP e User Agent
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validar dados recebidos
    if (!userId || !purchaseAmount) {
        return res.status(400).json({ message: 'userId e purchaseAmount são obrigatórios!' });
    }

    try {
        // Dados do evento a serem enviados ao Pixel
        const eventData = {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: Math.floor(new Date().getTime() / 1000),
                    action_source: 'website',
                    user_data: {
                        external_id: hashData(userId), // Hash do userId
                        phone: phoneNumber ? hashData(phoneNumber) : null, // Hash do número de telefone
                        client_ip_address: clientIp,
                        client_user_agent: userAgent,
                        fbc: req.query.fbc || null, // Capturar fbc dos parâmetros da URL, se disponível
                    },
                    custom_data: {
                        value: purchaseAmount,
                        currency: 'BRL',
                    },
                },
            ],
        };

        // Enviar para a API do Pixel
        const response = await axios.post(
            `https://graph.facebook.com/v12.0/${PIXEL_ID}/events?access_token=${PIXEL_TOKEN}`,
            eventData
        );

        // Verificar resposta da API
        if (response.data.error) {
            throw new Error(response.data.error.message);
        }

        res.status(200).json({ message: 'Compra registrada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar para a API do Facebook:', error.response?.data || error.message);
        res.status(500).json({ message: 'Erro ao registrar compra' });
    }
});

// Porta padrão
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
