const fs = require("fs");
const axios = require("axios");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { BASE_URL, headers, CLAN_INFO } = require("../shared.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");
// Function to create the rank image
async function rankcard(playerData, rankingData, legendsData, familyRank) {
  // Register the custom font
  const fontPath1 = "./assets/font/Superion.otf";
  const fontPath2 = "./assets/font/mikoena-demo.otf";
  const fontPath3 = "./assets/font/MouldyCheeseRegular.ttf";
  const fontPath4 = "./assets/font/noto.ttf";

  registerFont(fontPath1, { family: "Superion Regular" });
  registerFont(fontPath2, { family: "Mikoena Demo Regular" });
  registerFont(fontPath3, { family: "Mouldy Cheese Regular" });
  registerFont(fontPath4, { family: "Noto Sans" });

  // Create a canvas
  const canvas = createCanvas(1024, 658);
  const ctx = canvas.getContext("2d");

  // Load background image
  const image = await loadImage("./assets/base-image/rank.png");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Fetch logo image
  // Function to find clan.loc based on clan.name
  function findlogopath(clanName) {
    const logopath = CLAN_INFO.find((clan) => clan.name === clanName);
    return logopath ? logopath.loc : "./assets/logo/PF.png";
  }

  const logopath = findlogopath(playerData.clan.name);
  const logoimage = await loadImage(logopath);
  // Draw clan logo image
  ctx.drawImage(logoimage, 732, 55, 191, 189);

  // Fetch TH icon
  const thpath = `./assets/th/${playerData.townHallLevel}.png`;
  const thimage = await loadImage(thpath);
  // Draw TH icon
  const thWidth = 110; // Adjust the width of the logo as needed
  const thHeight = (thWidth / thimage.width) * thimage.height;
  ctx.drawImage(thimage, 773, 298, thWidth, thHeight);

  //Write name and trophies
  ctx.font = "65px Superion";
  ctx.fillStyle = "#471345";
  ctx.textAlign = "center";
  ctx.fillText(playerData.name, 390, 120);
  ctx.fillText(playerData.trophies, 390, 245);

  // Write tag
  ctx.font = '35px "Mikoena Demo"';
  ctx.fillStyle = "#e998e6";
  ctx.textAlign = "center";
  ctx.fillText(playerData.tag, 827, 440);

  // Write best season stats
  ctx.font = "38px Mouldy Cheese";
  ctx.fillStyle = "#380b36";
  ctx.textAlign = "center";
  ctx.fillText(
    `Trophies: ${playerData.legendStatistics.bestSeason.trophies}`,
    827,
    560
  );
  ctx.fillText(
    `Rank: ${playerData.legendStatistics.bestSeason.rank}`,
    827,
    605
  );

  // Write Global rank
  ctx.font = "60px Mouldy Cheese";
  ctx.fillStyle = "#2b0b21";
  ctx.textAlign = "center";
  if (rankingData && rankingData.rank !== undefined) {
    ctx.fillText(`Global Rank: ${rankingData.rank}`, 350, 450);
  } else {
    ctx.fillText("Global Rank: N/A", 350, 450);
  }

  //Handle no value for local rank
  const localRank =
    legendsData.rankings.local_rank !== null &&
    legendsData.rankings.local_rank !== undefined
      ? legendsData.rankings.local_rank
      : "N/A";
  ctx.fillText(`Local Rank: ${localRank}`, 350, 520);
  ctx.fillText(`Family Rank: ${familyRank}`, 350, 590);

  // SEND IMAGE TO DISCORD
  const buffer = canvas.toBuffer();
  fs.writeFileSync("rank.png", buffer); // Save the buffer as a file
  return "rank.png"; // Return the file path
}

// Function to calculate family ranking
async function familyrank(formattedtag) {
  try {
    const allMembers = [];
    for (const clan of CLAN_INFO) {
      const url = `${BASE_URL}/clans/%23${clan.tag}`;
      try {
        const response = await axios.get(url, { headers });
        //console.log(`Successfully fetched data for clan: ${clan.name}`);
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

    // Order list by trophies
    allMembers.sort((a, b) => b.trophies - a.trophies);
    // Find rank of playerTag in the sorted array

    const playerIndex = allMembers.findIndex(
      (member) => member.tag === formattedtag
    );
    const familyranking = playerIndex !== -1 ? playerIndex + 1 : "N/A";

    //console.log(`Player ${formattedtag} has a rank of ${familyranking}`);

    return familyranking;
  } catch (error) {
    console.error("Error:", error);
  }
}

//Sleep
async function sleep(ms) {
  //console.log(`Sleeping for ${ms} milliseconds...`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  name: "my-rank",
  description: "Display rank card",

  async execute(interaction) {
    const playerTag = interaction.options
      .getString("player")
      .replace("#", "%23");
    console.log(`Executing rank command for player tag: ${playerTag}`);

    //Obtain name, trophies, th, tag, best season trophies and rank
    const playerApiUrl = `${BASE_URL}/players/${playerTag}`;
    const playerResponse = await axios.get(playerApiUrl, { headers });
    const playerData = playerResponse.data;
    console.log(`Player clan data retrieved for ${playerTag}`);

    // Check if player is in Legends League
    if (playerData.trophies <= 4900) {
      await interaction.reply({
        content: `${playerData.name} is not in Legend League. Currently has ${playerData.trophies} trophies.`,
        ephemeral: true,
      });
      return; // Exit the command if player is not in Legends League
    }

    await interaction.deferReply("Calculating Rank");

    // Obtain Global rank from CK API
    const rankingApiUrl = `https://api.clashking.xyz/ranking/legends/${playerTag}`;
    const rankingResponse = await axios.get(rankingApiUrl);
    const rankingData = rankingResponse.data;
    console.log(`Global rank data retrieved for ${playerTag}`);

    // Obtain local rank from CK API
    const legendsApiUrl = `https://api.clashking.xyz/player/${playerTag}/legends`;
    const legendsResponse = await axios.get(legendsApiUrl);
    const legendsData = legendsResponse.data;
    console.log(`Local rank data retrieved for ${playerTag}`);

    // Obtain family rank
    const formattedtag = playerData.tag;
    const familyranking = await familyrank(formattedtag);

    const filePath = await rankcard(
      playerData,
      rankingData,
      legendsData,
      familyranking
    );
    const attachment = new AttachmentBuilder(filePath, "rank.png");

    // Create embed
    const embed = new EmbedBuilder()
      .setColor("#92600d")
      .setImage("attachment://rank.png")
      .setTimestamp()
      .setFooter({
        text: `${playerData.name} - ${playerData.trophies}`,
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  },
};
