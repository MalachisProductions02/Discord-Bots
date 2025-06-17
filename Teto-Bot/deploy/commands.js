const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const  config = require('../bot/config.json');

const commands = [
    new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🥖 Teto banea a un usuario por ti')
    .addUserOption(option =>
        option.setName('usuario').setDescription('🛑 Teto baneará a este usuario').setRequired(true)
    ),

    new SlashCommandBuilder()
    .setName('kick')
    .setDescription('🥖 Teto expulsará a un usuario por ti')
    .addUserOption(option =>
        option.setName('usuario').setDescription('🛑 Teto expulsará a este usuario').setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10'}).setToken(process.env.DISCORD_TOKEN);

(async() => {
    try {
        console.log('🥖 Teto está registrando comandos slash...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, config.guildId),
            { body: commands },
        );
        console.log('🥖 ¡Teto registró los comandos!');
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
})();