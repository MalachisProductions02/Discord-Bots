// /deploy/commands.js
require('dotenv').config();
const { REST,  Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🛑✨🎤 Miku banea a un usuario por ti.')
    .addUserOption(option => 
        option.setName('víctima')
        .setDescription('banea a este usuario')
        .setRequired(true)),

    new SlashCommandBuilder()
    .setName('kick')
    .setDescription('🛑✨🎤 Miku expulsa a un usuario por ti.')
    .addUserOption(option =>
        option.setName('víctima')
        .setDescription('expulsa a este usuario')
        .setRequired(true))
]
    .map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    (async () => {
        try {
            console.log('✨🎤 Miku está registrando comandos Slash...');
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            );
            console.log('✅✨🎤 Comandos registrados exitosamente.');
        } catch (error) {
            console.error('❌✨🎤 Miku tuvo un error al registrar los comandos', error);
        }
    })();