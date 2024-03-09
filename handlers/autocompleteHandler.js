const { getAutocompleteSuggestions } = require("../utilities.js");

module.exports = async (interaction) => {
  if (interaction.isAutocomplete()) {
    const commandName = interaction.commandName;
    if (commandName === "my-rank" || commandName === "equipment-info") {
      const focusedOption = interaction.options.getFocused(true);
      if (focusedOption.name === "player") {
        const choices = await getAutocompleteSuggestions(focusedOption.value);
        await interaction.respond(
          choices.map((choice) => ({
            name: choice.name,
            value: choice.value,
          }))
        );
      }
    }
  }
};
