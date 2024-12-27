const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const axios = require("axios");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const { logit } = require("../utilities.js");
const {
  CLAN_INFO,
  headers,
  BASE_URL,
  API_KEY,
  generateFileName,
} = require("../shared.js");
const cwlDirectory = path.join(__dirname, "../clanwarleague");

//Find current season
const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const season = `${year}-${month.toString().padStart(2, "0")}`;

async function cwlendtime(client) {
  console.log("Running cwlendtime Function");
  const results = [];

  for (const clan of CLAN_INFO) {
    try {
      const tag = clan.tag;
      const leagueGroupResponse = await axios.get(
        `${BASE_URL}/clans/%23${tag}/currentwar/leaguegroup`,
        { headers }
      );
      const leagueGroupData = leagueGroupResponse.data;
      const lastRound =
        leagueGroupData.rounds[leagueGroupData.rounds.length - 1];
      const lastWarTag =
        lastRound.warTags[lastRound.warTags.length - 1].substring(1);
      console.log("Getting leagueGroupResponse");

      const warTagResponse = await axios.get(
        `${BASE_URL}/clanwarleagues/wars/%23${lastWarTag}`,
        { headers }
      );
      console.log("Getting warTagResponse");
      const warTagData = warTagResponse.data;
      const originalISO = warTagData.endTime;
      const standardISO =
        originalISO.substring(0, 4) +
        "-" +
        originalISO.substring(4, 6) +
        "-" +
        originalISO.substring(6, 11) +
        ":" +
        originalISO.substring(11, 13) +
        ":" +
        originalISO.substring(13);
      const unixTime = Date.parse(standardISO);

      results.push({
        name: clan.name,
        tag: tag,
        unixtime: unixTime,
      });
    } catch (error) {
      console.error(`Error processing clan ${clan.tag}: ${error.message}`);
      continue; // Continue to the next clan in case of an error
    }
  }

  console.log("Awaiting results");
  const validResults = await results.filter((result) => result !== null);

  // Write Data to json file
  const jsonFileName = `${season}-cwlend.json`;
  await fsPromises.writeFile(
    jsonFileName,
    JSON.stringify(validResults, null, 2)
  );
  console.log(`Data written to ${jsonFileName}`);

  // Build and send embed to log channel
  const embed = new EmbedBuilder().setTitle("CWL End Time Obtained");
  validResults.forEach((result) => {
    embed.addFields({
      name: `${result.name} (${result.tag})`,
      value: `CWL ending in <t:${Math.floor(result.unixtime / 1000)}:R>`,
    });
  });

  await logit(client, {
    content: `CWL end time data stored in ${jsonFileName}`,
    embeds: [embed],
  });
}

