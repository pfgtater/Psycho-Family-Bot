const { EmbedBuilder } = require("discord.js");
const { REG_CLAN_INFO } = require("../shared.js");
const { logit } = require("../utilities.js");

const generalclan = {
  name: "General",
  abb: "gen",
  channel: "587507114922999809",
  alogo:
    "https://cdn.discordapp.com/icons/549028189863804928/a_b317fe7db22614b082e8aacb196d9d3a.gif",
  hex: "#476a93",
  role: "587514240194314240",
};
const combinedClans = [...REG_CLAN_INFO, generalclan];

module.exports = {
  name: "accept",
  description: "Accept player into clan",
  async execute(interaction, client) {
    // Defer the reply to give the bot more time to process the command
    await interaction.deferReply();

    try {
      // Extract options from interaction
      const clanInput = interaction.options.getString("clan");
      const clan = combinedClans.find((clan) => clan.abb === clanInput);

      // Validate user and member
      const user = interaction.options.getUser("user");
      if (!user) {
        await interaction.followUp("User not found.");
        return;
      }

      const member = interaction.guild.members.cache.get(user.id);
      if (!member) {
        await interaction.followUp("Member not found.");
        return;
      }

      // Remove Law and Application roles if they exist
      if (member.roles.cache.has("784678518399041577")) {
        // Law
        await member.roles.remove("784678518399041577");
      }

      if (member.roles.cache.has("784791491327426600")) {
        // Application
        await member.roles.remove("784791491327426600");
      }

      if (clan) {
        // Add clan role
        await member.roles.add(clan.role);

        // Greet the user in the respective clan channel
        const channelToGreetIn = interaction.guild.channels.cache.get(
          clan.channel
        );
        const greetingMessage = `<@${user.id}>! You can find the ${clan.name} chat here on Discord. You should have access to most channels now. Let us know if you have any questions. Feel free to head to <#783173728862994432> and ⁠<#1133647448569544744> and react accordingly. We have a YouTube channel which can be found in ⁠<#961843096725889034>. Welcome to the Family!`;

        channelToGreetIn
          .send(greetingMessage)
          .then(() => {
            console.log(`Greeting message sent to ${clan.channel}`);
          })
          .catch(async (err) => {
            console.error(`Failed to send greeting message: ${err}`);
            await channelToGreetIn.send(greetingMessage);
          });

        // Reply to the interaction to indicate the user has been accepted
        const acceptembed = new EmbedBuilder()
          .setTitle("Welcome to Psycho Family!")
          .setColor(clan.hex)
          .setDescription(
            `You have been accepted in ${clan.name}. You now have access to <#${clan.channel}>`
          )
          .setThumbnail(clan.alogo)
          .setFooter({
            text: "#PsychoFamily",
            iconURL: "https://i.imgur.com/FSyJai0.png",
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [acceptembed] });

        // Send log message
        const executor = interaction.user.username;
        const logembed = new EmbedBuilder()
          .setTitle("Player accepted")
          .setColor(clan.hex)
          .setDescription(
            `${user.username} has been accepted in ${clan.name} by ${executor}`
          )
          .setThumbnail(clan.alogo)
          .setFooter({
            text: "#PsychoFamily",
            iconURL: "https://i.imgur.com/FSyJai0.png",
          })
          .setTimestamp();

        await logit(client, { embeds: [logembed] });
      } else {
        await interaction.followUp("Invalid clan specified.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      await interaction.followUp(
        "An error occurred while processing your request."
      );
    }
  },
};
