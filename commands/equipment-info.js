const fs = require("fs");
const axios = require("axios");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { BASE_URL, headers, CLAN_INFO } = require("../shared.js");
const { Pagination } = require("pagination.djs");

module.exports = {
  name: "equipment-info",
  description: "Show equipment stats",
  async execute(interaction) {
    //Obtain player tag from command and make API request
    const playerTag = interaction.options
      .getString("player")
      .replace("#", "%23");
    const playerApiUrl = `${BASE_URL}/players/${playerTag}`;
    const playerResponse = await axios.get(playerApiUrl, { headers });
    const playerData = playerResponse.data;
    const equipment = playerData.heroEquipment;

    // Data about ores cost of equipments
    const equipmentCost = [
      {
        Level: "2",
        Shiny: "120",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "3",
        Shiny: "240",
        Glowy: "20",
        Starry: "0",
      },
      {
        Level: "4",
        Shiny: "400",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "5",
        Shiny: "600",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "6",
        Shiny: "840",
        Glowy: "100",
        Starry: "0",
      },
      {
        Level: "7",
        Shiny: "1120",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "8",
        Shiny: "1440",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "9",
        Shiny: "1800",
        Glowy: "200",
        Starry: "10",
      },
      {
        Level: "10",
        Shiny: "1900",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "11",
        Shiny: "2000",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "12",
        Shiny: "2100",
        Glowy: "400",
        Starry: "20",
      },
      {
        Level: "13",
        Shiny: "2200",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "14",
        Shiny: "2300",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "15",
        Shiny: "2400",
        Glowy: "600",
        Starry: "30",
      },
      {
        Level: "16",
        Shiny: "2500",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "17",
        Shiny: "2600",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "18",
        Shiny: "2700",
        Glowy: "600",
        Starry: "50",
      },
      {
        Level: "19",
        Shiny: "2800",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "20",
        Shiny: "2900",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "21",
        Shiny: "3000",
        Glowy: "600",
        Starry: "100",
      },
      {
        Level: "22",
        Shiny: "3100",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "23",
        Shiny: "3200",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "24",
        Shiny: "3300",
        Glowy: "600",
        Starry: "120",
      },
      {
        Level: "25",
        Shiny: "3400",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "26",
        Shiny: "3500",
        Glowy: "0",
        Starry: "0",
      },
      {
        Level: "27",
        Shiny: "3600",
        Glowy: "600",
        Starry: "150",
      },
    ];

    // Data about available hero equipment. If new equipment is added to game then make entry here
    const heroEquipmentMap = [
      {
        hero: "Barbarian King",
        emote: "<:BarbarianKing:1203010063032393798>",
        equipment: [
          {
            name: "Giant Gauntlet",
            emoji: "<:Giant_Gauntlet:1202991281132019712>",
          },
          {
            name: "Rage Vial",
            emoji: "<:Rage_Vial:1202991225720803398>",
          },
          {
            name: "Barbarian Puppet",
            emoji: "<:Barbarian_Puppet:1202990970753261628>",
          },
          {
            name: "Earthquake Boots",
            emoji: "<:Earthquake_Boots:1202991189599719424>",
          },
          {
            name: "Vampstache",
            emoji: "<:Vampstache:1202991236009562143>",
          },
        ],
      },
      {
        hero: "Archer Queen",
        emote: "<:warriorqueen:1203010260277665792>",
        equipment: [
          {
            name: "Archer Puppet",
            emoji: "<:Archer_Puppet:1202993431761133688>",
          },
          {
            name: "Invisibility Vial",
            emoji: "<:Invisibility_Vial:1202991212252893224>",
          },
          {
            name: "Giant Arrow",
            emoji: "<:Giant_Arrow:1202991197723820052>",
          },
          {
            name: "Healer Puppet",
            emoji: "<:Healer_Puppet:1202991200273961080>",
          },
          {
            name: "Frozen Arrow",
            emoji: "<:FrostArrow:1205065538523496468>",
          },
        ],
      },
      {
        hero: "Grand Warden",
        emote: "<:GrandWarden:1203010454818131999>",
        equipment: [
          {
            name: "Eternal Tome",
            emoji: "<:Eternal_Tome:1202991193961664512>",
          },
          {
            name: "Life Gem",
            emoji: "<:Life_Gem:1202991216606584862>",
          },
          {
            name: "Rage Gem",
            emoji: "<:Rage_Gem:1202991221392539658>",
          },
          {
            name: "Healing Tome",
            emoji: "<:Healing_Tome:1202991206418612325>",
          },
        ],
      },
      {
        hero: "Royal Champion",
        emote: "<:RoyalChampion:1203010524271480872>",
        equipment: [
          {
            name: "Seeking Shield",
            emoji: "<:Seeking_Shield:1202991232230363157>",
          },
          {
            name: "Royal Gem",
            emoji: "<:Royal_Gem:1202991229512454246>",
          },
          {
            name: "Haste Vial",
            emoji: "<:Haste_Vial:1211966410822123543>",
          },
          {
            name: "Hog Rider Puppet",
            emoji: "<:Hog_Rider_Puppet:1211966465511788575>",
          },
        ],
      },
    ];

    // Build embeds for each page
    const statembed = new EmbedBuilder()
      .setColor("#92600d")
      .setTitle(`${playerData.name} (${playerData.tag}) `)
      .setTimestamp()
      .setFooter({
        text: `#PsychoFamily`,
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    const costembed = new EmbedBuilder()
      .setColor("#92600d")
      .setTitle(`${playerData.name} (${playerData.tag}) `)
      .setTimestamp()
      .setFooter({
        text: `#PsychoFamily`,
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Data about currently equipped set
    const equipped = playerData.heroes;
    let equipdescription = "";

    // Loop through hero data from API and obatin equipped set information
    for (const heroEntry of equipped) {
      const { name, equipment } = heroEntry;

      // Find the corresponding entry in heroEquipmentMap
      const heroMapEntry = heroEquipmentMap.find((hero) => hero.hero === name);

      // Check if heroMapEntry is found
      if (heroMapEntry) {
        // Find the corresponding emote for hero
        const heroemote = heroMapEntry.emote;

        // Append hero's emote to the description
        equipdescription += `${heroemote}  `;

        for (let i = 0; i < equipment.length; i++) {
          const { name: equipmentName } = equipment[i];
          equipdescription += `${equipmentName}`;

          if (i === 0) {
            equipdescription += " | ";
          }
        }

        // Add a newline after processing equipment for a hero
        equipdescription += "\n";
      }
    }
    statembed.addFields({
      name: "Currently equipped Set",
      value: equipdescription,
    });

    // Initialize the sums for totalShiny, totalGlowy, and totalStarry. Ores required for all upgrades combined
    let totalShinySum = 0;
    let totalGlowySum = 0;
    let totalStarrySum = 0;

    // Loop through all available equipment of players and obtain upgrade data
    for (const heroData of heroEquipmentMap) {
      const heroEquipments = heroData.equipment;
      let heroStatSubDescription = "";
      let heroCostSubDescription = "";

      // Sort heroEquipments by equipment level
      heroEquipments.sort((equip1, equip2) => {
        const level1 =
          equipment.find((e) => e.name === equip1.name)?.level || 0;
        const level2 =
          equipment.find((e) => e.name === equip2.name)?.level || 0;
        return level2 - level1;
      });

      let totalShiny = 0,
        totalGlowy = 0,
        totalStarry = 0; // Move variable declarations here

      for (const equipmentData of heroEquipments) {
        const equip = equipment.find((e) => e.name === equipmentData.name);

        if (equip) {
          const { name, level, maxLevel } = equip;
          let costText = "";

          if (level === maxLevel) {
            // If equipment is maxed, only include in stat sub-description
            heroStatSubDescription += `${equipmentData.emoji} ${name} - **Maxed**\n`;
          } else {
            // Move totalStarry, totalGlowy, and totalShiny initialization here
            totalStarry = 0;
            totalGlowy = 0;
            totalShiny = 0;

            for (let i = level + 1; i <= maxLevel; i++) {
              const levelInfo = equipmentCost.find(
                (info) => info.Level === i.toString()
              );

              if (levelInfo) {
                // Check if current level requires Starry cost
                if (levelInfo.Starry && maxLevel === 27) {
                  totalStarry += parseInt(levelInfo.Starry);
                }
                // Use the actual number, not its string representation
                totalShiny += parseInt(levelInfo.Shiny);
                totalGlowy += parseInt(levelInfo.Glowy);
              }
            }

            costText = `<:shiny:1202986826642620466> ${totalShiny} | <:glowy:1202986822179758090> ${totalGlowy}`;
            if (maxLevel === 27) {
              costText += ` | <:starry:1202986830912290826> ${totalStarry}`;
            }

            // Append equipment information to the hero's sub-descriptions
            heroStatSubDescription += `${equipmentData.emoji} ${name} - ${level}/${maxLevel}\n`;
            heroCostSubDescription += `${equipmentData.emoji} ${name} - ${costText}\n`;

            // Move the costs accumulation here
            totalShinySum += totalShiny;
            totalGlowySum += totalGlowy;
            totalStarrySum += totalStarry;
          }
        }
      }

      // Check if the hero's sub-description is not empty before adding it to the main description
      if (heroStatSubDescription.trim() !== "") {
        statembed.addFields({
          name: `__${heroData.hero}__`,
          value: heroStatSubDescription,
        });
      }
      if (heroCostSubDescription.trim() !== "") {
        costembed.addFields({
          name: `__${heroData.hero}__`,
          value: heroCostSubDescription,
        });
      }
    }

    // Calculate Total ores
    costembed.setDescription(
      `**Total Ores required**\n<:shiny:1202986826642620466> Shiny - ${totalShinySum.toLocaleString()}\n<:glowy:1202986822179758090> Glowy - ${totalGlowySum.toLocaleString()}\n<:starry:1202986830912290826> Starry - ${totalStarrySum.toLocaleString()}`
    );

    // Create buttons for pagination
    const statsButton = new ButtonBuilder()
      .setCustomId(`statsButton`)
      .setLabel("Stats")
      .setStyle(ButtonStyle.Primary);

    const costButton = new ButtonBuilder()
      .setCustomId(`costButton`)
      .setLabel("Cost")
      .setStyle(ButtonStyle.Success);

    // Send embeds with pagination
    const pagination = new Pagination(interaction);
    pagination.setEmbeds([statembed, costembed]);
    pagination.buttons = { prev: statsButton, next: costButton };
    pagination.setEmojis({
      prevEmoji: "1080103062812770375",
      nextEmoji: "1202975242679750726",
    });
    pagination.render();
  },
};
