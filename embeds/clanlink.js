const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { CLAN_INFO } = require("../shared.js");

module.exports = {
  name: "clanlink",
  description: "Send clan link embed",
  execute: function (interaction, client, selectedValue) {
    const clan = CLAN_INFO.find((clan) => clan.abb === selectedValue);

    const embed = new EmbedBuilder()
      .setColor(clan.hex)
      .setTitle(`__${clan.name}__`)
      .setURL(`${clan.link}`)
      .setThumbnail(clan.alogo)
      .addFields({ name: "__Clan tag__", value: `#${clan.tag}`, inline: true })
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Add Link button
    const linkButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Clan Link")
        .setURL(clan.link)
        .setStyle(ButtonStyle.Link)
    );

    interaction.editReply({
      embeds: [embed],
      components: [linkButton],
      ephemeral: true,
    });
  },
};
