const fs = require("fs");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { google } = require("googleapis");
const { CLAN_INFO } = require("../shared.js");

// Google Sheets API configuration
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const TOKEN_PATH = "token.json"; // Replace with your token file path
const SPREADSHEET_ID = "1bsBsobC7b2zyeOPD5kjnVjXcwuf6XzSeQQFUjR44u0k"; // Replace with your spreadsheet ID
const RANGE = "bases-to-post!B2:F121"; // Replace with your sheet and range

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
  name: "base-post",
  description: "Embed",
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    // Get the channel ID from the interaction options, if not available then use interaction channel
    const channelId =
      interaction.options.getChannel("channel")?.id || interaction.channel.id;
    const channel = client.channels.cache.get(channelId);

    const style = interaction.options.getString("style");

    // Load client secrets from a file, and set up the Sheets API
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

    // Read data from Google Sheet
    const values = await readArraysFromGoogleSheet(oAuth2Client);

    if (!values || values.length === 0) {
      console.log("No data found.");
      interaction.editReply({
        content: "No data found. Check if spreadsheet is empty.",
        ephemeral: true,
      });
      return;
    }

    // Define the index of each column in the data
    const columnIndex = {
      baseLinks: 0,
      imageLinks: 1,
      builderNames: 2,
      ccNames: 3,
      noteNames: 4,
    };

    const transposedValues = values[0].map((_, colIndex) =>
      values.map((row) => row[colIndex])
    );

    const bases = transposedValues.map((row) => {
      return {
        baseLinks: row[columnIndex.baseLinks] || "",
        imageLinks: row[columnIndex.imageLinks] || "",
        builderNames: row[columnIndex.builderNames] || "",
        ccNames: row[columnIndex.ccNames] || "",
        noteNames: row[columnIndex.noteNames] || "",
      };
    });

    // Filter out bases with empty baseLinks
    //const filteredBases = bases.filter(base => base.baseLinks);

    for (const base of bases) {
      // Create the embed
      const embed = new EmbedBuilder()
        .setColor("#800000")
        .setDescription(
          [
            `[**Base Information**](${base.baseLinks})\n`,
            base.builderNames && base.builderNames.length > 0
              ? `<:bullet:1125006442492084235> ${base.builderNames}`
              : "",
            base.ccNames && base.ccNames.length > 0
              ? `<:ClanCastle:899892814526152705> ${base.ccNames}`
              : "",
          ]
            .filter(Boolean)
            .join("\n")
            .trim()
        )
        .setImage(base.imageLinks);

      // Add "Notes" field only if noteNames is provided
      if (base.noteNames && base.noteNames.length > 0) {
        embed.addFields({ name: "Notes", value: base.noteNames });
      }

      // Add Link button
      const linkButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Base Link")
          .setURL(base.baseLinks)
          .setStyle(ButtonStyle.Link)
      );

      //Add Select menu
      const selectmenu = new StringSelectMenuBuilder()
        .setCustomId("cwl_base_clan")
        .setPlaceholder("Select clan where the base will be used")
        .addOptions(
          CLAN_INFO.map((clan) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(clan.name)
              .setValue(clan.abb)
              .setEmoji(clan.emoji)
          )
        );
      const clanrow = new ActionRowBuilder().addComponents(selectmenu);

      //Check style option and send embed

      if (style === "cwl") {
        await channel.send({
          embeds: [embed],
          components: [linkButton, clanrow],
        });
      }
      // Send the Base embed with button
      else await channel.send({ embeds: [embed], components: [linkButton] });
    }

    await interaction.editReply({
      content: "Bases have been posted successfully",
      ephemeral: true,
    });
  },
};
