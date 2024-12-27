// This file contains utility functions, exported into other files (primarily index.js)
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
  BASE_URL,
  CLAN_INFO,
  REG_CLAN_INFO,
  API_KEY,
  headers,
  generateFileName,
  TH_EMOTES,
} = require("./shared.js");

const { MongoClient } = require("mongodb");
const uri = 
const mongoClient = new MongoClient(uri);
async function connectToMongo() {
  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

async function sleep(ms) {
  //console.log(`Sleeping for ${ms} milliseconds...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const outLogFilePath = "logs/prod-out.log"; // Path to the output log file
const errorLogFilePath = "logs/prod-error.log"; // Path to the error log file
const positionFilePath = "log_position.json"; // Store the last position here
const discordWebhookURL =
  "web_hook";
const CHANNEL_ID = "1089967329498112131"; //BT10. fetchCWLData
const cwlDirectory = path.join(__dirname, "../prod-bot/clanwarleague"); // fetchCWLData
// Utility Functions

async function reportErrorToChannel(error, user, interaction, client) {
  const errorChannel = await client.channels.fetch("1089967329498112131");
  const interactionType =
    interaction.type === "APPLICATION_COMMAND" ? "Command" : "Button";
  const interactionName = interaction.commandName || interaction.customId;
  const stackTrace = error.stack.split("\n").slice(0, 3).join("\n");

  const errorEmbed = new EmbedBuilder()
    .setTitle("Error Occurred")
    .setColor(0xf04747)
    .addFields(
      { name: "Error Type", value: error.name },
      { name: "Error Details", value: stackTrace.substring(0, 1024) },
      { name: "User", value: user.username },
      { name: "Interaction Type", value: interactionType },
      { name: "Interaction Name", value: interactionName },
      { name: "Timestamp", value: new Date().toISOString() },
      { name: "Source", value: "Production Bot" }
    )
    .setTimestamp();

  await errorChannel.send({ embeds: [errorEmbed] });
}

function getLogoPath(clanName) {
  const logoPaths = {
    "Psycho Soldiers": "./assets/logo/PS.png",
    "Psycho Warriors": "./assets/logo/PW.png",
    "Psycho Cadets": "./assets/logo/PC.png",
    "Psycho Troopers": "./assets/logo/PT.png",
    PsychoPaths: "./assets/logo/PP.png",
    "House Veganaise": "./assets/logo/HV.png",
    ΠΡΟΜΗΘΕΑΣ: "./assets/logo/BC.png",
    "Nyte Garden Dug": "./assets/logo/Blu.png",
    FlareonsOfFire: "./assets/logo/Fof.png",
    "Polish Hussars": "./assets/logo/PH.png",
    "SouL×HunTErs": "./assets/logo/SH.png",
    "Psycho Brigade": "./assets/logo/PB.png",
    "Psycho Blue": "./assets/logo/PBlue.png",
    "Psycho Platoon": "./assets/logo/Ptoon.png",
    "Psycho Ulcers": "./assets/logo/PU.png",
    "Psycho Militia": "./assets/logo/PM.png",
    "Psycho eSports": "./assets/logo/PE.png",
    "TGO TGO": "./assets/logo/TGO.png",
  };

  return logoPaths[clanName];
}

const getAvailableSeasons = () => {
  const seasons = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let startYear = 2023;
  let startMonth = 10; // Updated to match JSON format

  while (
    startYear < currentYear ||
    (startYear === currentYear && startMonth <= currentMonth)
  ) {
    seasons.push({
      name: `${startYear}-${startMonth.toString().padStart(2, "0")}`,
      value: `${startYear}-${startMonth.toString().padStart(2, "0")}`,
    });

    if (startMonth === 12) {
      startMonth = 1;
      startYear += 1;
    } else {
      startMonth += 1;
    }
  }

  return seasons;
};
//new function
// Helper function to check if all war details are available for a given round
function areWarDetailsAvailable(roundData) {
  return roundData.every(
    (war) => war.state !== "notInWar" && war.state !== "preparation"
  );
}
function calculateClanRankAndRoundsWon(warDetails, ourClanTag) {
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
  let ourClanRank = sortedClans.indexOf(ourClanTag) + 1;

  if (!clanScores[ourClanTag]) {
    return {
      rank: "N/A",
      roundsWon: "N/A",
    };
  }

  let ourRoundsWon = clanScores[ourClanTag].roundsWon;
  return {
    rank: ourClanRank,
    roundsWon: ourRoundsWon,
  };
}

async function calculateLeaderboard(
  warDetails,
  interaction,
  ourClanTag,
  logoPath,
  leagueGroupData,
  warLeagueName,
  chosenStyles,
  noBonus
) {
  //debug remove
  console.log("Entered calculateLeaderboard function");

  // in utilities.js, at the beginning of calculateLeaderboard
  console.log(
    "Value of leagueGroupData right after receiving in calculateLeaderboard:",
    leagueGroupData
  );
  console.log(
    "Type of leagueGroupData right after receiving in calculateLeaderboard:",
    typeof leagueGroupData
  );

  // At the start of calculateLeaderboard in utilities.js
  if (!leagueGroupData || !leagueGroupData.clans) {
    throw new Error("leagueGroupData or leagueGroupData.clans is undefined");
  }

  //console.log('Full leagueGroupData:', JSON.stringify(leagueGroupData, null, 2));  // Debugging line

  // Prepend the hashtag to the clan tag for proper matching
  const formattedClanTag = `#${ourClanTag}`;

  const channel = interaction.channel;
  // Added a log to debug the type and value of leagueGroupData.clans
  console.log("Type of leagueGroupData.clans:", typeof leagueGroupData.clans);

  // Find the clan by its tag
  const ourClan = leagueGroupData.clans.find(
    (clan) => clan.tag === formattedClanTag
  );

  // testing defining our clan members
  const ourClanMembers = ourClan.members;

  console.log(`Clan tag used for searching: ${formattedClanTag}`);
  console.log("League Group Data:", leagueGroupData.season);

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
      console.log(`Processing round ${roundIndex + 1}, war ${warIndex + 1}`);

      // start test

      if (
        !war ||
        war.state === "notInWar" ||
        war.state === "preparation" ||
        war.teamSize === 0
      ) {
        console.log(
          `Skipping round ${roundIndex + 1}, war ${
            warIndex + 1
          } due to incomplete data.`
        );
        return; // Continue to the next iteration
      }

      console.log(`Processing round ${roundIndex + 1}, war ${warIndex + 1}`);

      // end test

      // Debug
      console.log(`war.clan.tag: ${war.clan.tag}, ourClanTag: #${ourClanTag}`);

      // Determine if our clan is participating as attacker or defender
      const isAttacker = war.clan.tag === `#${ourClanTag}`;
      const isDefender = war.opponent && war.opponent.tag === `#${ourClanTag}`;

      if (isAttacker || isDefender) {
        console.log("Our clan is participating in this war.");

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
          //console.log(`Processing member: ${member.name}`);
          //console.log(`Initial offensive stars: ${playerData[playerTag].offensive_score}`);
          //console.log(`Initial defensive stars: ${playerData[playerTag].defensive_score}`);
          //console.log(`Initial bonus/penalty: ${playerData[playerTag].bonus_penalty}`);
          // Check to see if the player is a member of our clan
          if (
            !ourClanMembers.some((ourMember) => ourMember.tag === playerTag)
          ) {
            //console.log(`Skipping ${playerName} as they are not in our clan`);
            return;
          }

          // Initialize player data if not present
          if (!playerData[playerTag]) {
            console.log(`Initializing player data for ${playerName}`);
            playerData[playerTag] = {
              name: playerName,
              offensive_score: 0,
              defensive_score: 0,
              bonus_penalty: 0,
              attacks: [],
            };
          }

          // Calculate net offensive score
          //console.log(`Calculating offensive stars for ${playerName}`);
          const offensiveStars = member.attacks
            ? member.attacks.reduce(
                (acc, attack) => acc + (attack.stars || 0),
                0
              )
            : 0;
          playerData[playerTag].offensive_score += offensiveStars;
          //console.log(`Offensive stars calculated for ${playerName}: ${offensiveStars}`);

          // Calculate defensive stars
          //console.log(`Calculating defensive stars for ${playerName}`);
          const defensiveStars = member.bestOpponentAttack
            ? member.bestOpponentAttack.stars
            : 2; // Assume 2 stars if not attacked
          playerData[playerTag].defensive_score += defensiveStars;
          // console.log(`Defensive stars calculated for ${playerName}: ${defensiveStars}`);

          // Calculate bonus or penalty
          //console.log(`Calculating bonus/penalty for ${playerName}`);
          if (member.attacks && member.attacks.length > 0) {
            member.attacks.forEach((attack) => {
              const opponentTag = attack.defenderTag;

              // Retrieve the defender's townhall level from the mapping
              const opponentTownhallLevel = townhallMap[opponentTag];

              //console.log(`Player: ${playerData[playerTag].name}`);
              //console.log(`Townhall Level: ${townhallLevel}`);
              //console.log(`Opponent Tag: ${opponentTag}`);
              //console.log(`Opponent Townhall Level: ${opponentTownhallLevel}`);
              if (!noBonus) {
                if (townhallLevel !== opponentTownhallLevel) {
                  if (townhallLevel < opponentTownhallLevel) {
                    playerData[playerTag].bonus_penalty += 1;
                  } else if (townhallLevel > opponentTownhallLevel) {
                    playerData[playerTag].bonus_penalty -= 1;
                  }
                }
              }

              // Store each attack's stars in player data
              playerData[playerTag].attacks.push(attack.stars || 0);

              //console.log(`Bonus/penalty calculated for ${playerName}: ${playerData[playerTag].bonus_penalty}`);
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
    //console.log(`Player: ${player.name}`);
    //console.log(`Total Offensive Score: ${player.total_offensive_score}`);
    // console.log(`Total Defensive Score: ${player.total_defensive_score}`);
    //console.log(`Bonus/Penalty: ${player.bonus_penalty}`);
  });

  // Calculate the net stars for each player
  5;
  const playerStats = Object.values(playerData).map((player) => {
    const totalOffense = player.total_offensive_score;
    const totalDefensiveStars = player.total_defensive_score;
    const bonusPenalty = player.bonus_penalty;
    const netStars = totalOffense - totalDefensiveStars + bonusPenalty;
    return { name: player.name, netStars, netOffense: totalOffense };

    //debug
    //console.log(`After calculating net stars for ${player.name}: ${netStars}`);
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
  const results = calculateClanRankAndRoundsWon(warDetails, `#${ourClanTag}`);
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
    fs.writeFile('output.png', buffer, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
    });*/

  // Send the attachment
  channel
    .send({ files: [attachment] })
    .then(() => {
      console.log("Image sent successfully");
    })
    .catch((error) => {
      console.error("Error sending image:", error);
    });

  // Resolve the promise
  return Promise.resolve();
}

// Raids image generation
// Function to generate the image using Canvas and save it as a file
async function generateRaidscanvas(fields) {
  const canvas = createCanvas(1468, 968);
  const ctx = canvas.getContext("2d");

  const image = await loadImage(
    path.join(__dirname, "assets", "base-image", "raids.jpg")
  );
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  registerFont(path.join(__dirname, "assets", "font", "font.ttf"), {
    family: "Supercell Magic",
  });

  ctx.font = '300 40px "Supercell-Magic"';
  ctx.fillStyle = "white";
  ctx.shadowColor = "#29082b"; // Shadow color
  ctx.shadowBlur = 2; // Shadow blur radius
  ctx.shadowOffsetX = 3; // Shadow offset along the x-axis
  ctx.shadowOffsetY = 13; // Shadow offset along the y-axis

  const gapBetweenLines1 = 80;

  fields.forEach((field, index) => {
    const textWidth = ctx.measureText(field.value).width;
    const x = (canvas.width - textWidth) / 2; // Calculate x-coordinate for center alignment
    ctx.fillText(field.value, x, 440 + index * gapBetweenLines1);
  });

  // Save the canvas image as a file
  const imageBuffer = canvas.toBuffer("image/png"); // Save the image as a buffer
  fs.writeFileSync("canvasImage.png", imageBuffer); // Save the buffer as a file

  return "canvasImage.png"; // Return the file path
}

// Function to fetch capital raids data

async function fetchRaidsData() {
  const fields = [];

  for (const clan of REG_CLAN_INFO) {
    try {
      const response = await axios.get(
        `https://api.clashofclans.com/v1/clans/%23${clan.tag}/capitalraidseasons`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            ...headers,
          },
        }
      );

      const participants = response.data.items[0].members.length;

      fields.push({
        name: "\u200B",
        value: `${clan.name} - ${participants}/50`,
        inline: false,
      });
    } catch (error) {
      console.error("API request failed for clan", clan.name, ":", error);
      fields.push({
        name: clan.name,
        value: "Error fetching data",
        inline: false,
      });
    }
  }
  return fields;
}

// Fetch CWL Data
async function fetchCWLData(CLAN_TAG, client, clanName) {
  console.log(`Starting to fetch CWL data for ${clanName} (${CLAN_TAG})`);

  try {
    //console.log('Making API call to fetch league group data...');
    const leagueGroupResponse = await axios.get(
      `${BASE_URL}/clans/%23${CLAN_TAG}/currentwar/leaguegroup`,
      { headers }
    );
    //console.log('API call completed.');

    if (leagueGroupResponse.status === 200) {
      //console.log('Successfully fetched league group data.');

      const leagueGroupData = leagueGroupResponse.data;
      let allWarDetails = []; // Initialize an empty array for all war details

      // Determine the current season based on the year and month
      const date = new Date();
      const season = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const filename = generateFileName(clanName, season); // Use generateFileName function

      for (const [index, round] of leagueGroupData.rounds.entries()) {
        //console.log(`Processing round ${index + 1}`);
        let roundData = [];
        for (const warTag of round.warTags) {
          if (warTag) {
            const sanitizedWarTag = warTag.substring(1);
            //console.log(`Fetching data for warTag: ${sanitizedWarTag}`);
            const warDetailsResponse = await axios.get(
              `${BASE_URL}/clanwarleagues/wars/%23${sanitizedWarTag}`,
              { headers }
            );
            //console.log(`Response for warTag ${warTag}:`);
            roundData.push(warDetailsResponse.data);
            await sleep(100);
          }
        }
        allWarDetails.push(roundData);
      }

      // Construct the combined data object with leagueGroupData and warDetails
      const combinedData = {
        leagueGroupData: leagueGroupData,
        warDetails: allWarDetails,
      };

      // Filepath now includes the season
      //console.log(`cwlDirectory: ${cwlDirectory}, filename: ${filename}`);
      const filepath = path.join(cwlDirectory, filename); // Use the generated filename

      //console.log(`Writing data to ${filepath}`);
      //console.log(`Type of cwlDirectory: ${typeof cwlDirectory}`);
      //console.log(`Type of filename: ${typeof filename}`);
      //console.log(`Writing data to ${filepath}`);
      // Write the combined data to the file
      fs.writeFileSync(filepath, JSON.stringify(combinedData, null, 4));
      console.log(`Data saved to ${filepath}`);
      return { clanName, status: "Success" };
    } else {
      console.error(`Failed to fetch league group data.`);
      return { clanName, status: "Failed" };
    }
  } catch (error) {
    console.error(`Error fetching CWL data for ${clanName} :`, error.message);
    return { clanName, status: "No CWL data found" };
  }
}

// Function to track role changes (implemented into index)
function logRoleChange(client, interaction, action, role) {
  const logChannelId = "810507487685509130"; // member log channel
  const logChannel = client.channels.cache.get(logChannelId);
  if (!logChannel) {
    console.error("Log channel not found");
    return;
  }

  console.log(`Logging to channel: ${logChannelId}`); // Debug

  const embed = new EmbedBuilder()
    .setTitle("Role Change Log")
    .setColor("#0099ff")
    .addFields(
      {
        name: "User",
        value: `${interaction.user.username}#${interaction.user.discriminator} (<@${interaction.user.id}>)`,
        inline: true,
      },
      { name: "Action", value: action, inline: true },
      { name: "Role", value: role ? role.name : "Role not found", inline: true }
    )
    .setTimestamp();

  logChannel.send({ embeds: [embed] }).catch((error) => {
    console.error("Error sending message:", error);
  });
}

//Loops through all clan tag's for each property in CLAN_INFO and fetches their war league rank
//api response is warleague.name property
async function fetchClanLeagues() {
  let leagueClans = {};

  for (const clan of CLAN_INFO) {
    try {
      const urlWithClanTag = `${BASE_URL}/clans/%23${clan.tag}`;
      console.log(`Requesting URL: ${urlWithClanTag}`);
      const response = await axios.get(urlWithClanTag, { headers });

      const leagueName = response.data.warLeague.name;

      if (!leagueClans[leagueName]) {
        leagueClans[leagueName] = [];
      }
      leagueClans[leagueName].push({
        ...clan,
        leagueName: leagueName,
      });
    } catch (error) {
      console.error("Error fetching data for clan:", clan.name, error);
    }
  }

  return leagueClans;
}

// Loops through CLAN_INFO and fetches all member names and member tags to store into members.json
async function fetchClanMembers() {
  console.log("Starting to fetch clan members...");
  const members = [];

  for (const clan of CLAN_INFO) {
    const url = `${BASE_URL}/clans/%23${clan.tag}`;
    console.log(`Fetching data for clan: ${clan.name} (Tag: ${clan.tag})`);
    try {
      const response = await axios.get(url, { headers });
      console.log(`Successfully fetched data for clan: ${clan.name}`);
      response.data.memberList.forEach((member) => {
        members.push({ name: member.name, tag: member.tag });
      });
    } catch (error) {
      console.error(`Error fetching data for clan ${clan.name}:`, error);
    }
  }

  console.log("Writing fetched data to members.json...");
  fs.writeFileSync("members.json", JSON.stringify(members, null, 2));
  console.log("Successfully updated members.json with the latest data.");
}

async function getAutocompleteSuggestions(input) {
  const members = JSON.parse(
    fs.readFileSync(path.join(__dirname, "members.json"), "utf8")
  );
  input = input.toLowerCase();
  return members
    .filter(
      (member) =>
        member.name.toLowerCase().includes(input) ||
        member.tag.toLowerCase().includes(input)
    )
    .slice(0, 25)
    .map((member) => ({
      name: `${member.name} (${member.tag})`, // This should be a plain string
      value: member.tag, // This should also be a plain string
    }));
}

const findClanInfoByTag = (tag) => {
  const foundClan = CLAN_INFO.find((clan) => clan.tag === tag);
  if (foundClan) {
    const { name, loc } = foundClan;
    return { name, loc };
  } else {
    return { name: "Clan not found", loc: "" };
  }
};

async function logit(client, content) {
  //Send log into Psycho-bot log channel
  const logChannelId = "1170605529048031232";
  const logChannel = client.channels.cache.get(logChannelId);
  logChannel.send(content).catch((error) => {
    console.error("Error sending message:", error);
  });
}

async function raidmessage() {
  const filePath = await generateRaidscanvas(await fetchRaidsData());

  // Function to calculate the next Monday at 7 UTC
  function getNextMonday() {
    const now = new Date();
    const currentDay = now.getUTCDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const daysUntilMonday = (7 - currentDay + 1) % 7; // Calculate the days until the next Monday
    const nextMonday = new Date(now);
    nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
    nextMonday.setUTCHours(7, 0, 0, 0); // Set the time to 7:00:00 UTC
    return nextMonday;
  }

  // Calculate the next Monday at 7 UTC
  const nextMonday = getNextMonday();

  // Create a MessageAttachment with the initial image file
  const attachment = new AttachmentBuilder(filePath, {
    name: "canvasImage.png",
  });

  // Create embed
  const embed = new EmbedBuilder()
    .setColor("#92600d")
    .setImage("attachment://canvasImage.png")
    .setTimestamp(nextMonday)
    .setFooter({
      text: "#PsychoFamily",
      iconURL: "https://i.imgur.com/FSyJai0.png",
    });

  // Create button
  const refreshButton = new ButtonBuilder()
    .setCustomId("raidsrefresh")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("<:refresh:1164721984777756673>");

  const refreshrow = new ActionRowBuilder().addComponents(refreshButton);

  // Build message content
  const content = {
    embeds: [embed],
    components: [refreshrow],
    files: [attachment],
  };

  return content;
}

let requestQueue = [];
let processing = false;
function getThEmote(thLevel) {
  // Default to an empty string or any default emote if TH level is not in the object
  return TH_EMOTES[thLevel] || "";
}
async function processQueue() {
  if (requestQueue.length > 0 && !processing) {
    processing = true;
    // Take up to 30 requests from the queue
    const requestsToProcess = requestQueue.splice(0, 30);

    // Process each request sequentially
    for (const func of requestsToProcess) {
      await func();
    }

    processing = false;
    if (requestQueue.length > 0) {
      // Wait one second before processing the next batch
      setTimeout(processQueue, 1000);
    }
  }
}

function addToQueue(func) {
  requestQueue.push(func);
  if (!processing) {
    processQueue();
  }
}

 const todolist = async (interaction) => {

    await interaction.deferReply({ ephemeral: true });

    let user = interaction.user;

    const playerTagsResponse = await axios.post(
      discord links DB,
      [user.id.toString()]
    );
    const playerTags = Object.keys(playerTagsResponse.data).filter(
      (tag) => tag !== user.id.toString()
    );
    let attackDetails = [];

    for (const clan of CLAN_INFO) {
      addToQueue(async () => {
        const cwlLeagueGroupUrl = `${BASE_URL}/clans/%23${clan.tag}/currentwar/leaguegroup`;
        const regularWarUrl = `${BASE_URL}/clans/%23${clan.tag}/currentwar`;

        // Check CWL attacks
        try {
          const cwlLeagueGroupResponse = await axios.get(cwlLeagueGroupUrl, {
            headers: { Authorization: `Bearer ${API_KEY}` },
          });
          const cwlRounds = cwlLeagueGroupResponse.data.rounds;
          for (const round of cwlRounds) {
            for (const warTag of round.warTags) {
              if (warTag !== "#0") {
                const warUrl = `${BASE_URL}/clanwarleagues/wars/%23${warTag.substring(
                  1
                )}`;
                try {
                  const warResponse = await axios.get(warUrl, {
                    headers: { Authorization: `Bearer ${API_KEY}` },
                  });
                  if (
                    warResponse.data.state === "inWar" &&
                    (warResponse.data.clan.tag === `#${clan.tag}` ||
                      warResponse.data.opponent.tag === `#${clan.tag}`)
                  ) {
                    const endTime = warResponse.data.endTime;
                    const formattedEndTime = endTime.replace(
                      /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
                      "$1-$2-$3T$4:$5:$6"
                    );
                    const endTimeStamp = Math.floor(
                      new Date(formattedEndTime).getTime() / 1000
                    );
                    for (const playerTag of playerTags) {
                      const playerInWar =
                        warResponse.data.clan.members.find(
                          (member) => member.tag === playerTag
                        ) ||
                        warResponse.data.opponent.members.find(
                          (member) => member.tag === playerTag
                        );

                      if (playerInWar && !playerInWar.attacks) {
                        console.log(`CWL - ${playerInWar}`);
                        /*const playerUrl = `${BASE_URL}/players/${encodeURIComponent(
                          playerTag
                        )}`;
                        const playerResponse = await axios.get(playerUrl, {
                          headers: { Authorization: `Bearer ${API_KEY}` },
                        });
                        //const playerName = playerResponse.data.name;*/
                        attackDetails.push(
                          {
                            account: playerInWar.name,
                            th: playerInWar.townhallLevel,
                            clan: clan.name,
                            attacks: "(0/1)",
                            endTime: endTimeStamp,
                            type: "<:cwlmedal:1029507629275435068>",
                          }
                          //`${playerName} (0/1)\n${clan.name} - <t:${endTimeStamp}:R>\n`
                        );
                      }
                    }
                  }
                } catch (error) {
                  //console.error(`Error fetching CWL war details for ${warTag}:`, error);
                }
              }
            }
          }
        } catch (error) {
          //console.error(`Error fetching CWL league group details for ${clan.tag}:`, error);
        }

        // Check regular war attacks
        try {
          const regularWarResponse = await axios.get(regularWarUrl, {
            headers: { Authorization: `Bearer ${API_KEY}` },
          });
          if (
            regularWarResponse.data.state === "preparation" ||
            regularWarResponse.data.state === "inWar"
          ) {
            const endTime = regularWarResponse.data.endTime;
            const formattedEndTime = endTime.replace(
              /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
              "$1-$2-$3T$4:$5:$6"
            );
            const endTimeStamp = Math.floor(
              new Date(formattedEndTime).getTime() / 1000
            );
            for (const playerTag of playerTags) {
              const playerInWar =
                regularWarResponse.data.clan.members.find(
                  (member) => member.tag === playerTag
                ) ||
                regularWarResponse.data.opponent.members.find(
                  (member) => member.tag === playerTag
                );

              if (
                playerInWar &&
                (!playerInWar.attacks || playerInWar.attacks.length < 2)
              ) {
                console.log(`Reg - ${playerInWar}`);
                /*
                const playerUrl = `${BASE_URL}/players/${encodeURIComponent(
                  playerTag
                )}`;
                
                const playerResponse = await axios.get(playerUrl, {
                  headers: { Authorization: `Bearer ${API_KEY}` },
                });
                const playerName = playerResponse.data.name;*/
                const attacksLeft = `(${
                  playerInWar.attacks ? playerInWar.attacks.length : 0
                }/2)`;

                attackDetails.push(
                  {
                    account: playerInWar.name,
                    th: playerInWar.townhallLevel,
                    clan: clan.name,
                    attacks: attacksLeft,
                    endTime: endTimeStamp,
                    type: `<:War:1163773786034798592>`,
                  }
                  /* `${playerName} (${
                    playerInWar.attacks ? playerInWar.attacks.length : 0
                  }/2)\n${clan.name} - <t:${endTimeStamp}:R>\n`
                  */
                );
              }
            }
          }
        } catch (error) {
          //console.error(`Error fetching regular war details for ${clan.tag}:`, error);
        }
      });
    }

    const checkCompletion = setInterval(async () => {
      if (requestQueue.length === 0 && !processing) {
        clearInterval(checkCompletion);
        const embed = new EmbedBuilder()
          .setTitle(
            `Psycho To Do List for ${
              interaction.guild.members.cache.get(user.id).displayName
            }`
          )
          .setColor("#0099ff")
          .setFooter({
            text: "#PsychoFamily",
            iconURL: "https://i.imgur.com/FSyJai0.png",
          });

        // Collect attack details

        const aggregatedDetails = {};
        attackDetails.forEach((detail) => {
          if (!aggregatedDetails[detail.account]) {
            aggregatedDetails[detail.account] = {
              th: detail.th, // Assuming TH level is constant per account; adjust logic if this assumption is incorrect
              details: [],
            };
          }
          aggregatedDetails[detail.account].details.push(detail);
        });

        // If data is there
        if (attackDetails.length > 0) {
          Object.entries(aggregatedDetails).forEach(([account, data]) => {
            const thEmote = getThEmote(data.th);
            const detailValue = data.details
              .map(
                (detail) =>
                  `${detail.type} ${detail.clan} | ${detail.attacks} <t:${detail.endTime}:R>`
              )
              .join("\n");
            embed.addFields({
              name: `${thEmote} __${account}__`,
              value: detailValue,
            });
          });
        } else {
          embed.setDescription(
            "All accounts have completed their CWL and regular war attacks."
          );
        }
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      }
    }, 1000);
  };


module.exports = {
  reportErrorToChannel,
  getLogoPath,
  getAvailableSeasons,
  areWarDetailsAvailable,
  calculateClanRankAndRoundsWon,
  calculateLeaderboard,
  generateRaidscanvas,
  fetchRaidsData,
  fetchCWLData,
  cwlDirectory,
  logRoleChange,
  fetchClanLeagues,
  fetchClanMembers,
  connectToMongo,
  getAutocompleteSuggestions,
  findClanInfoByTag,
  logit,
  raidmessage,
  processQueue,
  addToQueue,
  todolist,
  
};
