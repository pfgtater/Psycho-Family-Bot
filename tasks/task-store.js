///// Meant to store some small task function together
const utilities = require("../utilities.js"); // Adjust the path as needed
const { generateRaidscanvas, fetchRaidsData } = require("../utilities.js");
const { REG_CLAN_INFO } = require("../shared.js");
const {
  ButtonBuilder,
  ActionRowBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

async function memberspull(client) {
  try {
    await utilities.fetchClanMembers();

    const channelID = "1089967329498112131";
    const channel = await client.channels.fetch(channelID);

    channel.send("Clan member.json file updated successfully.");
  } catch (error) {
    console.error("Error in rank command:", error);
    channel.send("An error occurred while fetching clan members.");
  }
}

async function raidMessage(client) {
  const channelId = "587507114922999809";
  const channel = client.channels.cache.get(channelId);

  // Create a MessageAttachment with the initial image file
  const filePath = await generateRaidscanvas(await fetchRaidsData());
  const attachment = new AttachmentBuilder(filePath, "canvasImage.png");

  // Create embed
  const embed = new EmbedBuilder()
    .setColor("#92600d")
    .setImage("attachment://canvasImage.png")
    .setFooter({
      text: "#PsychoFamily",
      iconURL: "https://i.imgur.com/FSyJai0.png",
    });

  //// Array of options for the Clan menu
  const clOptions = REG_CLAN_INFO.map((clan) => ({
    label: clan.name,
    value: clan.abb,
    emoji: clan.emoji,
  }));

  ////Create a select menu for CWL Roles
  const clmenu = new StringSelectMenuBuilder()
    .setCustomId("raids_clan_link")
    .setPlaceholder("Find clan link here")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(clOptions);

  const clanRow = new ActionRowBuilder().addComponents(clmenu);

  // Send embed with the attached image
  await channel.send({
    embeds: [embed],
    components: [clanRow],
    files: [attachment],
    content: `Mini accounts are welcome to raid now. Do mention "Raid weekends" or "Manzo" when requesting. Capital Gold must be donated in clan where you raided. You can find information about available slots below.`,
  });
}

module.exports = { memberspull, raidMessage };
