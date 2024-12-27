const { logit } = require("../utilities.js");

module.exports = {
  name: "base-send",
  description: "DM base to user",
  async execute(interaction, client) {
    const link = interaction.options.getString("link");
    const user = interaction.options.getUser("user");
    const messageID = link.split("/").pop();
    const channelID = link.split("/")[5];
    const sender = interaction.user;

    const logChannelId = "1170605529048031232"; // psycho bot log channel
    const logChannel = client.channels.cache.get(logChannelId);

    try {
      const channel = await client.channels.fetch(channelID);
      const message = await channel.messages.fetch(messageID);

      if (message) {
        const messageContent = message.content;
        const messageEmbeds = message.embeds;
        const messageAttachments = message.attachments;

        // Sending a direct message to the specified user with the message content, embeds, and attachments
        await user.send({
          content: `Sent by <@${sender.id}>\n${messageContent}`,
          embeds: messageEmbeds,
          files: messageAttachments.map((attachment) => attachment.url),
        });

        await interaction.reply({
          content: `Message sent to <@${user.id}>!`,
          ephemeral: true, // Set the response as ephemeral
        });

        await logit(client, {
          content: `DM sent to <@${user.id}> by <@${sender.id}>`,
        });
      } else {
        await interaction.reply({
          content: "Message not found.",
          ephemeral: true, // Set the response as ephemeral
        });
      }
    } catch (error) {
      console.error("Error fetching message:", error);
      await interaction.reply({
        content: "Error fetching message.",
        ephemeral: true, // Set the response as ephemeral
      });
    }
  },
};
