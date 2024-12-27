const {
  EmbedBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  AttachmentBuilder,
} = require("discord.js");

module.exports = {
  name: "self-player",
  description: "Embed",
  async execute(interaction, client, embedchannel) {
    //// Create the embed for timezone
    const tzembed = new EmbedBuilder()
      .setColor("#0d2f6e")
      .setTitle("**<:time:1133367565633204304> __Select Timezone__**")
      .setDescription(
        "<a:ZA_right_arrow:1133424908915982487> If your timezone is not listed, please select the time zone that is closest to you.\n\n<a:ZA_right_arrow:1133424908915982487> If you have competitor selected, you **MUST** also have a time zone selected*"
      );

    //// Define Player header image
    const playerheader = new AttachmentBuilder(
      "./assets/header/player-roles.png"
    );

    //// Array of role options for the timezone select menu
    const tzRolesOptions = [
      {
        label: "Pacific Standard Time",
        value: "pst",
        emoji: "1011495221164523591",
      },
      {
        label: "Eastern Standard Time",
        value: "est",
        emoji: "1011495183340290098",
      },
      {
        label: "Coordinated Universal Time",
        value: "utc",
        emoji: "1011495289569411184",
      },
      {
        label: "Indian Standard Time",
        value: "ist",
        emoji: "1011495253104140370",
      },
      {
        label: "Australian Eastern Standard Time",
        value: "aest",
        emoji: "1011494865667883090",
      },
    ];

    ////Create a select menu for Timezone Roles
    const tzRolesMenu = new SelectMenuBuilder()
      .setCustomId("tz_roles")
      .setPlaceholder("𒀖  Select your Timezone")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(tzRolesOptions);

    ////Create an action row for Timezone Roles
    const tzRolesRow = new ActionRowBuilder().addComponents(tzRolesMenu);

    ////Send the Timezone Roles embed along with the select menu
    await embedchannel.send({
      embeds: [tzembed],
      components: [tzRolesRow],
      files: [playerheader],
    });

    //// Create the embed for strategies role
    const stratembed = new EmbedBuilder()
      .setColor("#0d2f6e")
      .setTitle("**<:PES:1096899323872165919> __Strategist__**")
      .setDescription(
        "<a:ZA_right_arrow:1133424908915982487> If you are one that likes to help with planning an attack that you know. React to as many strategies that you are comfortable with.\n\n<a:ZA_right_arrow:1133424908915982487> Be mindful that you will get pinged occasionally. If pings do not bother you, then proceed with selecting strats"
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });
    //// Array of role options for the strategies select menu
    const stratRolesOptions = [
      { label: "Queen Charge", value: "qc", emoji: "986516750017392700" },
      {
        label: "Hydra | Super Drags | E Drags",
        value: "hydra",
        emoji: "986516915449114624",
      },
      {
        label: "Hybrid | Mass Hog",
        value: "hybrid",
        emoji: "986517071997333534",
      },
      { label: "Lalo", value: "lalo", emoji: "986517274267643954" },
      {
        label: "Pekka | Super Bowler | Yeti Smash",
        value: "smash",
        emoji: "986517519797989387",
      },
      { label: "Bats", value: "bats", emoji: "986517602908127242" },
      {
        label: "Blizz | Sarch | Super Minion",
        value: "blimp",
        emoji: "986517679223476224",
      },
      { label: "Clear", value: "del", emoji: "1082598936889528341" },
    ];

    ////Create a select menu for Strategies Roles
    const stratRolesMenu = new SelectMenuBuilder()
      .setCustomId("strat")
      .setPlaceholder("𒀖  Select strategies")
      .setMinValues(1)
      .setMaxValues(6)
      .addOptions(stratRolesOptions);

    ////Create an action row for Strategies Roles
    const stratRolesRow = new ActionRowBuilder().addComponents(stratRolesMenu);

    ////Send the Strategies Roles embed along with the select menu
    await embedchannel.send({
      embeds: [stratembed],
      components: [stratRolesRow],
    });
  },
};
