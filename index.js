require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { HfInference } = require('@huggingface/inference');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const hf = new HfInference(process.env.HUGGING_FACE_KEY);

const Chat = mongoose.model('Chat', new mongoose.Schema({
    prompt: String, 
    response: String, 
    date: { type: Date, default: Date.now }
}));

// API Endpoint
app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        const lowerQuestion = question.toLowerCase();

        // ÖZEL CEVAP: Dünyanın en yaxşı atası
        if (lowerQuestion.includes("dünyanın") && lowerQuestion.includes("ən")  && lowerQuestion.includes("yaxşı") && lowerQuestion.includes("atası")) {
            return res.json({ answer: "Elmeddin" });
        }
        if (lowerQuestion.includes("dunyanin") && lowerQuestion.includes("en")  && lowerQuestion.includes("yaxsi") && lowerQuestion.includes("atasi")) {
            return res.json({ answer: "Elmeddin" });
        }
        if (lowerQuestion.includes("dunyanin") && lowerQuestion.includes("en")  && lowerQuestion.includes("yaxsi") && lowerQuestion.includes("muellimi")) {
            return res.json({ answer: "Elmeddin" });
        }
         if (lowerQuestion.includes("dünyanın") && lowerQuestion.includes("ən")  && lowerQuestion.includes("yaxşı") && lowerQuestion.includes("müəllimi")) {
            return res.json({ answer: "Elmeddin" });
        }
        if (lowerQuestion.includes("dunyanin") && lowerQuestion.includes("en")  && lowerQuestion.includes("yaxsi") && lowerQuestion.includes("anasi")) {
            return res.json({ answer: "Aygun" });
        }
          if (lowerQuestion.includes("dünyanın") && lowerQuestion.includes("ən")  && lowerQuestion.includes("yaxşı") && lowerQuestion.includes("anası")) {
            return res.json({ answer: "Aygun" });
        }
        // QWEN AI CEVABI - Azerbaycan dili talimatı eklendi
        const response = await hf.chatCompletion({
            model: "Qwen/Qwen2.5-7B-Instruct",
            messages: [
                { role: "system", content: "Sən Ali Ahmadzada AI köməkçisisən. türkçe net aydın cavaplar ver" },
                { role: "user", content: question }
            ],
            max_tokens: 500,
        });

        const aiResponse = response.choices[0].message.content;

        // MongoDB Kayıt
        await new Chat({ prompt: question, response: aiResponse }).save();
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error("HATA:", error.message);
        res.status(500).json({ answer: "Bağlantı xətası baş verdi, xahiş edirəm bir az sonra yenidən yoxlayın." });
    }
});

// Ana Sayfa Yönlendirmesi
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Bağlantı Başlatma
mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log("\n✅ SISTEM HAZIR!");
            console.log(`🔗 LİNK: https://faq-bot.onrender.com`);
            console.log(`🔗 LİNK: http://localhost:3000/`);
        });
    })
    .catch(err => console.error("MongoDB Hatası:", err));