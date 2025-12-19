require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { HfInference } = require('@huggingface/inference');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PORT AYARI: Render'ın dinamik portunu kullanması için eklendi
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI;
const hf = new HfInference(process.env.HUGGING_FACE_KEY);

const Chat = mongoose.model('Chat', new mongoose.Schema({
    prompt: String, 
    response: String, 
    date: { type: Date, default: Date.now }
}));

// ANA SAYFA YÖNLENDİRMESİ: 404 hatasını engellemek için
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        console.log("Soru Gidiyor:", question);

        const response = await hf.chatCompletion({
            model: "Qwen/Qwen2.5-7B-Instruct",
            messages: [{ role: "user", content: question }],
            max_tokens: 500,
        });

        const aiResponse = response.choices[0].message.content;

        await new Chat({ prompt: question, response: aiResponse }).save();
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error("HATA:", error.message);
        res.status(500).json({ answer: "Sunucu meşgul, lütfen 3 saniye sonra tekrar deneyin." });
    }
});

// BAĞLANTI VE BAŞLATMA
mongoose.connect(MONGODB_URI)
    .then(() => {
        // '0.0.0.0' eklemek Render'ın sitene dışarıdan ulaşmasını sağlar
        app.listen(PORT, '0.0.0.0', () => {
            console.log("\n==========================================");
            console.log("✅ SISTEM CALISIYOR!");
            console.log(`🔗 RENDER LINK: https://faq-bot.onrender.com`);
            console.log(`🏠 LOCAL LINK: http://localhost:${PORT}`);
            console.log("==========================================\n");
        });
    })
    .catch(err => console.error("MongoDB Hatası:", err));