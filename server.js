const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const PIXEL_ID = "1183255336100829"; // Substitua pelo seu Pixel ID
const ACCESS_TOKEN = "EAADFdaJM3XoBO2xbWKeyHri222SZBBZBHckQuZBDhyM2r89bqUTP75AV632aP56E1XqGWTm0UZAlFGPkQ8n3W3tmHiqFdjC2mmpSBU2LzuepZC9PS5gsj9ZAXeKRcr5ywNIjH3MLEQowdhQt3fHhwNH64qUscj59mgAZDZD"; // Substitua pelo seu Token de Acesso

app.post("/register-purchase", async (req, res) => {
  try {
    // Informações da requisição recebida
    const { purchaseAmount, phoneNumber } = req.body;

    // Gerar um ID único para o evento
    const eventId = uuidv4();

    // Capturar informações do cliente
    const clientIpAddress = req.ip; // IP do cliente
    const clientUserAgent = req.get("User-Agent"); // User Agent do cliente
    const fbc = req.headers["fbc"] || "fb.1.1672537600.abc123"; // Substitua por um valor real, se disponível

    // Montar o payload para a API do Facebook
    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000), // Timestamp atual em segundos
          user_data: {
            client_ip_address: clientIpAddress,
            client_user_agent: clientUserAgent,
            fbc: fbc,
            phone: phoneNumber, // Adicionando o número de telefone
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
