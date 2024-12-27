const axios = require("axios");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { BASE_URL, headers, CLAN_INFO } = require("../shared.js");
const MongoClient = require("mongodb").MongoClient;
const moment = require("moment");
const { Pagination } = require("pagination.djs");

// Function to calculate family ranking
async function familymembers() {
  try {
    const allMembers = [];
    for (const clan of CLAN_INFO) {
      const url = `${BASE_URL}/clans/%23${clan.tag}`;
      try {
        const response = await axios.get(url, { headers });
        console.log(`Successfully fetched data for clan: ${clan.name}`);
        const clanData = response.data;

        // Extract only tag and name for each member
        const filteredMembers = clanData.memberList.map((member) => ({
          tag: member.tag,
          name: member.name,
          trophies: member.trophies,
        }));
        allMembers.push(...filteredMembers);
        await sleep(100);
      } catch (error) {
        console.error(`Error fetching data for clan ${clan.name}:`, error);
      }
    }

    const filteredMembers = allMembers.filter(
      (member) => member.trophies >= 5000
    );
    filteredMembers.sort((a, b) => b.trophies - a.trophies);

    //const top50members = allMembers.slice(0, 50);

    return filteredMembers;
  } catch (error) {
    console.error("Error:", error);
  }
}

//Sleep
async function sleep(ms) {
  //console.log(`Sleeping for ${ms} milliseconds...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateSeasonTime() {
  const moment = require("moment"); // Ensure moment is required in the scope

  function getStartForMonthYear(m, y) {
    let daysInMonth = moment.utc([y, m]).daysInMonth();
    let lastDayOfMonth = moment.utc([y, m, daysInMonth]);
    let weekdayOfLastDay = lastDayOfMonth.isoWeekday();
    let lastMonday = lastDayOfMonth.subtract(
      (weekdayOfLastDay === 1 ? 0 : weekdayOfLastDay) - 1,
      "days"
    );
    lastMonday.hour(5).minute(0).second(0).millisecond(0);
    return lastMonday;
  }

  function getSeasonEnd() {
    let now = moment.utc();
    let m = now.month(); // Use current month
    let y = now.year(); // Use current year
    let seasonStart = getStartForMonthYear(m, y);
    if (seasonStart > now) {
      return seasonStart;
    }
    m = now.month() + 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    return getStartForMonthYear(m, y);
  }

  let seasonEnd = getSeasonEnd();
  let now = moment.utc();
  let duration = moment.duration(seasonEnd.diff(now));
  let days = duration.days();
  let hours = duration.hours();
  return `${days}d ${hours}h`;
}

async function legendsdata() {
  try {
    // Define Clash King and Psycho Bot monogdb credentials
    const ckurl =
    const pburl =
      "mongodb psycho";
    const CKdb = "new_looper";
    const PBdb = "PsychoBot";
    const mongoCK = new MongoClient(ckurl);
    const mongoPB = new MongoClient(pburl);

    //Connect to ClashKing mongodb and obtain ranks
    await mongoCK.connect();
    console.log("Connected to MongoDB");
    const db = mongoCK.db(CKdb);
    const collection = db.collection("legend_rankings");

    async function fetchtrophycount(position) {
      try {
        const entry = await collection
          .find()
          .skip(position - 1)
          .limit(1)
          .toArray();
        const trophies = entry.map((e) => e.trophies);
        console.log(`${trophies}`);

        return trophies;
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
      }
    }

    const hundred = await fetchtrophycount(100);
    const twohundred = await fetchtrophycount(200);
    const thousand = await fetchtrophycount(1000);
    await mongoCK.close();

    //Fetch members
    const members = await familymembers();

    const now = moment(); // Get the current date and time
    const formattedDate = now.format("YYYY-MM-DD");
    const daysRemaining = calculateSeasonTime();

    const data = {
      date: formattedDate,
      daysLeft: daysRemaining,
      trophyRequirements: {
        topHundred: hundred[0],
        topTwohundred: twohundred[0],
        topThousand: thousand[0],
      },
      members: [],
    };

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const playerTag = member.tag.replace("#", "%23");

      try {
        const playerApiUrl = `${BASE_URL}/players/${playerTag}`;
        const playerResponse = await axios.get(playerApiUrl, { headers });
        //console.log(`Making Clash API request for ${playerTag}`)
        const playerData = playerResponse.data;

        try {
          const rankingApiUrl = `https://api.clashking.xyz/ranking/legends/${playerTag}`;
          //console.log(`Making CK API request for ${playerTag}`)
          const rankingResponse = await axios.get(rankingApiUrl);
          let globalrank = rankingResponse.data.rank;

          try {
            const legendsApiUrl = `https://api.clashking.xyz/player/${playerTag}/legends`;
            const legendsResponse = await axios.get(legendsApiUrl);
            const legendsData = legendsResponse.data;

            const memberData = {
              name: playerData.name,
              tag: playerData.tag,
              TH: playerData.townHallLevel,
              trophies: playerData.trophies,
              globalRank: globalrank || "N/A",
              localRank:
                (legendsData && legendsData.rankings?.local_rank) || "N/A",
              countryName:
                (legendsData && legendsData.rankings?.country_name) || "N/A",
            };

            data.members.push(memberData);
          } catch (legendsError) {
            console.error(
              `Error fetching legends data for ${playerTag}:, legendsError`
            );
            // Handle legends API error
          }
        } catch (rankingError) {
          console.error(
            `Error fetching ranking data for ${playerTag}:, rankingError`
          );
          // Handle ranking API error
        }
      } catch (playerError) {
        console.error(
          `Error fetching player data for ${playerTag}:, playerError`
        );
        // Handle player API error
      }
    }
    const jsonOutput = JSON.stringify(data, null, 2);

    return jsonOutput;
  } catch (error) {
    console.error("Error in locallegendsboard:", error);
  }
}

