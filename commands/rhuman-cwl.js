const { EmbedBuilder } = require("discord.js");
const { CLAN_INFO } = require("../shared.js");

module.exports = {
  name: "rhuman-cwl",
  description: "Remove CWL roles from all members",
  async execute(interaction, client) {
    await interaction.deferReply();
    try {
      console.log(`Starting Purge`);

      const guild = interaction.guild;
      const members = await guild.members.fetch();

      // Array to store individual role removal information
      const roleRemovals = [];

      // Function to handle role removal for a specific role and pause
      const removeRoleWithDelay = async (roleId) => {
        const roleToRemove = guild.roles.cache.get(roleId);

        if (!roleToRemove) {
          throw new Error(`Role with ID ${roleId} not found!`);
        }

        // Filter members with the current role ID
        const membersWithRole = members.filter((member) =>
          member.roles.cache.has(roleId)
        );
        const membersWithRoleCount = membersWithRole.size;

        // Define update embed
        const embed = new EmbedBuilder()
          .setTitle("<a:load:1082964053963579424> **__Removing CWL Roles__**")
          .setColor("#ff0000")
          .setDescription(
            `<@&${roleToRemove.id}> removed from ${membersWithRoleCount} members`
          );

        // Remove the role from all members
        if (membersWithRoleCount > 0) {
          for (const [memberId, member] of guild.members.cache) {
            if (member.roles.cache.has(roleId)) {
              await member.roles
                .remove(roleToRemove)
                .then(() => {
                  console.log(
                    `Removed role ${roleToRemove.name} from ${member.user.tag}`
                  );
                })
                .catch((err) =>
                  console.error(
                    `Error removing role ${roleToRemove.name} from ${member.user.tag}:`,
                    err
                  )
                );
            }
          }

          await interaction.editReply({ embeds: [embed] });
          roleRemovals.push({
            roleName: roleToRemove.name,
            membercount: membersWithRoleCount,
          });
        } else {
          console.log(`No user found with ${roleToRemove.name}`);
        }
      };

      // Loop through each clan info with a delay
      for (const clan of CLAN_INFO) {
        if (clan.abb !== "pe" && clan.abb !== "pm") {
          //excluse PE and PM
          const roleId = clan.cwlrole;
          await removeRoleWithDelay(roleId);
          await new Promise((resolve) => setTimeout(resolve, 3000)); // 3-second delay
        }
      }
      // Remove Captain role
      const captainRoleId = "859538469243060304";
      await removeRoleWithDelay(captainRoleId);

      // Add individual role removal information to the result embed
      const removalDescriptions = [];
      for (const removalInfo of roleRemovals) {
        removalDescriptions.push(
          `<:bullet:1125006442492084235> Removed ${removalInfo.roleName} role from ${removalInfo.membercount} members`
        );
      }
      const allRemovalsDescription = removalDescriptions.join("\n");

      const resultEmbed = new EmbedBuilder()
        .setTitle("**__CWL roles removed successfully__**")
        .setColor("#ff0000")
        .setDescription(allRemovalsDescription);

      //Send result embed
      await interaction.editReply({ embeds: [resultEmbed] });
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle or report the error accordingly
      await interaction.channel.send(
        "An error occurred while removing roles. Please check the logs for more details."
      );
    }
  },
};
