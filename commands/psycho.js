const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "psycho",
  description: "List all commands or info about a specific command",
  execute(interaction) {
    const commandFields = [
      {
        name: "</accept:1191042335514042488>",
        value: "Accepts a new member into the family. (Leadership only)",
      },
      {
        name: "</base-post:1191042335514042496>",
        value: "Post stored bases in specified channel (Admin only)",
      },
      {
        name: "</base-send:1191042335514042497>",
        value: "Send base in DM to selected user (CWL Captain and Leadership)",
      },
      {
        name: "</bonus:1191042335514042490>",
        value:
          "Calculates net stars for CWL bonus and responds with an image. (CWL Captain and Leadership)",
      },
      {
        name: "</bonus-pull:1191042335514042489>",
        value: "Fetches current CWL data immediately. (Admin only)",
      },
      {
        name: "</capital-spots:1191042335514042495>",
        value:
          "Determines the total number of participating members in various clans and outputs as an image. (PFG Family role)",
      },
      {
        name: "</my-rank:1191042335514042492>",
        value: "Display current rankn in Legend league (PFG Family role)",
      },
      {
        name: "</ongoing-comp:1191042335828611092>",
        value:
          "Fetches ongoing competition data from Google Sheets. (Admin only)",
      },
      {
        name: "</repost:1191042335828611093>",
        value: "Resends a message for which the ID is provided. (Admin only)",
      },
      {
        name: "</send-embed:1191042335828611095>",
        value: "Sends stored embeds to a specified channel. (Admin and Tater)",
      },
      // Add more fields as necessary
    ];

    const helpEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Psycho Bot Commands")
      .setDescription(
        "Here are the available commands (click on a command to use it):"
      )
      .addFields(commandFields)
      .setTimestamp()
      .setFooter({
        text: `Psycho Taters Bot Help - ${commandFields.length} Commands`,
      });

    interaction.reply({ embeds: [helpEmbed] });
  },
};
