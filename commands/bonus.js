const fs = require("fs");
const path = require("path");
const {
  headers,
  API_KEY,
  generateFileName,
  CLAN_INFO,
} = require("../shared.js");
const {
  readJsonFile,
  calculateLeaderboard,
  fetchCWLData,
} = require("../utilities.js");
//const { fetchCWLDataOnce } = require('./bonus-pull.js');
const axios = require("axios");
const cwlDirectory = path.join(__dirname, "../clanwarleague");
const BASE_URL = "https://api.clashofclans.com/v1";

// Locating the warLeagueName utilzing a single api request, and then passing that to calculateLeaderboard
async function getWarLeagueName(clanTag) {
  try {
    const url = `${BASE_URL}/clans/%23${clanTag}`;
    const response = await axios.get(url, { headers });
    if (response.data.warLeague && response.data.warLeague.name) {
      return response.data.warLeague.name;
    } else {
      throw new Error("War league data is not available.");
    }
  } catch (error) {
    console.error("Failed to fetch war league name:", error.message);
    return null;
  }
}

module.exports = {
  name: "bonus",
  description: "Calculates CWL bonuses",

  async execute(interaction, client) {
    const clanTag = interaction.options.getString("clan");
    const noBonus = interaction.options.getBoolean("no_bonus");
    const findClanInfoByTag = (tag) => {
      const foundClan = CLAN_INFO.find((clan) => clan.tag === tag);
      if (foundClan) {
        const { name, loc } = foundClan;
        return { name, loc };
      } else {
        return { name: "Clan not found", loc: "" };
      }
    };

    const clanInfo = findClanInfoByTag(clanTag);
    const clanName = clanInfo.name;
    const logoPath = clanInfo.loc;

    console.log(`Executing command for clan: ${clanName}`);

    if (!clanTag) {
      console.log(`Error: Could not find data for clan name ${clanName}`);
      await interaction.reply(
        `Error: Could not find data for clan name ${clanName}`
      );
      return;
    }
    const warLeagueName = await getWarLeagueName(clanTag);
    if (!warLeagueName) {
      console.error("Failed to fetch war league name for clan:", clanTag);
      await interaction.reply(
        `Error: Failed to fetch war league name for clan ${clanName}`
      );
      return;
    }
    await interaction.deferReply();

    try {
      const season = interaction.options.getString("season");
      const filename = generateFileName(clanName, season);
      const filepath = path.join(cwlDirectory, filename);
      const chosenStyles = interaction.options.getString("style") || "winter";

      let leagueGroupData, warDetails, ourClanMembers;

      if (fs.existsSync(filepath)) {
        console.log(`File ${filepath} exists. Reading contents...`);
        const fileContents = fs.readFileSync(filepath, "utf-8");
        const jsonData = JSON.parse(fileContents);

        // Check if the top-level structure is an array
        if (Array.isArray(jsonData)) {
          leagueGroupData = jsonData[0];
        } else if (jsonData.leagueGroupData) {
          leagueGroupData = jsonData.leagueGroupData;
        } else {
          throw new Error("Unexpected JSON structure");
        }

        // Assign the data from the file
        ({ warDetails, ourClanMembers } = jsonData);
      } else {
        console.log(
          `File ${filepath} does not exist. Fetching CWL data for clan tag: ${clanTag}`
        );
        await fetchCWLData(clanTag, client, clanName, cwlDirectory);

        if (fs.existsSync(filepath)) {
          const fileContents = fs.readFileSync(filepath, "utf-8");
          const jsonData = JSON.parse(fileContents);

          // Check if the top-level structure is an array
          if (Array.isArray(jsonData)) {
            leagueGroupData = jsonData[0];
          } else if (jsonData.leagueGroupData) {
            leagueGroupData = jsonData.leagueGroupData;
          } else {
            throw new Error("Unexpected JSON structure");
          }

          // Assign the data from the file
          ({ warDetails, ourClanMembers } = jsonData);
        } else {
          console.error(
            "Unexpected result: File still does not exist after fetch"
          );
          await interaction.editReply({
            content: `CWL data not found for ${clanName} in ${season} season`,
          });
          return;
        }
      }

      // Validate the data
      if (
        !leagueGroupData ||
        !leagueGroupData.clans ||
        leagueGroupData.clans.length === 0
      ) {
        console.error("Invalid leagueGroupData:", leagueGroupData);
        await interaction.editReply({
          content: "Error: Invalid league data received.",
        });
        return;
      }

      // Calculate leaderboard

      // NEW

      await calculateLeaderboard(
        warDetails,
        interaction,
        clanTag,
        logoPath,
        leagueGroupData,
        warLeagueName,
        chosenStyles,
        noBonus
      );
      // NEW (added transformed in first variable)
      console.log(`Leaderboard computed successfully for ${clanName}`);
      await interaction.editReply({
        content: `Leaderboard computed successfully for ${clanName} in ${season} season`,
      });
    } catch (error) {
      console.error(
        `Error computing leaderboard for ${clanName} in (season placehoder):`,
        error
      );
      await interaction.editReply({
        content: `Error computing leaderboard for ${clanName} in season plceholder:`,
      });
    }
  },
};
