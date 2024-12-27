const { reportErrorToChannel, logRoleChange } = require("../utilities.js");
const clanlinkembed = require("../embeds/clanlink.js");
const { CLAN_INFO } = require("../shared.js");
const { logit } = require("../utilities.js");
const { agenda } = require("../tasks/agenda-schedular");
const { ObjectId } = require("mongodb");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const {
  uniqueUsers,
  tzRoles,
  roleOptionsMap,
  familyRoleOptionsMap,
  selfPlayerOptionsMap,
} = require("../shared.js");

module.exports = async (interaction, client) => {
  if (!interaction.isStringSelectMenu()) return;

  try {
    await interaction.deferReply({ ephemeral: true });

    switch (interaction.customId) {
      case "cwl_roles":
        await handleCwlRoles(interaction, client);
        break;

      case "family_roles":
        await handleFamilyRoles(interaction, client);
        break;

      case "strat":
        await handleStratRoles(interaction, client);
        break;

      case "tz_roles":
        await handleTzRoles(interaction, client);
        break;

      case "raids_clan_link":
        let selectedValue = interaction.values[0];
        clanlinkembed.execute(interaction, client, selectedValue);
        break;

      case "cwl_base_clan":
        let clanabb = interaction.values[0];
        await cwlbaseclan(interaction, client, clanabb);
        break;

      case "delete_task":
        let taskid = interaction.values[0];
        await deleteJobById(interaction, taskid);
        break;
    }
  } catch (error) {
    console.error("Error in select menu handler:", error);
    await reportErrorToChannel(error, interaction.user, interaction, client);
  }
};

async function handleCwlRoles(interaction, client) {
  const addedRoles = [];
  for (const value of interaction.values) {
    if (roleOptionsMap[value]) {
      try {
        await interaction.member.roles.add(value);
        console.log(
          `Successfully added role ${roleOptionsMap[value]} with ID: ${value}`
        );
        addedRoles.push(`<@&${value}>`);
        logRoleChange(client, interaction, "Assigned", {
          id: value,
          name: roleOptionsMap[value],
        });
      } catch (error) {
        console.error(
          `Failed to add role ${roleOptionsMap[value]} with ID: ${value}, Error: ${error}`
        );
      }
    } else {
      console.warn(`Unrecognized role ID: ${value}`);
    }
  }
  const replyMessage =
    addedRoles.length > 0
      ? `CWL roles ${addedRoles.join(", ")} have been assigned!`
      : "CWL roles have been assigned!";
  await interaction.editReply(replyMessage);
}

async function handleFamilyRoles(interaction, client) {
  const addedRoles = [];
  if (interaction.values.includes("del")) {
    for (const roleId of Object.values(familyRoleOptionsMap)) {
      try {
        await interaction.member.roles.remove(roleId);
        const role = interaction.guild.roles.cache.get(roleId);
        logRoleChange(client, interaction, "Removed", role);
      } catch (error) {
        console.error(
          `Failed to remove the role with ID: ${roleId}, Error: ${error}`
        );
      }
    }
    await interaction.editReply({ content: `Roles cleared!`, ephemeral: true });
  } else {
    for (const value of interaction.values) {
      if (familyRoleOptionsMap[value]) {
        try {
          await interaction.member.roles.add(familyRoleOptionsMap[value]);
          addedRoles.push(`<@&${familyRoleOptionsMap[value]}>`);
          const role = interaction.guild.roles.cache.get(
            familyRoleOptionsMap[value]
          );
          logRoleChange(client, interaction, "Assigned", role);
        } catch (error) {
          console.error(
            `Failed to add role ${familyRoleOptionsMap[value]} with ID: ${value}, Error: ${error}`
          );
        }
      }
    }
    const replyMessage =
      addedRoles.length > 0
        ? `Family roles ${addedRoles.join(", ")} have been assigned!`
        : "Family roles have been assigned!";
    await interaction.editReply(replyMessage);
  }
}