// Locating the warLeagueName utilzing a single api request, and then passing that to calculateLeaderboard
async function getWarLeagueName(clantag) {
  try {
    const url = `${BASE_URL}/clans/%23${clantag}`;
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

function areWarDetailsAvailable(roundData) {
  return roundData.every(
    (war) => war.state !== "notInWar" && war.state !== "preparation"
  );
}

function calculateClanRankAndRoundsWon(warDetails, clantag) {
  let clanScores = {};

  warDetails.forEach((roundGroup, roundIndex) => {
    // Check if all war details are available for the current round
    if (!areWarDetailsAvailable(roundGroup)) {
      console.log(
        `Not all war details are available for round ${
          roundIndex + 1
        }. Skipping.`
      );
      return; // Skip this round
    }

    roundGroup.forEach((round) => {
      let clan1 = round.clan;
      let clan2 = round.opponent;

      // Initialize if not already present
      [clan1, clan2].forEach((clan) => {
        if (!clanScores[clan.tag]) {
          clanScores[clan.tag] = {
            totalStars: 0,
            roundsWon: 0,
          };
        }
      });

      // Add stars directly from the JSON data
      clanScores[clan1.tag].totalStars += clan1.stars;
      clanScores[clan2.tag].totalStars += clan2.stars;

      // Determine the winner of the round
      if (
        clan1.stars > clan2.stars ||
        (clan1.stars === clan2.stars &&
          clan1.destructionPercentage > clan2.destructionPercentage)
      ) {
        clanScores[clan1.tag].roundsWon++;
        clanScores[clan1.tag].totalStars += 10; // Bonus stars for winning the 1v1
      } else if (
        clan2.stars > clan1.stars ||
        (clan2.stars === clan1.stars &&
          clan2.destructionPercentage > clan1.destructionPercentage)
      ) {
        clanScores[clan2.tag].roundsWon++;
        clanScores[clan2.tag].totalStars += 10; // Bonus stars for winning the 1v1
      }
    });
  });

  let sortedClans = Object.keys(clanScores).sort(
    (a, b) => clanScores[b].totalStars - clanScores[a].totalStars
  );
  let ourClanRank = sortedClans.indexOf(clantag) + 1;

  if (!clanScores[clantag]) {
    return {
      rank: "N/A",
      roundsWon: "N/A",
    };
  }

  let ourRoundsWon = clanScores[clantag].roundsWon;
  return {
    rank: ourClanRank,
    roundsWon: ourRoundsWon,
  };
}

async function cwlstore(client, season, clantag, chosenStyles) {
  try {
    //const clantag = interaction.options.getString('clantag');
    if (!clantag) {
      console.log("Error: Clan tag not provided");
      //await interaction.editReply({ content: 'Error: Clan tag not provided' });
      return;
    }

    const findClanInfoByTag = (tag) => {
      const foundClan = CLAN_INFO.find((clan) => clan.tag === tag);
      if (foundClan) {
        const { name, loc, channel } = foundClan;
        return { name, loc, channel };
      } else {
        return { name: "Clan not found", loc: "" };
      }
    };

    const clanInfo = findClanInfoByTag(clantag);
    const clanName = clanInfo.name;
    const logoPath = clanInfo.loc;
    const clanchannel = clanInfo.channel;

    if (!clanchannel || !clanName) {
      console.log(`Error: Could not find data for clan tag ${clantag}`);
      //await interaction.editReply(`Error: Could not find data for clan tag ${clantag}`);
      return;
    }

    const warLeagueName = await getWarLeagueName(clantag);

    if (!warLeagueName) {
      console.error("Failed to fetch war league name for clan:", clantag);
      //await interaction.editReply(`Error: Failed to fetch war league name for clan ${clantag}`);
      return;
    }

    try {
      //const season = interaction.options.getString('season');
      const filename = generateFileName(clanName, season);
      const filepath = path.join(cwlDirectory, filename);

      let leagueGroupData, warDetails, ourClanMembers;

      if (fs.existsSync(filepath)) {
        console.log(`File ${filepath} exists. Reading contents...`);
        const fileContents = fs.readFileSync(filepath, "utf-8");
        const jsonData = JSON.parse(fileContents);

        if (Array.isArray(jsonData)) {
          leagueGroupData = jsonData[0];
        } else if (jsonData.leagueGroupData) {
          leagueGroupData = jsonData.leagueGroupData;
        } else {
          throw new Error("Unexpected JSON structure");
        }

        ({ leagueGroupData, warDetails, ourClanMembers } = jsonData);
      }

      if (
        !leagueGroupData ||
        !leagueGroupData.clans ||
        leagueGroupData.clans.length === 0
      ) {
        console.error("Invalid leagueGroupData:", leagueGroupData);
        //await interaction.editReply({ content: 'Error: Invalid league data received.' });
        return;
      }

      try {
        await savebonus(
          client,
          warDetails,
          clantag,
          leagueGroupData,
          warLeagueName,
          chosenStyles,
          clanchannel,
          logoPath
        );
        console.log(`Leaderboard computed successfully for ${clantag}`);
        //await interaction.editReply({ content: `Leaderboard computed successfully` });
      } catch (error) {
        console.error("Error computing leaderboard:", error);
        //await interaction.editReply({ content: `Error computing leaderboard for ${clantag}` });
      }
    } catch (error) {
      console.error("Inner try block error:", error);
      //await interaction.editReply({ content: `Error in inner try block` });
    }
  } catch (error) {
    console.error("Outer try block error:", error);
    //await interaction.editReply({ content: `Error in outer try block` });
  }
}

async function savebonus(
  client,
  warDetails,
  clantag,
  leagueGroupData,
  warLeagueName,
  chosenStyles,
  clanchannel,
  logoPath
) {
  //debug remove
  console.log("Entered calculateLeaderboard function");

  // in utilities.js, at the beginning of calculateLeaderboard
  //console.log("Value of leagueGroupData right after receiving in calculateLeaderboard:", leagueGroupData);
  //console.log("Type of leagueGroupData right after receiving in calculateLeaderboard:", typeof leagueGroupData);

  // At the start of calculateLeaderboard in utilities.js
  if (!leagueGroupData || !leagueGroupData.clans) {
    throw new Error("leagueGroupData or leagueGroupData.clans is undefined");
  }

  //console.log('Full leagueGroupData:', JSON.stringify(leagueGroupData, null, 2));  // Debugging line

  // Prepend the hashtag to the clan tag for proper matching
  const formattedclantag = `#${clantag}`;

  // Added a log to debug the type and value of leagueGroupData.clans
  //console.log('Type of leagueGroupData.clans:', typeof leagueGroupData.clans);

  // Find the clan by its tag
  const ourClan = leagueGroupData.clans.find(
    (clan) => clan.tag === formattedclantag
  );

  // testing defining our clan members
  const ourClanMembers = ourClan.members;

  //console.log(`Clan tag used for searching: ${formattedclantag}`);
  //console.log('League Group Data:', leagueGroupData.season);

  if (!ourClan) {
    throw new Error("Our clan not found in the data");
  }

  const clanName = ourClan.name;

  // Ensure our clan is present in the data
  if (!ourClan) {
    throw new Error("Our clan not found in the data");
  }

  const playerData = {};
  // debug remove
  console.log("Exiting calculateLeaderboard function");

  // 2. DATA PROCESSING (VERY LONG!!!)

  warDetails.forEach((roundData, roundIndex) => {
    // Loop through each war in 'warDetails'
    roundData.forEach(async (war, warIndex) => {
      //console.log(`Processing round ${roundIndex + 1}, war ${warIndex + 1}`);

      // start test

      if (
        !war ||
        war.state === "notInWar" ||
        war.state === "preparation" ||
        war.teamSize === 0
      ) {
        //console.log(`Skipping round ${roundIndex + 1}, war ${warIndex + 1} due to incomplete data.`);
        return; // Continue to the next iteration
      }

      //console.log(`Processing round ${roundIndex + 1}, war ${warIndex + 1}`);

      // end test

      // Debug
      //console.log(`war.clan.tag: ${war.clan.tag}, clantag: #${clantag}`);

      // Determine if our clan is participating as attacker or defender
      const isAttacker = war.clan.tag === `#${clantag}`;
      const isDefender = war.opponent && war.opponent.tag === `#${clantag}`;

      if (isAttacker || isDefender) {
        //console.log('Our clan is participating in this war.');

        // 1. Build a mapping of all players in the war to their townhall levels
        const townhallMap = {};

        // Determine which side (attacker or defender) our clan is on
        const ourClanSide = isAttacker ? war.clan : war.opponent;

        // Build the map from both your clan and the opponent if applicable
        [war.clan, war.opponent].forEach((clan) => {
          if (clan) {
            clan.members.forEach((member) => {
              townhallMap[member.tag] = member.townhallLevel;
            });
          }
        });

        // Only process members of our clan
        ourClanSide.members.forEach((member) => {
          const playerTag = member.tag;
          const playerName = member.name;
          const townhallLevel = member.townhallLevel;

          // Check to see if the player is a member of our clan
          if (
            !ourClanMembers.some((ourMember) => ourMember.tag === playerTag)
          ) {
            return;
          }

          // Initialize player data if not present
          if (!playerData[playerTag]) {
            playerData[playerTag] = {
              name: playerName,
              offensive_score: 0,
              defensive_score: 0,
              bonus_penalty: 0,
              attacks: [],
            };
          }

          const offensiveStars = member.attacks
            ? member.attacks.reduce(
                (acc, attack) => acc + (attack.stars || 0),
                0
              )
            : 0;
          playerData[playerTag].offensive_score += offensiveStars;

          // Calculate defensive stars

          const defensiveStars = member.bestOpponentAttack
            ? member.bestOpponentAttack.stars
            : 2; // Assume 2 stars if not attacked
          playerData[playerTag].defensive_score += defensiveStars;

          // Calculate bonus or penalty

          if (member.attacks && member.attacks.length > 0) {
            member.attacks.forEach((attack) => {
              const opponentTag = attack.defenderTag;

              // Retrieve the defender's townhall level from the mapping
              const opponentTownhallLevel = townhallMap[opponentTag];

              if (townhallLevel !== opponentTownhallLevel) {
                if (townhallLevel < opponentTownhallLevel) {
                  playerData[playerTag].bonus_penalty += 1;
                } else if (townhallLevel > opponentTownhallLevel) {
                  playerData[playerTag].bonus_penalty -= 1;
                }
              }

              // Store each attack's stars in player data
              playerData[playerTag].attacks.push(attack.stars || 0);
            });
          }
        });
      }
    });
  });

  // Calculate the total offensive and defensive score
  Object.values(playerData).forEach((player) => {
    player.total_offensive_score = player.offensive_score;
    player.total_defensive_score = player.defensive_score;
  });

  // Calculate the net stars for each player
  5;
  const playerStats = Object.values(playerData).map((player) => {
    const totalOffense = player.total_offensive_score;
    const totalDefensiveStars = player.total_defensive_score;
    const bonusPenalty = player.bonus_penalty;
    const netStars = totalOffense - totalDefensiveStars + bonusPenalty;
    return { name: player.name, netStars, netOffense: totalOffense };
  });

  // Organize the player stats from highest net to lowest net
  playerStats.sort((a, b) => {
    if (b.netStars === a.netStars) {
      // If net stars are equal
      return b.netOffense - a.netOffense; // sort by total offensive stars
    }
    return b.netStars - a.netStars; // Otherwise, sort by net stars
  });

  // Defining rank, results, and rounds won
  const results = calculateClanRankAndRoundsWon(warDetails, `#${clantag}`);
  const rank = results.rank;
  const roundsWon = results.roundsWon;

  // 3. DRAWING ON CANVAS
  const canvas = createCanvas(1100, 1560);
  const ctx = canvas.getContext("2d");
  let backgroundImagePath;
  switch (chosenStyles) {
    case "winter":
      backgroundImagePath = "./assets/base-image/cwl-winter.png";
      break;
    case "halloween":
      backgroundImagePath = "./assets/base-image/cwl-halloween.png";
      break;
    case "paper":
      backgroundImagePath = "./assets/base-image/cwl-paper.png";
      break;
    case "tater":
      backgroundImagePath = "./assets/base-image/cwl-tater.png";
      break;
    default:
      backgroundImagePath = "./assets/base-image/cwl-winter.png";
  }
  const image = await loadImage(backgroundImagePath);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const logoImage = await loadImage(logoPath);
  const logoWidth = 280; // Adjust the width of the logo as needed
  const logoHeight = (logoWidth / logoImage.width) * logoImage.height;
  ctx.drawImage(
    logoImage,
    canvas.width - logoWidth - 30,
    30,
    logoWidth,
    logoHeight
  );

  // Register the custom font
  const fontPath = "./assets/font/font.ttf";
  registerFont(fontPath, { family: "Supercell Magic" });

  // Noto sans
  registerFont("./assets/font/Oxanium.ttf", { family: "Oxanium" });

  // Setting properties for League Name
  ctx.font = "43px Oxanium";
  ctx.font = '300 50px "Supercell-Magic"';
  ctx.fillStyle = "#AF0000";
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 3;
  ctx.shadowColor = "white";
  ctx.fillText(`${warLeagueName}`, 30, 200);

  // Reverting or setting desired properties for Rank and Rounds won
  ctx.font = '50px "Supercell-Magic"';
  ctx.fillStyle = "#000000"; // Black color
  ctx.shadowBlur = 0; // Resetting shadowBlur
  ctx.shadowOffsetY = 0; // Resetting shadowOffsetY
  ctx.fillText(`Rank: ${rank}`, 30, 260);
  ctx.fillText(`Rounds Won: ${roundsWon} `, 30, 320);

  // List of players
  ctx.font = '43px "Supercell-Magic"';
  ctx.fillStyle = "#000000"; // Black color
  const gapBetweenLines1 = 63; // Adjust this value as needed

  // Playerstats Array (Limit to 15 players)
  const names = playerStats.slice(0, 15).map((player) => player.name);

  // Loop through each name and then each character in the name
  names.forEach((name, index) => {
    let xPos = 30; // Starting x position for each name
    const yPos = 525 + index * gapBetweenLines1; // y position for each name
    ctx.font = '43px "Supercell-Magic"';
    ctx.fillStyle = "#000000";

    // Draw the character
    ctx.fillText(name, xPos, yPos);
  });

  // Send net stars with center alignment
  ctx.font = '43px "Supercell-Magic"';
  ctx.fillStyle = "#000000"; // Black color
  const gapBetweenLines2 = 63; // Adjust this value as needed
  const centerX = 775 + 25; // Center alignment adjustment

  function formatScore(score) {
    if (score > 0) {
      return `+${score}`;
    }
    return `${score}`;
  }

  // Limit nets to 15 elements
  const nets = playerStats
    .slice(0, 15)
    .map((player) => formatScore(player.netStars));

  nets.forEach((net, index) => {
    const textWidth = ctx.measureText(net).width;
    const x = centerX - textWidth / 2;
    ctx.fillText(net, x, 525 + index * gapBetweenLines2);
  });

  // Send total stars with center alignment
  ctx.font = '43px "Supercell-Magic"';
  ctx.fillStyle = "#000000"; // Black color
  const gapBetweenLines3 = 63; // Adjust this value as needed
  const centerX2 = 965 + 25; // Center alignment adjustment

  // Limit stars to 15 elements
  const stars = playerStats
    .slice(0, 15)
    .map((player) => String(player.netOffense));

  stars.forEach((net, index) => {
    const textWidth = ctx.measureText(net).width;
    const x = centerX2 - textWidth / 2;
    ctx.fillText(net, x, 525 + index * gapBetweenLines3);
  });

  // 4. SEND IMAGE TO DISCORD
  const buffer = canvas.toBuffer();
  const attachment = new AttachmentBuilder(buffer, "output.png"); // Create the attachment

  /*
  // For debugging, you can write the image to disk
  fs.writeFile("output.png", buffer, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log("File written successfully");
    }
  });
*/

  // Send the attachment
  const channel = client.channels.cache.get(clanchannel);
  console.log(`Sending message to ${channel}`);
  channel
    .send({ files: [attachment] })
    .then((sentMessage) => {
      // Pin the sent message
      sentMessage
        .pin()
        .then(() => {
          console.log("Image sent and pinned successfully");
        })
        .catch((pinError) => {
          console.error("Error pinning the message:", pinError);
        });
    })
    .catch((sendError) => {
      console.error("Error sending image:", sendError);
    });

  // Resolve the promise
  return Promise.resolve();
}

module.exports = { cwlendtime, cwlstore };
