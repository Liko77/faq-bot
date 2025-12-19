const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios'); // AI istekleri için gerekli

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MONGODB BAĞLANTISI
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB'ye başarıyla bağlanıldı!"))
  .catch((err) => {
    console.error("❌ MongoDB Bağlantı Hatası:", err.message);
  });

// CHAT MODELİ
const chatSchema = new mongoose.Schema({
  userMessage: String,
  botResponse: String,
  date: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// ANA SAYFA (404 HATASINI ÖNLER)
app.get('/', (req, res) => {
  res.send('<h1>Yapay Zeka Botu Sunucusu Aktif!</h1>');
});

// YAPAY ZEKA VE MESAJLAŞMA KISMI (Burayı geri getirdik)
app.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;

    // Hugging Face AI İsteği
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", // Veya kullandığın model
      { inputs: message },
      { headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_KEY}` } }
    );

    const botReply = response.data[0]?.generated_text || "Bir hata oluştu.";

    // MongoDB'ye Kaydet
    const newChat = new Chat({ 
      userMessage: message, 
      botResponse: botReply 
    });
    await newChat.save();

    res.json({ response: botReply });
  } catch (err) {
    console.error("AI Hatası:", err.message);
    res.status(500).json({ error: "Yapay zeka şu an cevap veremiyor." });
  }
});

// SUNUCUYU BAŞLAT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sunucu ${PORT} portunda yayında!`);
   console.log("🔗 LİNK: http://localhost:3000");
});