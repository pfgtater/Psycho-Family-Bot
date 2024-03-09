const fs = require("fs");
const fsPromises = require("fs").promises;

const cwlstore = require("../tasks/cwl-store");

//Find current season
const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const season = `${year}-${month.toString().padStart(2, "0")}`;

module.exports = {
  name: "pin-bonus",
  description: "Use to send bonus image in case bot schedule fails",
  async execute(interaction, client) {
    await interaction.deferReply();

    const clantag = interaction.options.getString("clan");
    const chosenStyles = interaction.options.getString("style") || "winter";

    await cwlstore.cwlstore(client, season, clantag, chosenStyles);

    await interaction.editReply({
      content: `CWL message sent and pinned for ${clantag} in ${season} season`,
    });
  },
};
