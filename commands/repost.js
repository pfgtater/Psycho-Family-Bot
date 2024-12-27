const { logit } = require("../utilities.js");

module.exports = {
  name: "repost",
  description: "Resend provided message using Bot",
  async execute(interaction, client) {
    const link = interaction.options.getString("link");

    const messageID = link.split("/").pop();
    const channelID = link.split("/")[5];

    try {
      const messagechannel = await client.channels.fetch(channelID);
      const message = await messagechannel.messages.fetch(messageID);
      console.log(message);

      if (message) {
        const messageAttachments = message.attachments;

        // Sending a direct message to the specified user with the message content, embeds, and attachments
        await interaction.channel.send({
          content: message.content || " ",
          embeds: message.embeds,
          files: messageAttachments.map((attachment) => attachment.url),
        });

        await logit(client, {
          content: `Message reposted by <@${interaction.user.id}> in <#${interaction.channel.id}>`,
        });

        await interaction.reply({
          content: "Message reposted",
          ephemeral: true, // Set the response as ephemeral
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
