const fs = require("fs");
const { google } = require("googleapis");
const { EmbedBuilder } = require("discord.js");

// Google Sheets API configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = "token.json"; // Replace with your token file path
const SPREADSHEET_ID = "sheet ID"; // Replace with your spreadsheet ID
const RANGE = "ongoing-comp!A2:D20"; // Replace with your sheet and range

// Function to read arrays from a Google Sheet
async function readArraysFromGoogleSheet(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
  const values = response.data.values;

  if (!values || values.length === 0) {
    console.log("No data found.");
    return [];
  }

  // Transpose the data from columns to rows
  const transposedValues = values[0].map((_, colIndex) =>
    values.map((row) => row[colIndex])
  );

  return transposedValues;
}

module.exports = {
  name: "ongoing-comp",
  description: "Send Ongoing leagues embed",
  async execute(interaction, client) {
    // Channel ID where the embed will be sent
    const channel = client.channels.cache.get("938459733239681064"); // Replace with your channel ID

    // Read data from Google Sheet
    const content = fs.readFileSync("credentials.json", "utf8"); // Replace with your credentials file path
    const credentials = JSON.parse(content);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token
    try {
      const token = fs.readFileSync(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
    } catch (err) {
      console.error("Error reading token file:", err);
      return;
    }

    const values = await readArraysFromGoogleSheet(oAuth2Client);

    // Transform data into the format required for Discord bot command
    const [league, rep, clan, date] = values;

    const embedData = league.map((league, index) => ({
      league,
      rep: rep[index],
      clan: clan[index],
      date: date[index],
    }));

    // Create a new embed
    const embed = new EmbedBuilder()
      .setColor("#d1ff00")
      .setTitle("__Ongoing Leagues__ <a:load:1082964053963579424>")
      .setFooter({
        text: "Once scheduled, matches will be shown below",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Add the description to the embed
    embed.setDescription(
      "Here you can find list of leagues we are currently playing. Along with Rep for each league and expected period. If you need any help, feel free to reach out to respective league rep.\n\n"
    );

    try {
      // Loop through the data from Google Sheets and add fields to the description
      embedData.forEach((data) => {
        if (typeof data.league === "string" && data.league.trim() !== "") {
          embed.description += `<a:league:1082962851792162896> **__${data.league}__**\n<:rep:1162732893794205826> **Rep:** ${data.rep}\n<:ClanCastle:899892814526152705> **Clan:**  ${data.clan}\n<:day:1162728074215960577> **Date:** ${data.date}\n\n`;
        }
      });

      // Check if a message link is provided
      const messageLink = interaction.options.getString("link");
      if (messageLink) {
        // Extract the message ID from the link
        const messageId = messageLink.split("/").pop();

        // Edit the existing message with the updated embed
        const existingMessage = await channel.messages.fetch(messageId);
        await existingMessage.edit({ embeds: [embed] });

        await interaction.reply({
          content: "Embed has been updated",
          ephemeral: true,
        });
      } else {
        // Send a new message with the embed
        await channel.send({ embeds: [embed] });

        await interaction.reply({
          content: "Embed has been posted",
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle the error or display an error message to the user
    }
  },
};
