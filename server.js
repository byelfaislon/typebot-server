const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/register-purchase', (req, res) => {
    // Gera o User ID automaticamente caso não venha no request
    const userId = req.body.userId || uuidv4();
    const purchaseAmount = req.body.purchaseAmount;
    const phoneNumber = req.body.phoneNumber;
    const fbc = req.body.fbc; // Identificação de clique (opcional)

    // Converte o número de telefone para hash SHA-256
    const hashedPhone = phoneNumber
        ? crypto.createHash('sha256').update(phoneNumber).digest('hex')
        : null;

    // Monta o objeto do evento
    const eventData = {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: 'https://example.com', // Atualize com a URL real
        user_data: {
            client_ip_address: req.ip,
            client_user_agent: req.headers['user-agent'],
            ph: hashedPhone, // Telefone em hash
            fbc: fbc // Identificação de clique
        },
        custom_data: {
            currency: 'BRL',
            value: purchaseAmount
        },
        event_id: uuidv4() // Desduplicação
    };

    // Configura os detalhes da requisição para a API do Facebook
    const options = {
        method: 'POST',
        url: `https://graph.facebook.com/v15.0/1183255336100829/events?access_token=EAADFdaJM3XoBO2xbWKeyHri222SZBBZBHckQuZBDhyM2r89bqUTP75AV632aP56E1XqGWTm0UZAlFGPkQ8n3W3tmHiqFdjC2mmpSBU2LzuepZC9PS5gsj9ZADMQdUBeinXGk6a38mlc8tlPhthPfSCE9ZAXeKRcr5ywNIjH3MLEQowdhQt3fHhwNH64qUscj59mgAZDZD`,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({ data: [eventData] })
    };

    // Envia o evento para o Facebook
    axios(options)
        .then(response => {
            console.log('Evento enviado com sucesso:', response.data);
            res.status(200).json({ message: 'Compra registrada com sucesso!' });
        })
        .catch(error => {
            console.error('Erro ao enviar para a API do Facebook:', error.response ? error.response.data : error.message);
            res.status(500).json({ message: 'Erro ao registrar compra' });
        });
});

// Inicia o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
