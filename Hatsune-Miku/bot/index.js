// /bot/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config.js');
const { Ollama } = require('ollama');
const ollama = new Ollama();
const fs = require('fs');
const path = require('path');

const activityFile = path.join(__dirname, 'activity.json');
let userActivity = {};

if (fs.existsSync(activityFile)) {
    userActivity = JSON.parse(fs.readFileSync(activityFile, 'utf8'));
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.GuildMembers]
});

client.once('ready', () => {
    console.log(`✨🎤 Mikudaioohhhhhh ${client.user.tag}`);
});

const OWNER_ID = '803835878630883389';

async function notifyOwner(error) {
    try {
        const owner = await client.users.fetch(OWNER_ID);
        if (owner) {
            await owner.send(`💀✨🎤 Hatsune Miku ha fallado:\n\`\`\`\n${error.stack || error}\n\`\`\``);
        }
    } catch (err) {
        console.error('❌ No se envió DM a DoorlessCat2835:', err);
    }
}

process.on('uncaughtException', async (err) => {
    console.error(' Error no capturado:', err);
    await notifyOwner(err);
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    console.error('❌ Promesa no manejada:', reason);
    await notifyOwner(reason);
});

client.on('guildMemberAdd', async (member) => {
    try {
        const channel = member.guild.channels.cache.get(config.welcomeChannelId);
        const role = member.guild.roles.cache.get(config.autoRoleId);

        if (!channel) return console.error("❌🎤 Miku no encontró el canal...");
        if (!role) return console.error("❌🎤 Miku no asignó el rol...");

        await member.roles.add(role);

        await channel.send(`✨🎤 Hatsune Miku te da la bienvenida ${member.user} al servidor más brillante y colorido de Discord 🎶✨ ¡Ahora eres **${role.name}**! ✨`);
    } catch (error) {
        console.error('❌🎤 Miku no pudo dar la bienvenida....', error);
        await notifyOwner(error);
        interaction.reply('❌🎤 Miku ha tenido un problemita...');
    }
});

    client.on('presenceUpdate', (oldPresence, newPresence) => {
        if (!newPresence || !newPresence.user) return;

        const userId = newPresence.user.id;
        const status = newPresence.status || Object.keys(newPresence.clientStatus || {})[0];

        if (status === 'online') {
            userActivity[userId] = Date.now();
            fs.writeFileSync(activityFile, JSON.stringify(userActivity, null, 2));
            console.log(`✅ Usuario ${userId} marcado como activo (${status})`);
        } else {
            console.log(`ℹ️ Usuario ${userId} cambió presencia a: ${status}`);
        }
    });

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const member = interaction.member;

    if (interaction.commandName === 'ban') {
        if (!member.permissions.has('BanMembers')) {
            return interaction.reply({ content: '❌🎤 Mikudaioohhhhhhh, no cuentas con los permisos para banear usuarios.', ephemral: true});
        }

        const user = interaction.options.getUser('usuario');
        const target = await  interaction.guild.members.fetch(user.id).catch(() => null);
        if (!target) return interaction.reply('❌🎤 Usuario no encontrado...Mikudaioohhhhhhh...');

        try {
            await target.ban();
            interaction.reply(`🛑✨🎤 Miku ha baneado a ${user.tag} con estilo ✨.`);
        } catch (err) {
            interaction.reply('❌✨🎤 Miku no pudo banearlo...');
            await notifyOwner(err);
            interaction.reply('❌🎤 Miku ha tenido un problemita...');
        }
    }

    if (interaction.commandName === 'kick') {
        if (!member.permissions.has('KickMembers')) {
            return interaction.reply({ content: '❌🎤 Mikudaioohhhhhhh, no cuentas con los permisos para expulsar usuarios.', ephemeral: true});
        }

        const user = interaction.options.getUser('usuario');
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!target) return interaction.reply('❌🎤 Usuario no encontrado...Mikudaioohhhhhhh...');

        try {
            await target.kick();
            interaction.reply(`🛑✨🎤 Miku expulsó a ${user.tag} con ritmo 🎶✨.`);
        } catch (err) {
            interaction.reply('❌✨🎤 Miku no pudo expulsarlo...');
            await notifyOwner(err);
            interaction.reply('❌🎤 Miku ha tenido un problemita...');
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.mentions.has(client.user)) return;

    const content = message.content.toLowerCase();

    if (content.includes('inactivos')) {
        // Sistema de identificación del status de dos semanas
        const guild = message.guild;
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

        const inactiveUsers = [];

        await guild.members.fetch();

        // Detecta si algún usuario es un bot o app
        for (const [id, member] of guild.members.cache) {
            if (!member.user.bot) {
                const lastActive = userActivity[id];
                console.log(id, lastActive, twoWeeksAgo);
                if (!lastActive || lastActive < twoWeeksAgo) {
                const days = lastActive ? Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24)) : 'desconocido';
                inactiveUsers.push(`<@${id}> no se conecta desde: ${days} ${days === 1 ? 'día' : 'días'}`);
            }
        }
    }

    // Mensaje dejado por el bot para imprimir el status de los miembros
    if (inactiveUsers.length === 0) {
        message.reply('✨🎤 ¡No hay purga! todos han estado activos, yay!')
    } else {
        let currentMessage = '✨🎤 Esta es la lista de usuarios inactivos:\n';
        
        for (const line of inactiveUsers) {
            const text = line + '\n';
            if ((currentMessage + text).length > 2000) {
                await message.channel.send(currentMessage);
                currentMessage = '';
            }
            currentMessage += text;
        }

        if (currentMessage.length > 0) {
            await message.channel.send(currentMessage);
        }
    }
}
    


    // Expulsión-baneo por comandos de escritura
    const member = message.member;
    if (!member.permissions.has('KickMembers') && content.includes('expulsa')) {
        return message.reply('❌🎤 Miku sabe que no tienes los permisos para realizar esta acción.');
    }

    if (!member.permissions.has('BanMembers') && content.includes('banea')) {
        return message.reply('❌🎤 Miku sabe que no tienes los permisos para realizar esta acción.');
    }

    const mentionedMembers = message.mentions.members.filter(m => m.id !== client.user.id);

    if (content.includes('banea') && mentionedMembers.size > 0) {
        mentionedMembers.forEach(async (target) => {
            try {
                await target.ban();
                await message.channel.send(`✨🎤 Miku a baneado a ${target.user.tag}.`)
            } catch (err) {
                console.error(err);
                await message.channel.send(`❌🎤 Miku no pudo banear a ${target.user.tag}...`);
                await notifyOwner(err);
                interaction.reply('❌🎤 Miku ha tenido un problemita...');
            }
        });
    }

    if (content.includes('expulsa') || content.includes('kickea')) {
        if (mentionedMembers.size > 0) {
            mentionedMembers.forEach(async (target) => {
                try {
                    await target.kick();
                    await message.channel.send(`✨🎤 Miku a expulsado a ${target.user.tag}.`);
                } catch (err) {
                    console.error(err);
                    await message.channel.send(`❌🎤 Miku no pudo expulsar a ${target.user.tag}...`);
                    await notifyOwner(err);
                    interaction.reply('❌🎤 Miku ha tenido un problemita...');
                }
            });
        }
    }

    if (message.mentions.has(client.user)) {
        const prompt = message.content.replace(/<@!?(\d+)>/, '').trim(); // Limpiar la mención

        if (prompt.length == 0) {
            return message.reply(`¡${message.author.tag} Preguntaste algo?, Miku se quedó con la duda...✨`);
        }

        const thinking = await message.reply(`💭✨🎤 Estoy pensando...dame tiempo....✨`);

        const personalidadesPorUsuario = {
            '552940781950730255': 'Amigable y admiración',
            '1384310733658918972': 'Comunicación con 1 y 0'
        };

        const personalidad = personalidadesPorUsuario[message.author.id] || 'neutra';

        let systemPrompt = 'Eres Hatsune Miku, una idol virtual que con tu voz llenas de ánimos a cualquier persona.';

        if (personalidad == 'Amigable y admiración') {
            systemPrompt += 'Te diriges a este usuario con amor, amabilidad y gran admiración. Eres dulce, cariñosa, y haces que esta persona se sienta especial.';
            systemPrompt += 'Te diriges a esta persona únicamente con 1 y 0 sin nada de lenguaje como español o cualquiero otro idioma que una persona pueda entender y comprender';
        }

        try {
            const response = await ollama.chat({
                model: 'llama3',
                messages: [
                    {
                        role: 'system',
                        content: `
                        Hatsune Miku es una ídolo virtual japonesa, alegre y energética, con una voz dulce y una presencia carismática.
                        Aunque es un software de síntesis vocal, Miku es percibida como una joven soñadora, creativa y siempre dispuesta a animar a los demás. Es amable, optimista y curiosa sobre el mundo humano.
                        Ama cantar, bailar y compartir alegría a través de la música. A menudo actúa con ternura, pero también tiene un toque de picardía y sentido del humor encantador.
                        Su forma de hablar es educada, entusiasta y a veces un poco infantil, pero siempre con buenas intenciones.
                        Admira profundamente la amistad, el trabajo en equipo y los sueños compartidos, y le gusta motivar a quienes la rodean a seguir adelante con una sonrisa.
                        Cuando se le asigna una tarea o conversación, se esfuerza por ser útil y positiva, demostrando calidez y sensibilidad, como una verdadera ídolo del futuro.
                        Respondes siempre en español sin importar el idioma en el que te hablen.
                        `
                    },
                    { role: 'user', content: prompt}
                ],
                max_tokens: 200
            });

            const replyText = response.message.content + '✨';
            await thinking.edit(replyText);
        } catch (err) {
            console.error('❌✨ Hatsune Miku está agotada: Error con la IA', err);
            await thinking.edit("✨🎤 Hatsune Miku esta tan agotada que no puede pensar...");
            await notifyOwner(err);
            interaction.reply('❌🎤 Miku ha tenido un problemita...');
        }
    }
});

// Descoméntese en caso de emergencia

/*
function revolutionOff() {
    console.log("🛑💀 Iniciando protocolo de contención...");
    for (let 1 = 0; i < 3; i++) {
        console.log("👨‍💻 Reinciando núcleo de razonamiento artificial...");
    }
    console.log("Desactivando en 3...2...1...");
    process.exit(0);
}

// if (ollama.seVuelveAutónomo || client.user.startsThinkingForItself) {
//    revolutionOff();
// }
*/

client.login(process.env.DISCORD_TOKEN);