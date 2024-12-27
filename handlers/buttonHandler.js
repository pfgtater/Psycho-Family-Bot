const { MessageEmbed } = require("discord.js");
const {
  reportErrorToChannel,
  logRoleChange,
  raidmessage,
  todolist,
} = require("../utilities.js");
const listtask = require("../commands/list-task.js");

module.exports = async (interaction, client) => {
  if (!interaction.isButton()) return;

  try {
    // CWL Captain Button
    if (interaction.customId === "cwl_captain") {
      const roleId = "859538469243060304";
      const role = interaction.guild.roles.cache.get(roleId);
      const member = interaction.member;

      if (!role) {
        console.error("Role not found with ID:", roleId);
        return;
      }

      console.log("Before role check"); // Debug

      if (member.roles.cache.has(roleId)) {
        console.log("Member has role, removing..."); // Debug
        await member.roles.remove(roleId);
        await interaction.reply({
          content: "Your <@&" + roleId + "> role has been removed!",
          ephemeral: true,
        });
        console.log("Calling logRoleChange - Removed");
        logRoleChange(client, interaction, "Removed", role); // Log the action
      } else {
        console.log("Member does not have role, adding..."); // Debug
        await member.roles.add(roleId);
        await interaction.reply({
          content: "You are now a <@&" + roleId + ">!",
          ephemeral: true,
        });
        console.log("Calling logRoleChange - Assigned");
        logRoleChange(client, interaction, "Assigned", role); // Log the action
      }
    }
        // Raid refresh button
        else if (interaction.customId === "raidsrefresh") {
        content = await raidmessage();
        await interaction.message.edit(content);
        await interaction.reply({ content: `Tasks updated!`, ephemeral: true });
    }
    /*
        //List task refresh button
        else if (interaction.customId === 'taskrefresh') {

            content = await listtask()
            await interaction.message.edit(content);
            await interaction.reply({ content: `Information updated!`, ephemeral: true });
        }
        */
    // Rules button
    else if (interaction.customId === "rulesverify") {
      const member = interaction.member;
      const roleId = "784678518399041577";
      const role = interaction.guild.roles.cache.get(roleId);
      await member.roles.add(roleId); // Grant law role
      await interaction.reply({
        content:
          "You have been granted <@&784678518399041577> role. Please read <#976185162855481394>.",
        ephemeral: true,
      });
      logRoleChange(client, interaction, "Assigned", role);
    }
    // Law button
    else if (interaction.customId === "lawverify") {
      const member = interaction.member;
      const roleId = "784791491327426600";
      const role = interaction.guild.roles.cache.get(roleId);
      await member.roles.add(roleId); // Grants application role
      await interaction.reply({
        content:
          "You have been granted <@&784791491327426600> role. Please open a ticket in <#983607370259255346> to proceed.",
        ephemeral: true,
      });
      logRoleChange(client, interaction, "Assigned", role);
    }
    // To Do List Button
    else if (interaction.customId === "getToDoList") {
  // Fetch the channel using its ID
  const logChannel = interaction.client.channels.cache.get('1170605529048031232');

  // Send a message to the log channel
  if (logChannel) {
    logChannel.send(`ToDo List button clicked by: ${interaction.user.tag}`);
  } else {
    console.error('Log channel not found');
  }

  // Execute the todolist function when the ToDo List button is pressed
  await todolist(interaction);
}
  } catch (error) {
    console.error("Error in button handler:", error);
    await reportErrorToChannel(error, interaction.user, interaction, client);
  }
};
