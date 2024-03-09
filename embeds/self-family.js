const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  AttachmentBuilder,
} = require("discord.js");

module.exports = {
  name: "self-family",
  description: "Embed",
  execute: function (interaction, client, embedchannel) {
    //// Create the embed for Family roles
    const sfembed = new EmbedBuilder()
      .setColor("#6a0505")
      .addFields(
        {
          name: "<:BurntBase:899892392193306654>  ‎‎**__Base Burner__**",
          value:
            "<a:ZA_right_arrow:1133424908915982487> Have you subscribed to burnt base? React to this role if you are willing to scan bases fo‎‎r members within the family.\nㅤ",
        },
        {
          name: "<:ClanCastle:899892814526152705>  **__Donator__**",
          value:
            "<a:ZA_right_arrow:1133424908915982487> Are you a team player? React to this role if you are willing to move within the family to help a member in need!\nㅤ",
        },
        {
          name: "<:Vs:901335683594080276>  **__Event Hub__**",
          value:
            "<a:ZA_right_arrow:1133424908915982487> Are you interested in competing in events hosted by PFG? React to this role if you wish to participate in our family events! Do you have what it takes?\nㅤ",
        },
        {
          name: "<:Reddit:1011474644739563660>  **__Reddit __**",
          value:
            "<a:ZA_right_arrow:1133424908915982487> React to this role if you have a reddit account and are willing to upvote and comment on our recruit messages.\nㅤ",
        },
        {
          name: "<:ProGamer:899892375684526170>  **__Mini Games __**",
          value:
            "<a:ZA_right_arrow:1133424908915982487> Is Clash not enough? Have gaming skills outside of Clash? React to this role if you are willing to play games on the server.\nㅤ",
        },
        {
          name: "<:Swords:899892679863861288>  **__Friendly War__**",
          value:
            "<a:ZA_right_arrow:1133424908915982487> Are you someone who wants to participate in Friendly Wars prior to CWL? Or, random Friendly Wars that may pop up? React to this role if you want to dominate your friends in a friendly competition!\n",
        }
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });
    ////Attach Family header image
    const familyheader = new AttachmentBuilder(
      "./assets/header/family-roles.png"
    );

    //// Array of role options for the select menu
    const sfRolesOptions = [
      { label: "Base Burner", value: "burner", emoji: "899892392193306654" },
      { label: "Donator", value: "donor", emoji: "899892814526152705" },
      { label: "Event Hub", value: "event", emoji: "901335683594080276" },
      { label: "Reddit", value: "reddit", emoji: "1011474644739563660" },
      { label: "Mini Games", value: "minigame", emoji: "899892375684526170" },
      { label: "Friendly War", value: "fw", emoji: "899892679863861288" },
      { label: "Clear", value: "del", emoji: "1082598936889528341" },
    ];

    ////Create a select menu for CWL Roles
    const sfRolesMenu = new StringSelectMenuBuilder()
      .setCustomId("family_roles")
      .setPlaceholder("𒀖  Select Family Roles")
      .setMinValues(1)
      .setMaxValues(6)
      .addOptions(sfRolesOptions);

    ////Create an action row for CWL Roles
    const sfrolesRow = new ActionRowBuilder().addComponents(sfRolesMenu);

    ////Send the CWL Clan Roles embed along with the select menu
    embedchannel.send({
      embeds: [sfembed],
      components: [sfrolesRow],
      files: [familyheader],
    });
  },
};
