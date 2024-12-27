const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = async (member) => {
  try {
    const channel = await member.guild.channels.fetch("786608020615725146");

    const welcembed = new EmbedBuilder()
      .setColor("#ef3b3b")
      .setTitle("__Welcome!__")
      .setDescription(
        `${member.toString()}, Please refer to <#783855607899881502> and <#976185162855481394> for more information! If we seem like a good fit, click the verify button at the bottom of the message in **each channel**!  <a:AnimatedWelcome:859768817809752124>`
      )
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/965641009063133234/1061734812060229682/depix-image.png"
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/tPJHeSO.png",
      });

    const welcDM = new EmbedBuilder()
      .setColor("#ef3b3b")
      .setTitle("Welcome!")
      .setDescription(
        "Please read messages in following channels. You must click verify button at bottom of both channels. \n\n- <#783855607899881502>\n- <#976185162855481394>\n\nAfter that open a ticket in <#983607370259255346> to gain access to server."
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/tPJHeSO.png",
      });

    const welcHeader = new AttachmentBuilder("./assets/header/welcome.png");

    await channel.send({ embeds: [welcembed] });
    await member.send({ embeds: [welcDM], files: [welcHeader] });
  } catch (error) {
    console.error("An error occurred in guildMemberAddHandler:", error);
  }
};
