const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const PIXEL_ID = "1183255336100829"; // Substitua pelo seu Pixel ID
const ACCESS_TOKEN = "EAADFdaJM3XoBO2xbWKeyHri222SZBBZBHckQuZBDhyM2r89bqUTP75AV632aP56E1XqGWTm0UZAlFGPkQ8n3W3tmHiqFdjC2mmpSBU2LzuepZC9PS5gsj9ZADMQdUBeinXGk6a38mlc8tlPhthPfSCE9ZAXeKRcr5ywNIjH3MLEQowdhQt3fHhwNH64qUscj59mgAZDZD"; // Substitua pelo seu Token de Acesso

app.post("/register-purchase", async (req, res) => {
  try {
    // Informações da requisição recebida
    const { userId, purchaseAmount } = req.body;

    // Gerar um ID único para o evento
    const eventId = uuidv4();

    // Montar o payload para a API do Facebook
    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000), // Timestamp atual em segundos
          user_data: {
            client_ip_address: req.ip, // Captura o IP do cliente
            client_user_agent: req.get("User-Agent"), // Captura o User-Agent do cliente
          },
          custom_data: {
            currency: "BRL",
            value: purchaseAmount,
          },
          event_id: eventId, // ID único para deduplicação
          action_source: "website",
        },
      ],
    };

    // Enviar o evento para a API do Facebook
    const response = await axios.post(
      `https://graph.facebook.com/v16.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      payload
    );

    console.log("Evento enviado com sucesso!", response.data);
    res.status(200).json({ message: "Compra registrada com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar para a API do Facebook:", error.response?.data || error.message);
    res.status(500).json({ message: "Erro ao registrar compra" });
  }
});

// Inicializar o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
