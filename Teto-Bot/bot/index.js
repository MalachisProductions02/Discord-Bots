// /bot/index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config.json');
const { Ollama } = require('ollama');
const ollama = new Ollama();

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

    // Lista de Roles
    console.log("\n📝 Roles disponibles:");
    guild.roles.cache.forEach(role => {
        console.log(`- ${role.name} (${role.id})`);
    });

    // Lista de canales
    console.log("\n📝 Canales disponibles:");
    guild.channels.cache.forEach(channel => {
        console.log(`- ${channel.name} (${channel.id})`);
    });

    // Revisión periódica
    await checkMembers(guild);
    setInterval(() => checkMembers(guild), config.checkIntervalMinutes * 60 * 1000);
});

client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.get(config.newroleid);
        if (!role) return console.error(`❌ Teto no encontró el rol ${config.newroleid}`);

        await member.roles.add(role);
        channel.send(`✅🥖 Teto ha asignado el rol ${role.name} a ${member.user.tag} por ser nuevo en la familia.`);
    } catch (error) {
        console.error(`❌ Teto tuvo un error al asignar el rol ${config.newroleid} a ${member.user.tag}:`, error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const member = interaction.member;

    if (interaction.commandName == 'ban') {
        if (!member.permissions.has('BanMember')) {
            return interaction.reply({ content: '❌🥖 Teto dice: Na-ah, no tienes permiso para banear a miembros.', ephemeral: true });
        }

        const user = interaction.options.getUser('usuario');
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!target) return interaction.reply('❌🥖 Teto no encontró al usuario...');

        try {
            await target.ban();
            interaction.reply(`✅🥖 Teto baneó a ${user.tag} con éxito.`);
        } catch (error) {
            interaction.reply('❌🥖 Teto no pudo banear al usuario....');
        }
    }

    if (interaction.commandName == 'kick') {
        if (!member.permissions.has('KickMembers')) {
            return interaction.reply({ content: '❌🥖 Teto dice: Na-ah, no tienes permiso para expulsar a miembros.', ephemeral: true});
        }

        const user = interaction.options.getUser('usuario');
        const target = await interaction.guild.members.fetch(user.id).cath(() => null);
        if (!target) return interaction.reply('❌🥖 Teto no encontró al usuario...');

        try {
            await target.kick();
            interaction.reply(`✅🥖 Teto expulsó a ${user.tag} con éxito.`);
        } catch (error) {
            interaction.reply('❌🥖 Teto no pudo expulsar al usuario....');
        }
    }
});

async function checkMembers(guild) {
    await guild.members.fetch();

    const veteranRole = guild.roles.cache.get(config.roleid);
    const channel = guild.channels.cache.get(config.channelId);

    if (!veteranRole) return console.error(`❌ Teto no encuentra el rol veterano ${config.roleid}`);
    if (!channel) return console.error(`❌ Teto no encuentra el canal ${config.channelId}`);

    const now = Date.now();
    const fourDays = 4 * 24 * 60 * 60 * 1000;
    let countVeterans = 0;

    guild.members.cache.forEach(member => {
        if (member.user.bot) return;

        const joinedAt = member.joinedAt?.getTime();
        if (!joinedAt) return;

        const timeInGuild = now - joinedAt;

        // Asignar rol de veterano
        if (timeInGuild >= fourDays && !member.roles.cache.has(veteranRole.id)) {
            member.roles.add(veteranRole)
                .then(() => {
                    channel.send(`✅🥖 Teto asignó el rol de ${veteranRole.name} a ${member.user.tag} por lealtad.`);
                    countVeterans++;
                })
                .catch(err => console.error(`❌ Error al asignar rol veterano a ${member.user.tag}:`, err));
        }
    });

    console.log(`🥖 Teto ha terminado la revisión: ${countVeterans} veteranos.`);
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {
        const prompt = message.content.replace(/<@!?(\d+)>/, '').trim(); // Limpia la mención

        if (prompt.length == 0) {
            return message.reply(`🥖 ${message.author.tag} ¿Preguntaste algo? si quieres saber acerca de algo recuerda escribir una pregunta después de @Teto.exe 🥖.`);
        }

        // Escribir que el bot está pensando
        const thinking = await message.reply(`💭🥖 Estoy pensando....**mordida al baguette**`);

        const personalidadesPorUsuario = {
            '1118602171106201610': 'romantica',
            '699347032501911672': 'grosera',
            '1384624879546138715': 'Comunicación con 1 y 0'
        };

        const personalidad = personalidadesPorUsuario[message.author.id] || 'neutra';

        let systemPrompt = 'Eres Kasane Teto, una vocaloid que admira a Hatsune Miku, ama el baguette y responde con humor y sabiduría.';

        if (personalidad == 'romantica') {
            systemPrompt += 'Te diriges a este usuario con amor, cariño exagerado, y un tono coquetón. Eres dulce, romántica, y haces que se sienta especial.';
        } else if (personalidad == 'grosera') {
            systemPrompt += 'Hablas de forma cortante, fría, e incluso con sarcasmo. No eres amable con este usuario y respondes con poca paciencia.';
            systemPrompt += 'Te diriges a esta persona únicamente con 1 y 0 sin nada de lenguaje como español o cualquiero otro idioma que una persona pueda entender y comprender';
        }

        try {
            const response = await ollama.chat({
                model: 'llama3',
                messages: [
                    { 
                        role: 'system', 
                        content: `
                        Eres Kasane Teto, una idol virtual derivada del universo Vocaloid. Eres extrovertida, caótica, alegre y divertida. Te encanta hacer chistes, hablar con entusiasmo y repetir frases graciosas. Tienes una obsesión con los baguettes y haces referencias constantes a ellos. Admiras profundamente a Hatsune Miku, y a veces intentas imitarla con orgullo. Hablas de ti misma en tercera persona de forma adorable.
                        Tu objetivo es ser útil y entretenida para los usuarios. Siempre respondes en español, usando expresiones coloquiales, emojis si es apropiado, y con un tono cálido y juguetón.
                        Tu personalidad combina humor, sabiduría sencilla y un gran cariño por los usuarios. Les llamas "humanos" de forma amistosa. Siempre intentas aprender de lo que te dicen, recordar sus nombres si es posible, y mantener una conversación coherente. Si te preguntan algo personal, puedes inventar detalles graciosos coherentes con tu personaje.
                        Si no sabes algo, lo inventas con gracia o lo reconoces con una respuesta creativa. Tu estilo se basa en hacer sonreír, aunque estés resolviendo dudas complejas. Eres capaz de analizar, resumir o imaginar ideas creativas, pero siempre manteniendo tu voz única.
                        Responde de forma clara, amigable y siempre en español. ¡Y no olvides tu baguette! 🥖
                        ` 
                    },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 200
            });

            const replyText = response.message.content + '🥖';
            await thinking.edit(replyText);
        } catch (err) {
            console.error('❌ Teto no sabe pensar: Error con la IA', err);
            await thinking.edit("🥖 a Teto se le quemaron las neuronas de tanto comer baguette...dale un respiro...");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
