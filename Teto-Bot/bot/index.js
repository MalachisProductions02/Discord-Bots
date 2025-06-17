// /bot/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config.json');



const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ],
    partials: [Partials.GuildMembers]
});

client.once('ready', async () => {
    console.log(`🥖 Teto.exe iniciado como ${client.user.tag}.`);

    const guild = client.guilds.cache.first();
    if (!guild) return console.error(`❌ Teto no está en ningún servidor.`);

    // Imprimir roles disponibles
    console.log("\n📝 Roles disponibles:");
    guild.roles.cache.forEach(role => {
        console.log(`- ${role.name} (${role.id})`);
    });

    // Imprimir canales disponibles
    console.log("\n📝 Canales disponibles:");
    guild.channels.cache.forEach(channel => {
        console.log(`- ${channel.name} (${channel.id})`);
    });

    // Ejecutar revisión inicial y luego periódica
    await checkMembers(guild);
    setInterval(() => checkMembers(guild), config.checkIntervalMinutes * 60 * 1000);
});

async function checkMembers(guild) {
    await guild.members.fetch(); // Asegura que todos los miembros estén en caché

    const role = guild.roles.cache.get(config.roleid); // ojo: roleId en mayúscula
    const channel = guild.channels.cache.get(config.channelId);

    if (!role) {
        return console.error(`❌ Teto no encuentra el rol ${config.roleid}`);
    }

    if (!channel) {
        return console.error(`❌ Teto no encuentra el canal ${config.channelId}`);
    }

    const now = Date.now();
    const fourDays = 4 * 24 * 60 * 60 * 1000;
    let count = 0;

    guild.members.cache.forEach(member => {
        if (member.user.bot) return;

        const joinedAt = member.joinedAt?.getTime();
        if (!joinedAt) return;

        const timeInGuild = now - joinedAt;

        if (timeInGuild >= fourDays && !member.roles.cache.has(role.id)) {
            member.roles.add(role)
                .then(() => {
                    channel.send(`✅ Se asignó el rol ${role.name} a ${member.user.tag}. por lealtad`);
                    count++;
                })
                .catch(err => console.error(`❌ Error al asignar rol a ${member.user.tag}:`, err));
        }
    });

    console.log(`🥖 Teto ha terminado la revisión, se asignaron ${count} roles.`);
}

client.login(process.env.DISCORD_TOKEN);
