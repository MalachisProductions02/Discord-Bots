// /bot/database.js
const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ onectado a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error);
    }
}

module.exports = connectToDatabase;