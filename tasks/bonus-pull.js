const { fetchCWLData } = require("../utilities.js");
const { CLAN_INFO } = require("../shared.js");
const { EmbedBuilder } = require("discord.js");

async function bonuspull(client) {
  console.log("Executing /bonus-pull command...");

  try {
    const embed = new EmbedBuilder()
      .setTitle("__CWL Data Fetch Status__")
      .setColor("#825408")
      .setThumbnail("https://i.imgur.com/IhRNXEQ.png")
      .setTimestamp()
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });
    const clanStatus = {};

    for (const clan of CLAN_INFO) {
      console.log(`Processing clan: ${clan.name}`);
      try {
        const { clanName, status } = await fetchCWLData(
          clan.tag,
          client,
          clan.name
        );

        if (!clanStatus[status]) {
          clanStatus[status] = [clanName];
        } else {
          clanStatus[status].push(clanName);
        }
      } catch (error) {
        console.error(error);
      }
    }

    console.log("Finished fetching CWL data");

    // Create fields for embed based on clan status
    for (const [status, clans] of Object.entries(clanStatus)) {
      embed.addFields({
        name: status,
        value: clans.join("\n") || "No clans found",
      });
    }

    const channelId = "1089967329498112131"; // Replace with your actual channel ID
    const channel = await client.channels.fetch(channelId);
    channel.send({ embeds: [embed] }); // Send the embed
  } catch (error) {
    console.error("Error executing fetchCWLData", error);
  }
  console.log("Finished executing /bonus-pull command.");
}

module.exports = bonuspull;
