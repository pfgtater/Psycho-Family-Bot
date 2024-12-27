const { EmbedBuilder } = require("discord.js");

module.exports = async (member) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const channel = member.guild.channels.cache.get("786608020615725146");

  // Build ban embed
  const banEmbed = new EmbedBuilder()
    .setColor("#ef3b3b")
    .setTitle("**Goodbye**")
    .setDescription(
      `We apologize, but you’ve been banned from The Psycho Community. Good luck and Clash on! ${member.user.username} <a:FingerWave:1041019844256075846>`
    )
    .setThumbnail(
      "https://cdn.discordapp.com/attachments/965641009063133234/1061734812060229682/depix-image.png"
    )
    .setFooter({
      text: "#PsychoFamily",
      iconURL: "https://i.imgur.com/tPJHeSO.png",
    });

  //Build bye embed
  const byeEmbed = new EmbedBuilder()
    .setColor("#ef3b3b")
    .setTitle("**Farewell**")
    .setDescription(
      `Good luck with your future endeavors! ${member.user.username} <a:AnimatedFire:859768637833084928>`
    )
    .setThumbnail(
      "https://cdn.discordapp.com/attachments/965641009063133234/1061734812060229682/depix-image.png"
    )
    .setFooter({
      text: "#PsychoFamily",
      iconURL: "https://i.imgur.com/tPJHeSO.png",
    });

  try {
    const banList = await member.guild.bans.fetch();
    if (banList.has(member.user.id)) {
      await channel.send({ embeds: [banEmbed] });
    } else {
      await channel.send({ embeds: [byeEmbed] });
    }
  } catch (error) {
    console.error("Error in guildMemberRemoveHandler:", error);
  }
};