async function legendsleaderboard(interaction, client) {
  const data = JSON.parse(await legendsdata());
  const now = moment();
  const formattedDate = now.format("MMM DD");
  const seasonTimeRemaining = calculateSeasonTime();

  // Build and send embeds
  const embeds = []; // Array to store all embeds

  const member = data.members;

  const entriesPerEmbed = 25;
  const totalEntries = member.length;
  const embedCount = Math.ceil(totalEntries / entriesPerEmbed);

  for (let j = 0; j < embedCount; j++) {
    const startIndex = j * entriesPerEmbed;
    const endIndex = Math.min((j + 1) * entriesPerEmbed, totalEntries);

    const currentEmbed = new EmbedBuilder()
      .setColor("#92600d")
      .setTitle(`__Legends Leaderboard for ${formattedDate}__`)
      .setThumbnail(
        "https://cdn.discordapp.com/icons/549028189863804928/a_b317fe7db22614b082e8aacb196d9d3a.gif?size=1024"
      )
      .setTimestamp()
      .setDescription(
        `** Trophy count for Global rank**\n<a:ZA_right_arrow:1133424908915982487> Top 100 - ${data.trophyRequirements.topHundred} \n<a:ZA_right_arrow:1133424908915982487> Top 200 - ${data.trophyRequirements.topTwohundred}\n<a:ZA_right_arrow:1133424908915982487> Top 1000 - ${data.trophyRequirements.topThousand}\n`
      )
      .setFooter({
        text: `Time until season ends: ${seasonTimeRemaining}`,
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    for (let i = startIndex; i < endIndex; i++) {
      if (member[i].localRank === null || member[i].localRank === "N/A") {
        currentEmbed.addFields({
          name: `${i + 1}. __${member[i].name}__`,
          value: `<:trophies:1189582886253367387> ${member[i].trophies}\n<:rank:1189662581019918337> ${member[i].globalRank}`,
        });
      } else {
        currentEmbed.addFields({
          name: `${i + 1}. __${member[i].name}__`,
          value: `<:trophies:1189582886253367387> ${member[i].trophies}\n<:rank:1189662581019918337> ${member[i].globalRank} | ${member[i].localRank} (${member[i].countryName})`,
        });
      }
    }

    embeds.push(currentEmbed);
  }

  const channelId = "1089967329498112131";
  const channel = await client.channels.cache.get(channelId);
  //await channel.send({ embeds: [embed1] });

  // Send embeds with pagination
  const pagination = new Pagination(interaction);
  pagination.setEmbeds(embeds);
  pagination.render();
}

module.exports = {
  name: "legends-leaderboard",
  description: "Show current trophies and ranking",
  async execute(interaction, client) {
    await interaction.deferReply();
    legendsleaderboard(interaction, client);
    await interaction.editReply("Leaderboard computed");
  },
};
