const { raidmessage } = require("../utilities.js");

module.exports = {
  name: "capital-spots",
  description: "Fetch and display capital spots for clans.",
  async execute(interaction) {
    try {
      content = await raidmessage();
      await interaction.reply(content);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  },
};
