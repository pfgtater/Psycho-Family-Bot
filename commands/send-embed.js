const fs = require("fs");
const path = require("path"); // Import the path module to handle file paths
const fetch = require("node-fetch"); // Import the fetch module

module.exports = {
  name: "send-embed",
  description: "Send embed",
  async execute(interaction, client) {
    const attachmentOption = interaction.options.getAttachment("attachment");
    const selectEmbed = interaction.options.getString("selectembed");
    const embedchannel =
      interaction.options.getChannel("embedchannel") || interaction.channel;

    // If the 'attachment' option is present
    if (attachmentOption) {
      try {
        const attachmenturl = attachmentOption.url;

        if (!attachmenturl) {
          await interaction.reply("No attachment URL provided.");
          return;
        }

        const content = await fetch(attachmenturl);

        if (!content.ok) {
          await interaction.reply({
            content: "Failed to fetch the attachment.",
            ephemeral: true,
          });
          return;
        }

        const output = await content.text();

        // Parse the JSON data
        const jsonData = JSON.parse(output);

        //Send json data
        embedchannel.send(jsonData);

        interaction.reply({
          content: "Sent JSON data from attachment.",
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error processing attachment:", error);
        interaction.reply({
          content: `Error processing attachment: ${error.message}`,
          ephemeral: true,
        });
      }
    } else if (selectEmbed) {
      // If the 'attachment' option is not present, use 'selectEmbed'
      const filePath = path.join(__dirname, `../embeds/${selectEmbed}.js`);

      if (fs.existsSync(filePath)) {
        try {
          // Execute the script
          const embedModule = require(filePath); // Require the module dynamically
          embedModule.execute(interaction, client, embedchannel); // Execute the embed's execute function
          interaction.reply({
            content: `Executed ${selectEmbed}.js successfully.`,
            ephemeral: true,
          });
        } catch (error) {
          console.error(`Error executing ${selectEmbed}.js:`, error);
          interaction.reply({
            content: `Error executing ${selectEmbed}.js: ${error.message}`,
            ephemeral: true,
          });
        }
      } else {
        interaction.reply(`File ${selectEmbed}.js does not exist.`);
      }
    } else {
      // Handle the case where neither 'attachment' nor 'selectEmbed' is provided
      interaction.reply({
        content: "Please provide either an attachment or a selectEmbed.",
        ephemeral: true,
      });
    }
  },
};
