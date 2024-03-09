const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const { leagueEmojis } = require("../shared");

const cwlOrder = {
  Unranked: 0,
  "Bronze League III": 1,
  "Bronze League II": 2,
  "Bronze League I": 3,
  "Silver League III": 4,
  "Silver League II": 5,
  "Silver League I": 6,
  "Gold League III": 7,
  "Gold League II": 8,
  "Gold League I": 9,
  "Crystal League III": 10,
  "Crystal League II": 11,
  "Crystal League I": 12,
  "Master League III": 13,
  "Master League II": 14,
  "Master League I": 15,
  "Champion League III": 16,
  "Champion League II": 17,
  "Champion League I": 18,
};

module.exports = {
  name: "cwl-performance",
  description: "Check CWL performance of season",
  async execute(interaction, client) {
    const season = interaction.options.getString("season");
    const cwldatafile = `./clanwarleague/cwl-${season}.json`;

    fs.readFile(cwldatafile, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
      }

      try {
        const cwlData = JSON.parse(data);

        // Sort clans in descending order of cwlOrder
        cwlData.sort((a, b) => cwlOrder[b.start] - cwlOrder[a.start]);

        // Create a Discord Embed
        const embed = new EmbedBuilder()
          .setTitle(`**CWL Summary for ${season} Season**`)
          .setColor("#92600d")
          .setFooter({
            text: "#PsychoFamily",
            iconURL: "https://i.imgur.com/FSyJai0.png",
          });

        const promotedClans = [];
        const maintainedClans = [];
        const skippedClans = [];
        const demotedClans = [];

        cwlData.forEach((clan) => {
          if (clan.played === "no") {
            // Skipped
            const emoji = leagueEmojis[clan.start] || "";

            skippedClans.push(`${emoji}  ${clan.name}`);
          } else {
            const startOrder = cwlOrder[clan.start];
            const endOrder = cwlOrder[clan.end.league];
            const emoji = leagueEmojis[clan.end.league] || "";

            if (startOrder < endOrder) {
              // Promoted
              promotedClans.push(`${emoji}  ${clan.name}`);
            } else if (startOrder === endOrder) {
              // Maintained
              maintainedClans.push(
                `${emoji}  ${clan.name} - #${clan.end.rank}`
              );
            } else {
              // Demoted
              demotedClans.push(`${emoji}  ${clan.name} - #${clan.end.rank} `);
            }
          }
        });

        // Add fields for each category
        if (promotedClans.length > 0) {
          embed.addFields({
            name: "**__Promoted__**",
            value: promotedClans.join("\n"),
          });
        }

        if (maintainedClans.length > 0) {
          embed.addFields({
            name: "**__Maintained__**",
            value: maintainedClans.join("\n"),
          });
        }

        if (demotedClans.length > 0) {
          embed.addFields({
            name: "**__Demoted__**",
            value: demotedClans.join("\n"),
          });
        }

        if (skippedClans.length > 0) {
          embed.addFields({
            name: "**__Not Played__**",
            value: skippedClans.join("\n"),
          });
        }

        // Send the Discord Embed or do other actions
        interaction.reply({ embeds: [embed] });
      } catch (parseError) {
        console.error(`Error parsing JSON: ${parseError.message}`);
      }
    });
  },
};
