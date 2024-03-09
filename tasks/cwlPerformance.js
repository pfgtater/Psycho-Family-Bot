const fs = require("fs");
const axios = require("axios");
const { MessageEmbed } = require("discord.js");
const {
  BASE_URL,
  headers,
  CLAN_INFO,
  generateFileName,
} = require("../shared.js");
const {
  calculateClanRankAndRoundsWon,
  findClanInfoByTag,
} = require("../utilities.js");
const moment = require("moment");
const cron = require("node-cron");
const schedule = require("node-schedule");
const path = require("path");
const cwlDirectory = path.join(__dirname, "../clanwarleague");

//Find current season
const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const season = `${year}-${month.toString().padStart(2, "0")}`;

async function initialstats() {
  const data = [];

  try {
    for (const clan of CLAN_INFO) {
      const clanresponse = await axios.get(`${BASE_URL}/clans/%23${clan.tag}`, {
        headers,
      });

      const name = clan.name;
      const tag = clan.tag;
      const start = clanresponse.data.warLeague.name;

      // Constructing the JSON object
      const clanData = {
        name,
        tag,
        start,
        played: "",
        end: {
          league: "",
          rank: "",
        },
      };

      data.push(clanData);
    }

    const fileName = `./clanwarleague/cwl-${season}.json`;

    // Creating a JSON string from the data
    const jsonData = JSON.stringify(data, null, 2);

    // Writing the JSON data to a file
    fs.writeFileSync(fileName, jsonData);

    console.log(`JSON file ${fileName} created successfully.`);
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

async function finalstats() {
  for (const clan of CLAN_INFO) {
    const clanresponse = await axios.get(`${BASE_URL}/clans/%23${clan.tag}`, {
      headers,
    });
    const endleague = clanresponse.data.warLeague.name;

    const clanName = clan.name;
    const filename = generateFileName(clanName, season);
    const filepath = path.join(cwlDirectory, filename);

    if (fs.existsSync(filepath)) {
      console.log(`File ${filepath} exists. Reading contents...`);
      const fileContents = fs.readFileSync(filepath, "utf-8");
      const jsonData = JSON.parse(fileContents);

      let warDetails;
      let leagueGroupData;

      // Check if the top-level structure is an array
      if (Array.isArray(jsonData)) {
        leagueGroupData = jsonData[0];
      } else if (jsonData.leagueGroupData) {
        leagueGroupData = jsonData.leagueGroupData;
      } else {
        throw new Error("Unexpected JSON structure");
      }

      // Assign the data from the file
      ({ warDetails } = jsonData);

      const results = await calculateClanRankAndRoundsWon(
        warDetails,
        `#${clantag}`
      );
      let rank = "null";

      if (results && results.rank) {
        rank = results.rank;
      }

      const played = "yes";
      await updateClanInfo(clantag, endleague, rank, played);
    } else {
      console.log(`File ${filepath} does not exist`);
      const rank = "null";
      const played = "no";
      await updateClanInfo(clantag, endleague, rank, played);
    }
  }
}

const updateClanInfo = async (clantag, endleague, rank, played) => {
  try {
    const fileName = `./clanwarleague/cwl-${season}.json`;
    const fileExists = fs.existsSync(fileName);

    // Read the JSON file
    const data = fileExists ? fs.readFileSync(fileName, "utf-8") : "[]";
    const clans = JSON.parse(data);

    // Find the clan by tag and update league and rank
    const clanToUpdate = clans.find((clan) => clan.tag === clantag);
    if (clanToUpdate) {
      clanToUpdate.end.league = endleague;
      clanToUpdate.end.rank = rank;
      clanToUpdate.played = played;
    } else {
      console.log(`Clan with tag ${clantag} not found.`);
      return;
    }

    // Update the JSON file with the modified data
    const updatedData = JSON.stringify(clans, null, 2);
    fs.writeFileSync(fileName, updatedData);

    console.log(`Clan with tag ${clantag} updated successfully.`);
  } catch (error) {
    //Update json with not played
    console.error("Error occurred:", error);
  }
};

module.exports = { initialstats, finalstats };
