const { reportErrorToChannel } = require("../utilities.js");

module.exports = async (interaction, client) => {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    reportErrorToChannel(error, interaction.user, interaction, client);
    await interaction.followUp({
      content: "An error occurred while executing this command.",
      ephemeral: true,
    });
  }
};
