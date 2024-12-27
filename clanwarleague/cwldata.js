const fs = require("fs");
const { MongoClient } = require("mongodb");
const { CLAN_INFO } = require("./shared.js");

// Get a list of all JSON files in the folder
const folderPath = "../cwl-db"; // Change this to the actual path
const fileNames = fs
  .readdirSync(folderPath)
  .filter((file) => file.endsWith(".json"));

// Connect to Mongo
const url =
const dbName = "PsychoBot";
const mongoClient = new MongoClient(url);

async function run() {
  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");

    // Loop over each JSON file
    for (const fileName of fileNames) {
      console.log(`Found file - ${folderPath}/${fileName}`);
      const filePath = `${folderPath}/${fileName}`;
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Loop over each clan tag in CLAN_INFO
      for (const clan of CLAN_INFO) {
        const clantag = `#${clan.tag}`;
        if (jsonData.leagueGroupData.clans.some((c) => c.tag === clantag)) {
          console.log(
            `Clan with tag ${clan.name} - ${clantag} found in ${fileName}`
          );
          await processClan(jsonData, clantag);
        } else {
          continue;
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoClient.close();
    console.log("MongoDB connection closed.");
  }
}
run();

//const filePath = '../cwl-db/FlareonsOfFire_2023-09.json'
//const clantag = '#QL8YGGLC'
//const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
//processClan(jsonData, clantag)

async function processClan(jsonData, clantag) {
  const leaguedata = jsonData.leagueGroupData;
  const warData = jsonData.warDetails;
  const ourclan = leaguedata.clans.find((clan) => clan.tag === clantag);

  const cwlstatus = leaguedata.state;
  const season = leaguedata.season;
  const cwlsize = jsonData.warDetails[0].teamSize;

  try {
    const roundsData = [];
    const playersData = [];

    // Initialize playersData based on ourclan members
    ourclan.members.forEach((member) => {
      const playerKey = member.tag;
      playersData[playerKey] = {
        name: member.name,
        tag: member.tag,
        TH: member.townHallLevel,
        rounds: [],
      };
    });

    for (let roundNumber = 0; roundNumber < warData.length; roundNumber++) {
      const round = warData[roundNumber];

      if (
        round.every(
          (warDetails) =>
            warDetails.state === "warEnded" ||
            warDetails.state === "preparation"
        )
      ) {
        for (const warDetails of round) {
          const roundData = {
            members: [],
          };

          // Check if clan is under attacker
          if (warDetails.clan.tag === clantag) {
            roundData.members = warDetails.clan.members;
          } else if (warDetails.opponent.tag === clantag) {
            // Check if clan is under opponent
            roundData.members = warDetails.opponent.members;
          } else {
            // If neither clan nor opponent matches the specified clantag, skip to the next iteration
            continue;
          }

          for (const member of roundData.members) {
            const playerKey = member.tag;

            // Check if playerKey exists in playersData
            if (playersData[playerKey]) {
              const enemydefenderTag =
                (member.attacks && member.attacks[0]?.defenderTag) || null; //Opponent is defending
              const enemyattackerTag =
                (member.bestOpponentAttack &&
                  member.bestOpponentAttack?.attackerTag) ||
                null; //Opponent is attacking

              const offenseTH = enemyattackerTag
                ? findTownHallLevel(leaguedata, enemyattackerTag)
                : null;
              const defenseTH = enemydefenderTag
                ? findTownHallLevel(leaguedata, enemydefenderTag)
                : null;

              const attackDetails = {
                position: member.mapPosition,
                attackorder:
                  (member.attacks && member.attacks[0]?.order) || null,
                stars: (member.attacks && member.attacks[0]?.stars) || null,
                percentage:
                  (member.attacks &&
                    member.attacks[0]?.destructionPercentage) ||
                  null,
                duration:
                  (member.attacks && member.attacks[0]?.duration) || null,
                offenseTH: member.townhallLevel,
                defenseTH: defenseTH,
              };

              const defenseDetails = {
                attackorder:
                  (member.bestOpponentAttack &&
                    member.bestOpponentAttack?.order) ||
                  null,
                stars:
                  (member.bestOpponentAttack &&
                    member.bestOpponentAttack?.stars) ||
                  null,
                percentage:
                  (member.bestOpponentAttack &&
                    member.bestOpponentAttack?.destructionPercentage) ||
                  null,
                duration:
                  (member.bestOpponentAttack &&
                    member.bestOpponentAttack?.duration) ||
                  null,
                offenseTH: offenseTH,
                defenseTH: member.townhallLevel,
              };

              playersData[playerKey].rounds.push({
                round: roundNumber + 1,
                attackDetails: attackDetails,
                defenseDetails: defenseDetails,
              });
            }
          }
          roundsData.push(roundData);
        }
      } else {
        `War has not ended for ${roundNumber} of ${clantag}`;
      }
    }

    //Obtains league info
    const roundsPlayedCount = countRoundsPlayed(roundsData);
    const sanitizedclantag = clantag.substring(1);
    const startLeague = await findcwlleague(season, sanitizedclantag);
    const jsonDataOutput = {
      clan: ourclan.name,
      clan_tag: clantag,
      season: season,
      league: startLeague,
      CWLsize: cwlsize,
      CWLstatus: cwlstatus,
      clanRank: calculateClanRankAndRoundsWon(warData, clantag).rank,
      players: Object.values(playersData).map((player) => ({
        name: player.name,
        tag: player.tag,
        TH: player.TH,
        roundsPlayed: roundsPlayedCount[player.tag],
        rounds: player.rounds,
      })),
    };

    const filename = `mod-${ourclan.name}-${season}.json`;

    fs.writeFileSync(filename, JSON.stringify(jsonDataOutput, null, 2));
    console.log(`Data written to ${filename}`);
  } catch (error) {
    console.error(error);
  }
}

function findTownHallLevel(leaguedata, tag) {
  const data = leaguedata.clans;
  for (const clan of data) {
    const member = clan.members.find((member) => member.tag === tag);
    if (member) {
      return member.townHallLevel;
    }
  }
  return null;
}

function countRoundsPlayed(roundsData) {
  const tagsCount = {};
  for (const roundData of roundsData) {
    const uniqueMembers = new Set(
      roundData.members.map((member) => member.tag)
    );
    for (const memberTag of uniqueMembers) {
      if (!tagsCount[memberTag]) {
        tagsCount[memberTag] = 0;
      }
      tagsCount[memberTag]++;
    }
  }
  return tagsCount;
}

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

async function findcwlleague(season, clantag) {
  const db = mongoClient.db(dbName);
  const collection = db.collection("cwlsummary");

  try {
    const seasonDocument = await collection.findOne({
      [season]: { $exists: true },
    });

    if (seasonDocument) {
      const clanEntry = seasonDocument[season].find(
        (entry) => entry.tag === clantag
      );

      if (clanEntry) {
        console.log(`${clanEntry.leagueStart}`);
        return clanEntry.leagueStart;
      } else {
        return `Clan with tag ${clantag} not found in season ${season}`;
      }
    } else {
      console.log(`Season ${season} not found in cwlsummary collection`);
      return `Season ${season} not found in cwlsummary collection`;
    }
  } catch (error) {
    console.error("Error finding CWL league:", error);
    return "Error finding CWL league";
  }
}
