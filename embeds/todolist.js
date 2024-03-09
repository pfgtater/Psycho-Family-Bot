const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "get-cwl-attacks",
  description: "Embed",
  execute: function (interaction, client, embedchannel) {
    // Create an embed with the specified title and description
    const toDoListEmbed = new EmbedBuilder()
      .setColor("#92600d")
      .setTitle("Psycho To Do List")
      .setDescription("Press the button below to determine if you have any CWL & War attacks remaining!")
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Create a button with the label "To Do"
    const toDoListButton = new ButtonBuilder()
      .setCustomId("getToDoList")
      .setLabel("To Do List")
      .setStyle(ButtonStyle.Success);

    // Add the button to an action row
    const actionRow = new ActionRowBuilder().addComponents(toDoListButton);
    
    // Send the embed and button in the channel
    embedchannel.send({
      embeds: [toDoListEmbed],
      components: [actionRow],
    });
  }
}
