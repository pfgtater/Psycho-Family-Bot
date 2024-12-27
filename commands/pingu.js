const axios = require("axios");
const cron = require("node-cron");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { BASE_URL, headers, CLAN_INFO } = require("../shared.js");
const MongoClient = require("mongodb").MongoClient;
const moment = require("moment");
const fs = require("fs");
const { Pagination } = require("pagination.djs");

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

const data = {
  date: "2024-02-22",
  daysLeft: 4,
  trophyRequirements: {
    topHundred: 5638,
    topTwohundred: 5609,
    topThousand: 5519,
  },
  members: [
    {
      name: "E.G Anthony",
      tag: "#G2URJ829",
      TH: 16,
      trophies: 5966,
      globalRank: 30525,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "wrongcalc ;)",
      tag: "#2G2RUC0R",
      TH: 16,
      trophies: 5932,
      globalRank: 16834,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "Solar",
      tag: "#2GLQC9C8",
      TH: 16,
      trophies: 5913,
      globalRank: 6303,
      localRank: 21,
      countryName: "Finland",
    },
    {
      name: "BigRoy",
      tag: "#G0JLLCQ2",
      TH: 16,
      trophies: 5910,
      globalRank: 12679,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "burger boss",
      tag: "#QQ9YURLJ",
      TH: 16,
      trophies: 5910,
      globalRank: 4588,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG⚡️Chicken",
      tag: "#9YUJLR8R8",
      TH: 16,
      trophies: 5826,
      globalRank: 1117,
      localRank: "N/A",
      countryName: "India",
    },
    {
      name: "A5",
      tag: "#2J2UJ8VPG",
      TH: 16,
      trophies: 5820,
      globalRank: 376257,
      localRank: 156,
      countryName: "Sri Lanka",
    },
    {
      name: "Roman Reigns",
      tag: "#89CRQQUC",
      TH: 16,
      trophies: 5818,
      globalRank: 23642,
      localRank: "N/A",
      countryName: "Italy",
    },
    {
      name: "Chief Colin",
      tag: "#8GJUQL8V8",
      TH: 16,
      trophies: 5817,
      globalRank: 27013,
      localRank: 105,
      countryName: "United States",
    },
    {
      name: "Nyash Warrior",
      tag: "#PRUCG8YQ",
      TH: 16,
      trophies: 5793,
      globalRank: 35572,
      localRank: "N/A",
      countryName: "United Kingdom",
    },
    {
      name: "PFG⚡️gdskate",
      tag: "#UR0Y0VRV",
      TH: 16,
      trophies: 5788,
      globalRank: 10409,
      localRank: 48,
      countryName: "Greece",
    },
    {
      name: "B҉l҉a҉z҉e҉",
      tag: "#88PV28922",
      TH: 16,
      trophies: 5781,
      globalRank: 9772,
      localRank: "N/A",
      countryName: "Iran",
    },
    {
      name: "Chief Joe",
      tag: "#89RYRC9Q",
      TH: 16,
      trophies: 5756,
      globalRank: 31139,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG ⚡️ Blaze",
      tag: "#28GY9Y8C2",
      TH: 16,
      trophies: 5744,
      globalRank: 79811,
      localRank: "N/A",
      countryName: "Bangladesh",
    },
    {
      name: "Speclightral",
      tag: "#9C8Y9VLCQ",
      TH: 16,
      trophies: 5724,
      globalRank: 450213,
      localRank: "N/A",
      countryName: "Bangladesh",
    },
    {
      name: "PFG⚡️Snake",
      tag: "#LU9VUCYUQ",
      TH: 16,
      trophies: 5715,
      globalRank: 20941,
      localRank: 129,
      countryName: "United States",
    },
    {
      name: "Mekeasaurus",
      tag: "#GGLC900V",
      TH: 16,
      trophies: 5681,
      globalRank: 82232,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "SDOD™️",
      tag: "#GYQV9V9",
      TH: 16,
      trophies: 5706,
      globalRank: 15624,
      localRank: 82,
      countryName: "United States",
    },
    {
      name: "jjj",
      tag: "#2J9UP8Y8",
      TH: 16,
      trophies: 5694,
      globalRank: 27095,
      localRank: 172,
      countryName: "Netherlands",
    },
    {
      name: "Locknuss",
      tag: "#VRGQY8VU",
      TH: 16,
      trophies: 5694,
      globalRank: 2019,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG⚡️Prometheus",
      tag: "#Y2QJPCRU",
      TH: 16,
      trophies: 5663,
      globalRank: 298010,
      localRank: "N/A",
      countryName: "Greece",
    },
    {
      name: "TJ",
      tag: "#YCJUJJR0",
      TH: 16,
      trophies: 5643,
      globalRank: 52076,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "FALLEN ANGEL",
      tag: "#R2UVLVVP",
      TH: 16,
      trophies: 5619,
      globalRank: 72384,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG⚡️Luke",
      tag: "#22U0YG9L",
      TH: 16,
      trophies: 5614,
      globalRank: 9513,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "Xtreme",
      tag: "#CQYJQGUY",
      TH: 16,
      trophies: 5607,
      globalRank: 64025,
      localRank: "N/A",
      countryName: "Canada",
    },
    {
      name: "PFG⚡Bryan 2.0",
      tag: "#2JQQYVGGJ",
      TH: 16,
      trophies: 5586,
      globalRank: 56300,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG⚡Bryan",
      tag: "#2LGPQG2JV",
      TH: 16,
      trophies: 5559,
      globalRank: 48319,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "luigimon",
      tag: "#PVGCGQ0R",
      TH: 16,
      trophies: 5506,
      globalRank: 173962,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "wojo",
      tag: "#PGPUQLYC",
      TH: 16,
      trophies: 5503,
      globalRank: 3326,
      localRank: "N/A",
      countryName: "Poland",
    },
    {
      name: "tim",
      tag: "#28RLCCQC",
      TH: 16,
      trophies: 5500,
      globalRank: 547104,
      localRank: "N/A",
      countryName: "Netherlands",
    },
    {
      name: "Sparnotic",
      tag: "#UJ2LV2LG",
      TH: 16,
      trophies: 5491,
      globalRank: 217297,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "Eddie",
      tag: "#8GGJ8JLL",
      TH: 16,
      trophies: 5481,
      globalRank: 16508,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG⚡️SΕΚΤ 1",
      tag: "#YCCPUYR0",
      TH: 16,
      trophies: 5480,
      globalRank: 201373,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "A Guy",
      tag: "#QUGJVUJ8",
      TH: 16,
      trophies: 5474,
      globalRank: 43823,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG⚡️DK",
      tag: "#G8PV0LUY",
      TH: 16,
      trophies: 5458,
      globalRank: 87390,
      localRank: "N/A",
      countryName: "Lebanon",
    },
    {
      name: "da yung jeeze",
      tag: "#8LJ9GQQY2",
      TH: 16,
      trophies: 5458,
      globalRank: 485423,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "Sir Al the Gr8",
      tag: "#LYVCLLRYL",
      TH: 16,
      trophies: 5441,
      globalRank: 192325,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "dead jeeze",
      tag: "#9PLUYC9R0",
      TH: 16,
      trophies: 5441,
      globalRank: 592443,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "PFG⚡Necrophos",
      tag: "#9VRRQ8RUP",
      TH: 16,
      trophies: 5440,
      globalRank: 61556,
      localRank: "N/A",
      countryName: "India",
    },
    {
      name: "PFG⚡️BluB1rd",
      tag: "#Y8C9JLV2L",
      TH: 16,
      trophies: 5430,
      globalRank: 370395,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "Res",
      tag: "#PQL20Y",
      TH: 15,
      trophies: 5412,
      globalRank: 44552,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "2ProForUrClans",
      tag: "#8VGVRPQCC",
      TH: 16,
      trophies: 5381,
      globalRank: 7071,
      localRank: 15,
      countryName: "Ireland",
    },
    {
      name: "quantum tr",
      tag: "#YL8LCY8J",
      TH: 16,
      trophies: 5377,
      globalRank: 121064,
      localRank: "N/A",
      countryName: "Türkiye",
    },
    {
      name: "Gomu_Gomu",
      tag: "#8RPVRLRQU",
      TH: 15,
      trophies: 5352,
      globalRank: 724284,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "DARK MESSIAH",
      tag: "#LUY2QQQ9",
      TH: 16,
      trophies: 5349,
      globalRank: 229169,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "Azazel",
      tag: "#89Q2JJV9G",
      TH: 16,
      trophies: 5346,
      globalRank: 134691,
      localRank: "N/A",
      countryName: "Cambodia",
    },
    {
      name: "SorPlex",
      tag: "#89CL2UGP",
      TH: 16,
      trophies: 5329,
      globalRank: 284419,
      localRank: "N/A",
      countryName: "Germany",
    },
    {
      name: "Icarus",
      tag: "#YPQGUGCGC",
      TH: 16,
      trophies: 5318,
      globalRank: 259594,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "PFG⚡️Demi",
      tag: "#YPRY889JY",
      TH: 16,
      trophies: 5315,
      globalRank: 582055,
      localRank: "N/A",
      countryName: "India",
    },
    {
      name: "Augustus",
      tag: "#8UUGU8JYJ",
      TH: 16,
      trophies: 5311,
      globalRank: 165924,
      localRank: "N/A",
      countryName: "United Kingdom",
    },
    {
      name: "AaRoN",
      tag: "#8VGRUR9YR",
      TH: 16,
      trophies: 5301,
      globalRank: 711630,
      localRank: 133,
      countryName: "Trinidad and Tobago",
    },
    {
      name: "yasyas",
      tag: "#2UVGPG282",
      TH: 16,
      trophies: 5266,
      globalRank: 461350,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "⚜️SERÅPHIM⚜️",
      tag: "#UGG28UGR",
      TH: 16,
      trophies: 5228,
      globalRank: 132562,
      localRank: "N/A",
      countryName: "United Kingdom",
    },
    {
      name: "Mars",
      tag: "#8YC08PJY9",
      TH: 16,
      trophies: 5213,
      globalRank: 755406,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "JACKii",
      tag: "#8RURCCRC",
      TH: 15,
      trophies: 5189,
      globalRank: 469194,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "Goblincleaver",
      tag: "#9LGR880JY",
      TH: 16,
      trophies: 5172,
      globalRank: 396040,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "huss",
      tag: "#P0LUL8Q9",
      TH: 15,
      trophies: 5163,
      globalRank: 334763,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "PFG⚡️NieK",
      tag: "#L29VGGG2",
      TH: 16,
      trophies: 5155,
      globalRank: 23523,
      localRank: "N/A",
      countryName: "Netherlands",
    },
    {
      name: "[B.E.] Godzon",
      tag: "#PV0V880V",
      TH: 16,
      trophies: 5131,
      globalRank: 4990,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "Big Red",
      tag: "#RJPJLL2Y",
      TH: 16,
      trophies: 5118,
      globalRank: 430105,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "PFG⚡️Ryan",
      tag: "#UU89RC9V",
      TH: 16,
      trophies: 5116,
      globalRank: 188994,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "⚜️3 ⭐️ Bandit⚜️",
      tag: "#2LRUP02Y8",
      TH: 16,
      trophies: 5114,
      globalRank: 316497,
      localRank: "N/A",
      countryName: "United States",
    },
    {
      name: "Stone",
      tag: "#PLG0U2L9J",
      TH: 16,
      trophies: 5113,
      globalRank: 662322,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "Chauncy96",
      tag: "#GYLUU2GG",
      TH: 16,
      trophies: 5089,
      globalRank: 165610,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "Blood Rainbow",
      tag: "#Q0RJJCCV",
      TH: 16,
      trophies: 5069,
      globalRank: 755996,
      localRank: "N/A",
      countryName: "N/A",
    },
    {
      name: "Kunal163",
      tag: "#LRLVCUUJ",
      TH: 16,
      trophies: 5057,
      globalRank: 340649,
      localRank: "N/A",
      countryName: "India",
    },
  ],
};

async function legendsleaderboard(interaction, client) {
  //const data = JSON.parse(await dailylegendsdata())
  console.log(`Here is your imported data\n${data}`);
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
  name: "pingu",
  description: "Time for some mad scientist experiments",
  async execute(interaction, client) {
    await interaction.deferReply();
    legendsleaderboard(interaction, client);
    await interaction.editReply("Leaderboard computed");
  },
};
