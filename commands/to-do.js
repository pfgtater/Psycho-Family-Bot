const { EmbedBuilder } = require("discord.js");
const { API_KEY, BASE_URL, CLAN_INFO, headers, TH_EMOTES } = require("../shared.js");
const axios = require("axios");

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

module.exports = {
  name: "to-do",
  description:
    "Check if user-associated players have completed their CWL & War attacks",
  async execute(interaction) {

    await interaction.deferReply();

    let user = interaction.options.getUser("user") || interaction.user;

    const playerTagsResponse = await axios.post(
      discord links db
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
        await interaction.followUp({ embeds: [embed] });
      }
    }, 1000);
  },
};
