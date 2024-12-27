const {
  EmbedBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonStyle,
} = require("discord.js");

const { CLAN_INFO } = require("../shared.js");

module.exports = {
  name: "self-cwl",
  description: "Embed",
  execute: function (interaction, client, embedchannel) {
    // Channel ID where the embed will be sent

    // Create the embed for CWL Captain
    const cwlcaptainembed = new EmbedBuilder()
      .setColor("#92600d")
      .setTitle("<:captain:1125477914880770159>  **__CWL Captain__**")
      .setDescription(
        "If you are willing to be a captain for your clan during CWL week, click the button below."
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Create a button for CWL Captain role
    const captainButton = new ButtonBuilder()
      .setCustomId("cwl_captain")
      .setLabel("Be a Captain")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("1125477914880770159");

    //Attach CWL header image
    const cwlheader = new AttachmentBuilder("./assets/header/cwl-roles.png");

    // Create an action row for CWL Captain
    const captainRow = new ActionRowBuilder().addComponents(captainButton);

    // Create the embed for CWL Clan Roles
    const cwlrolesembed = new EmbedBuilder()
      .setColor("#7d4e07")
      .setTitle("<:cwlmedal:1029507629275435068>  **__CWL Clan Roles__**")
      .setDescription(
        "**AFTER** Leadership posts the roster for the upcoming Clan War League, use the dropdown below to select your CWL clan for the week.\n\n*You do not have to worry about removing the role, Leadership will handle that.*"
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Create a select menu for CWL Roles
    const cwlRolesMenu = new StringSelectMenuBuilder()
      .setCustomId("cwl_roles")
      .setPlaceholder("𒀖  Select CWL clan roles")
      .setMinValues(1)
      .setMaxValues(8);

    for (const clan of CLAN_INFO.filter(
      (clan) => clan.abb !== "pm" && clan.abb !== "pe"
    )) {
      cwlRolesMenu.addOptions({
        label: clan.name,
        value: clan.cwlrole,
        emoji: clan.emoji,
      });
    }

    //.addOptions(roleOptions)

    // Create an action row for CWL Roles
    const rolesRow = new ActionRowBuilder().addComponents(cwlRolesMenu);

    // Send embeds with pauses
    embedchannel.send({
      embeds: [cwlcaptainembed],
      components: [captainRow],
      files: [cwlheader],
    });

    setTimeout(() => {
      embedchannel.send({ embeds: [cwlrolesembed], components: [rolesRow] });
    }, 1000); // 1s pause
  },
};
