require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { HfInference } = require('@huggingface/inference');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGODB_URI = process.env.MONGODB_URI;
const hf = new HfInference(process.env.HUGGING_FACE_KEY);

const Chat = mongoose.model('Chat', new mongoose.Schema({
    prompt: String, 
    response: String, 
    date: { type: Date, default: Date.now }
}));

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

mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(3000, () => {
            console.log("\n==========================================");
            console.log("✅ SISTEM CALISIYOR!");
            console.log("🔗 LİNK: http://localhost:3000");
            console.log("==========================================\n");
        });
    })
    .catch(err => console.error("MongoDB Hatası:", err));