const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

const PIXEL_ID = '1183255336100829';
const ACCESS_TOKEN = 'EAADFdaJM3XoBO2xbWKeyHri222SZBBZBHckQuZBDhyM2r89bqUTP75AV632aP56E1XqGWTm0UZAlFGPkQ8n3W3tmHiqFdjC2mmpSBU2LzuepZC9PS5gsj9ZADMQdUBeinXGk6a38mlc8tlPhthPfSCE9ZAXeKRcr5ywNIjH3MLEQowdhQt3fHhwNH64qUscj59mgAZDZD';

app.use(bodyParser.json());
app.use(cors());

// Middleware para lidar com OPTIONS para CORS
app.options('/register-purchase', (req, res) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.sendStatus(200);
});

// Endpoint principal
app.post('/register-purchase', async (req, res) => {
    try {
        const userId = req.body.userId || uuidv4(); // Gera automaticamente se não vier no request
        const purchaseAmount = req.body.purchaseAmount;
        const phoneNumber = req.body.phoneNumber || ''; // Opcional
        const fbc = req.body.fbc || ''; // Opcional, mas esperado pelo Facebook

        // Verifique o formato do fbc
        if (fbc && !/^fb\.\d+\.\d+\..+$/.test(fbc)) {
            console.warn('Formato inválido de fbc:', fbc);
        }

        // Hash do número de telefone (se existir)
        const hashedPhone = phoneNumber
            ? crypto.createHash('sha256').update(phoneNumber).digest('hex')
            : '';

        // Gera um event_id único para desduplicação
        const eventId = uuidv4();

        // Dados para envio à API do Facebook
        const facebookData = {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: eventId, // Adiciona o event_id
                    user_data: {
                        client_user_agent: req.headers['user-agent'] || '',
                        fbc: fbc || null, // Inclua o fbc apenas se existir
                        ph: hashedPhone || null, // Inclua o ph apenas se existir
                    },
                    custom_data: {
                        currency: 'BRL',
                        value: purchaseAmount,
                    },
                    event_source_url: 'https://juliamariana.com/validarcompranovo', // Atualizado sem ponto-e-vírgula
                    action_source: 'website',
                },
            ],
        };

        console.log('Dados enviados ao Facebook:', JSON.stringify(facebookData, null, 2));

        // Envio para a API do Facebook
        const response = await axios.post(
            `https://graph.facebook.com/v12.0/${PIXEL_ID}/events`,
            facebookData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            }
        );

        console.log('Resposta do Facebook:', response.data);
        res.status(200).json({ message: 'Compra registrada com sucesso!' });
    } catch (error) {
        console.error(
            'Erro ao processar a compra:',
            error.response ? error.response.data : error.message
        );
        res.status(500).json({ message: 'Erro ao registrar compra' });
    }
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