async function handleStratRoles(interaction, client) {
  const addedRoles = [];
  if (interaction.values.includes("del")) {
    for (const roleId of Object.values(selfPlayerOptionsMap)) {
      try {
        await interaction.member.roles.remove(roleId);
        const role = interaction.guild.roles.cache.get(roleId);
        logRoleChange(client, interaction, "Removed", role);
      } catch (error) {
        console.error(
          `Failed to remove the role with ID: ${roleId}, Error: ${error}`
        );
      }
    }
    await interaction.editReply("Roles cleared");
  } else {
    for (const value of interaction.values) {
      if (selfPlayerOptionsMap[value]) {
        try {
          await interaction.member.roles.add(selfPlayerOptionsMap[value]);
          addedRoles.push(`<@&${selfPlayerOptionsMap[value]}>`);
          const role = interaction.guild.roles.cache.get(
            selfPlayerOptionsMap[value]
          );
          logRoleChange(client, interaction, "Assigned", role);
        } catch (error) {
          console.error(
            `Failed to add role ${selfPlayerOptionsMap[value]} with ID: ${value}, Error: ${error}`
          );
        }
      }
    }
    const replyMessage =
      addedRoles.length > 0
        ? `Strategy roles ${addedRoles.join(", ")} have been assigned!`
        : "Strategy roles have been assigned!";
    await interaction.editReply(replyMessage);
  }
}

async function handleTzRoles(interaction, client) {
  const tzRolesToRemove = Object.values(tzRoles); // Use the entire tzRoles array
  let assignedRoleIds = [];

  // Remove all tzRoles from the user first
  for (const roleId of tzRolesToRemove) {
    try {
      await interaction.member.roles.remove(roleId);
      const role = interaction.guild.roles.cache.get(roleId);
      logRoleChange(client, interaction, "Removed", role); // Log role removal
    } catch (error) {
      console.error(
        `Failed to remove role with ID: ${roleId}, Error: ${error}`
      );
    }
  }

  // Assign new tzRoles based on the user's selection
  for (const value of interaction.values) {
    if (tzRoles[value]) {
      const roleIdToAdd = tzRoles[value];
      try {
        await interaction.member.roles.add(roleIdToAdd);
        assignedRoleIds.push(roleIdToAdd); // Store the assigned role ID
        const role = interaction.guild.roles.cache.get(roleIdToAdd);
        logRoleChange(client, interaction, "Assigned", role); // Log role addition
      } catch (error) {
        console.error(
          `Failed to add role with ID: ${roleIdToAdd}, Error: ${error}`
        );
      }
    } else {
      console.warn(`Unrecognized role name: ${value}`);
    }
  }

  // Construct the reply message
  const assignedRolesString = assignedRoleIds.join(", ");
  const replyMessage =
    assignedRoleIds.length > 0
      ? `Timezone role of <@&${assignedRolesString}> has been assigned!`
      : "Timezone roles updated!";

  try {
    await interaction.editReply({
      content: replyMessage,
      ephemeral: true,
    });
  } catch (error) {
    console.error(`Failed to reply to interaction: ${error}`);
  }
}

async function cwlbaseclan(interaction, client, clanabb) {
  function findClanName(clanabb) {
    const ClanName = CLAN_INFO.find((clan) => clan.abb === clanabb);
    return ClanName ? ClanName.name : null;
  }

  const ClanName = findClanName(clanabb);

  const baseEmbed = await interaction.channel.messages.fetch(
    interaction.message.id
  );
  const currentFooter =
    baseEmbed.embeds[0].footer?.text || "Base being used in";
  const currentDescription = baseEmbed.embeds[0].description || "";
  const updatedFooter = `${currentFooter} | ${ClanName}`;

  const updatedEmbed = new EmbedBuilder()
    .setColor(baseEmbed.embeds[0].color)
    .setTitle(baseEmbed.embeds[0].title)
    .setDescription(currentDescription)
    .setImage(baseEmbed.embeds[0].image.url)
    .setFooter({
      text: updatedFooter,
      iconURL: "https://i.imgur.com/FSyJai0.png",
    });

  // Copy fields from the existing embed
  const fields = baseEmbed.embeds[0].fields;
  if (fields) {
    for (const field of fields) {
      updatedEmbed.addFields({ name: field.name, value: field.value });
    }
  }

  // Edit the message with the updated embed
  await baseEmbed.edit({
    embeds: [updatedEmbed],
    components: baseEmbed.components,
  });

  const messageLink = interaction.message.url;
  const executor = interaction.user.username;
  logit(client, { content: `Clan added to ${messageLink} by ${executor}` });

  // Acknowledge the interaction
  await interaction.editReply({
    content: "Clan added in embed",
    ephemeral: true,
  });
}

async function deleteJobById(interaction, taskid) {
  try {
    // Ensure the jobId is wrapped with ObjectId for direct _id queries
    await agenda.cancel({ _id: new ObjectId(taskid) });

    console.log(`Task with ID ${taskid} has been deleted`);
    await interaction.editReply({
      content: `Task with ID ${taskid} has been deleted`,
    });
  } catch (error) {
    console.error("Error deleting job:", error);
  }
}
