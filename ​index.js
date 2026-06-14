const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const bannedWords = ['كلمة_ممنوعة1', 'كلمة_ممنوعة2'];
const warnings = new Map();

client.once('ready', () => {
    console.log(`تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const hasBannedWord = bannedWords.some(word => message.content.toLowerCase().includes(word));
    if (hasBannedWord) {
        await message.delete().catch(err => console.log(err));
        const userId = message.author.id;
        let userWarnings = warnings.get(userId) || 0;
        userWarnings++;
        warnings.set(userId, userWarnings);
        message.channel.send(`⚠️ ${message.author}، ممنوع استخدام هذه الكلمات! [تحذير ${userWarnings}]`);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply('❌ لا تملك صلاحية.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ منشن العضو.');
        await member.kick();
        message.channel.send(`✅ تم الطرد.`);
    }

    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply('❌ لا تملك صلاحية.');
        const member = message.mentions.members.first();
        if (!member) return message.reply('❌ منشن العضو.');
        await member.ban();
        message.channel.send(`⛔ تم الحظر.`);
    }
});

client.login(process.env.DISCORD_TOKEN);
