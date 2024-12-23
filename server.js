const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;

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
app.post('/register-purchase', (req, res) => {
    try {
        const userId = req.body.userId || uuidv4(); // Gera automaticamente se não vier no request
        const purchaseAmount = req.body.purchaseAmount;
        const phoneNumber = req.body.phoneNumber || ''; // Opcional
        const fbc = req.body.fbc || ''; // Opcional, mas esperado pelo Facebook

        // Hash do número de telefone (se existir)
        const hashedPhone = phoneNumber
            ? crypto.createHash('sha256').update(phoneNumber).digest('hex')
            : '';

        // Dados para envio à API do Facebook
        const facebookData = {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    user_data: {
                        client_user_agent: req.headers['user-agent'],
                        fbc: fbc,
                        ph: hashedPhone,
                    },
                    custom_data: {
                        currency: 'BRL',
                        value: purchaseAmount,
                    },
                    event_source_url: 'https://example.com', // Ajuste com o URL correto
                    action_source: 'website',
                },
            ],
        };

        console.log('Facebook Data:', facebookData);

        // Simulação de sucesso (ou você pode integrar diretamente com a API do Facebook aqui)
        res.status(200).json({ message: 'Compra registrada com sucesso!' });
    } catch (error) {
        console.error('Erro ao processar a compra:', error);
        res.status(500).json({ message: 'Erro ao registrar compra' });
    }
});

// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
