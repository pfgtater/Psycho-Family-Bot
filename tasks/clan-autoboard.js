const axios = require("axios");
const {
  CLAN_INFO,
  REG_CLAN_INFO,
  BASE_URL,
  API_KEY,
  headers,
  leagueEmojis,
} = require("../shared");
const { fetchClanLeagues } = require("../utilities");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

// Define Channel and messages
const channelID = "587936466236342272";

// Messaeg ID for embeds of regular clan
const REGmessageIDs = [
  "1185368592133402684",
  "1185368595669192775",
  "1185368597183348839",
  "1185368604175253674",
  "1185368606893158400",
  "1185368608356962386",
];

// Messaeg ID for CWL clan embed
const CWLMessageId = "1185368610277965854";

// Regular Clan Autoboard
async function getClanInfo(clanTag) {
  try {
    const response = await axios.get(`${BASE_URL}/clans/%23${clanTag}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching clan info:", error);
    return null;
  }
}

async function regclan(client) {
  try {
    const channel = await client.channels.fetch(channelID);

    // Loop through message ID in same order as Clan listed in REG_CLAN_INFO
    for (let i = 0; i < REG_CLAN_INFO.length; i++) {
      const clan = REG_CLAN_INFO[i];
      const messageID = REGmessageIDs[i];
      const message = await channel.messages.fetch(messageID);

      const clanData = await getClanInfo(clan.tag);

      const clanboard = new EmbedBuilder()
        .setColor(clan.hex)
        .setTitle(`**__${clan.name}__**`)
        .setURL(
          `https://link.clashofclans.com/en?action=OpenClanProfile&tag=${clan.tag}`
        )
        .setThumbnail(clan.alogo)
        .setDescription(
          `<:hashtag:1163772914072563763> Tag: ${clan.tag}\n<:Levelup:1163776706696454164> Level: ${clanData.clanLevel}\n<:rep:1162732893794205826> Members: ${clanData.members}/50`
        )
        .addFields(
          {
            name: "**__War details__**",
            value: `<:WarriorFF:1163773078241808404> Wars Won: ${clanData.warWins}\n<:WarriorFF:1163773078241808404> Wars Lost: ${clanData.warLosses}\n<:WarriorFF:1163773078241808404> Wars Drawn: ${clanData.warTies}\n<:WarriorFF:1163773078241808404> Win Streak: ${clanData.warWinStreak}`,
          },
          {
            name: "**__Leagues__**",
            value: `<:cwlmedal:1029507629275435068> CWL: ${clanData.warLeague.name}\n<:capital_trophy:1163779925417922620> Capital: ${clanData.capitalLeague.name}`,
          },
          { name: "**__Requirements__**", value: clan.req }
        )
        .setFooter({
          text: "\u200b",
          iconURL: "https://i.imgur.com/FSyJai0.png",
        })
        .setTimestamp();

      const linkButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Clan Link")
          .setURL(
            `https://link.clashofclans.com/en?action=OpenClanProfile&tag=${clan.tag}`
          )
          .setStyle(ButtonStyle.Link)
      );

      // Edit the existing message with updated content
      await message
        .edit({ embeds: [clanboard], components: [linkButton] })
        .then(() =>
          console.log(`Message for ${clan.name} updated successfully`)
        )
        .catch(console.error);
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

// CWL Clan autoboard
async function cwlclan(client) {
  const channel = await client.channels.cache.get(channelID);
  try {
    const leagueClans = await fetchClanLeagues();

    const leagueOrder = [
      "Champion League I",
      "Champion League II",
      "Champion League III",
      "Master League I",
      "Master League II",
      "Master League III",
      "Crystal League I",
      "Crystal League II",
      "Crystal League III",
      "Gold League I",
      "Gold League II",
      "Gold League III",
      "Silver League I",
      "Silver League II",
      "Silver League III",
      "Bronze League I",
      "Bronze League II",
      "Bronze League III",
      "Unranked",
    ];

    const orderedLeagueClans = Object.entries(leagueClans).sort((a, b) => {
      return leagueOrder.indexOf(a[0]) - leagueOrder.indexOf(b[0]);
    });

    const fields = orderedLeagueClans.map(([league, clans]) => {
      const emoji = leagueEmojis[league] || "";
      const leagueDisplayName = `${emoji} ${league} ${emoji}`;
      const clanList =
        clans
          .map((clan) => `[${clan.name}](${clan.link}) (#${clan.tag})`)
          .join("\n") + "\n\n";
      return { name: leagueDisplayName, value: clanList };
    });

    const embed = new EmbedBuilder()
      .setColor("#825408")
      .setTitle("**__CWL Clan Information__**")
      .setTimestamp()
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    embed.addFields(fields);

    const message = await channel.messages.fetch(CWLMessageId);
    await message.edit({ embeds: [embed] });
  } catch (error) {
    console.error("Error updating the CWL embed:", error);
  }
}

module.exports = { regclan, cwlclan };
