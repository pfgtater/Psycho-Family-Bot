const { EmbedBuilder } = require('discord.js');
const dmlogchannelID = '1170605529048031232'; // Replace with your target channel ID

module.exports = async (client, message) => {
    if (message.channel.type === 'DM' && !message.author.bot) {
        console.log(`DM received from ${message.author.tag}`);

        try {
            const targetChannel = await client.channels.fetch(dmlogchannelID);

            const embed = new EmbedBuilder()
                .setColor('#eda022')
                .setAuthor(`Direct Message from ${message.author.tag}`, message.author.displayAvatarURL())
                .setDescription(message.content)
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();

            const files = [];
            if (message.attachments.size > 0) {
                message.attachments.forEach(attachment => {
                    files.push(attachment.url);
                });
            }

            await targetChannel.send({ embeds: [embed], files: files });
            console.log(`Message sent successfully to ${targetChannel.name}.`);
        } catch (error) {
            console.error('Error forwarding DM:', error);
        }
    }
};
