const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
const {
  BASE_URL,
  headers,
  API_KEY,
  generateFileName,
  CLAN_INFO,
} = require("../shared.js");

const textchannelIDs = [
  "768345886543577118",
  "801808520625782815",
  "801808577178238980",
  "801808599168974898",
  "801808621850722304",
  "801808657095852052",
  "801808679753089034",
  "801808700888055825",
  "801808723995263007",
  "801808744928247839",
  "801808766805737522",
  "801808790042443856",
  "801808811814944810",
  "801808831960186881",
  "801808854815735820",
];
const voicechannelIDs = ["810026263163043841", "810026326718152765"];

async function champsCheck(clanTag) {
  const url = `${BASE_URL}/clans/%23${clanTag}`;
  const clanResponse = await axios.get(url, { headers });
  const clanData = clanResponse.data;
  const league = clanData.warLeague.name;

  if (
    league === "Champion League I" ||
    league === "Champion League II" ||
    league === "Champion League III"
  ) {
    return true;
  } else {
    return false;
  }
}

async function processChampsClan(interaction, client) {
  const filteredClans = CLAN_INFO.filter(
    (clan) => clan.abb !== "pe" && clan.abb !== "pm"
  );

  for (const clan of filteredClans) {
    const { name, tag, cwlrole } = clan;
    const allResponses = [];
    // Check if Clan is in Champs
    const champscheck = await champsCheck(tag);

    if (champscheck) {
      console.log(`Champs check passed for clan ${name}. Updating channels...`);
      const responses = await updateChannels(
        interaction,
        client,
        textchannelIDs,
        cwlrole
      );
      allResponses.push(responses);

      const embed = new EmbedBuilder()
        .setTitle(`${name} updated`)
        .setDescription(allResponses.flat().join("\n"))
        .setColor(clan.hex)
        .setThumbnail(clan.alogo)
        .setFooter({
          text: "#PsychoFamily",
          iconURL: "https://i.imgur.com/FSyJai0.png",
        })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
    } else {
      console.log(
        `Champs check failed for clan ${name}. Skipping channel update.`
      );
      const responses = await removeChannels(
        interaction,
        client,
        textchannelIDs,
        cwlrole
      );
      allResponses.push(responses);

      const embed = new EmbedBuilder()
        .setTitle(`${name} Removed`)
        .setDescription(allResponses.flat().join("\n"))
        .setColor(clan.hex)
        .setThumbnail(clan.alogo)
        .setFooter({
          text: "#PsychoFamily",
          iconURL: "https://i.imgur.com/FSyJai0.png",
        })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
    }
  }
}

async function updateChannels(interaction, client, channelIDs, cwlrole) {
  const responses = [];

  async function roleadd(interaction, client, channelID, cwlrole) {
    const channel = await interaction.guild.channels.fetch(channelID);
    const role = await interaction.guild.roles.cache.get(cwlrole);
    const responses = [];

    if (role) {
      const existingPermissions = channel.permissionsFor(cwlrole);

      // Check if the required permissions are already set
      if (existingPermissions) {
        const requiredPermissions = {
          ViewChannel: true,
          SendMessages: true,
          SendMessagesInThreads: true,
          EmbedLinks: true,
          AttachFiles: true,
          AddReactions: true,
          UseExternalEmojis: true,
          UseExternalStickers: true,
          ReadMessageHistory: true,
          SendTTSMessages: true,
          UseApplicationCommands: true,
          AttachFiles: true,
        };

        const updatedPermissions = {};

        // Check each required permission and update only if necessary
        Object.keys(requiredPermissions).forEach((permission) => {
          const hasRequiredPermission = existingPermissions.has(permission);
          if (hasRequiredPermission !== requiredPermissions[permission]) {
            updatedPermissions[permission] = requiredPermissions[permission];
          }
        });

        if (Object.keys(updatedPermissions).length === 0) {
          responses.push(
            `- Already has the required permissions in <#${channelID}>`
          );
        } else {
          await channel.permissionOverwrites.edit(role, updatedPermissions);
          responses.push(
            `- Updated in <#${channelID}> with the required permissions`
          );
        }
      } else {
        // If no existing permissions, set all required permissions
        await channel.permissionOverwrites.edit(role, requiredPermissions);
        responses.push(
          `- Added to <#${channelID}> with the required permissions`
        );
      }
    } else {
      responses.push(`Error: Role '${cwlrole}' not found in guild.`);
    }

    console.log(`Permissions updated for ${cwlrole} role`);
    return responses.join("\n");
  }

  for (const channelID of channelIDs) {
    const response = await roleadd(interaction, client, channelID, cwlrole);
    responses.push(response);
  }

  return responses;
}

async function removeChannels(interaction, client, channelIDs, cwlrole) {
  const responses = [];

  async function roleremove(interaction, client, channelID, cwlrole) {
    const channel = await interaction.guild.channels.fetch(channelID);
    const role = await interaction.guild.roles.cache.get(cwlrole);
    const responses = [];

    if (role) {
      const existingPermissions = channel.permissionsFor(cwlrole);

      // Check if the role has permissions set
      if (existingPermissions.length > 1) {
        // Delete the permission overwrite for the specified role
        await channel.permissionOverwrites.delete(role);
        responses.push(`- Removed from <#${channelID}>`);
      } else {
        responses.push(`- No permissions set in <#${channelID}>`);
      }
    } else {
      responses.push(`Error: Role '${cwlrole}' not found in guild.`);
    }

    console.log(`Role removed from ${cwlrole} in ${channelID} channel`);

    return responses.join("\n");
  }

  for (const channelID of channelIDs) {
    const response = await roleremove(interaction, client, channelID, cwlrole);
    responses.push(response);
  }

  return responses;
}

module.exports = {
  name: "champs-role-update",
  description: "Update champs channel role for clan",
  async execute(interaction, client) {
    await interaction.deferReply();
    await processChampsClan(interaction, client);
    await interaction.editReply("Channel perms updated");
  },
};
