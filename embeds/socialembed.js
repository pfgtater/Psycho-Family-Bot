const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "socialembed",
  description: "Embed",
  execute: function (interaction, client, embedchannel) {
    const socialheader = new AttachmentBuilder(
      "./assets/header/social-links.png"
    );

    // Create the embed for CWL Captain
    const socialembed = new EmbedBuilder()
      .setColor("#0b2c69")
      .setDescription(
        "Take a few moments out of your busy schedule and swing by our social medias! Smash the subscribe button or drop a follow and tell all your friends about it!"
      )
      .addFields(
        {
          name: "<:Link:1061747613138956359> **Click links below for desired platform** <:Link:1061747613138956359>",
          value:
            "<:YouTube:986346532297134161> - [YouTube](https://www.youtube.com/channel/UCe5w7W3uk6uMUFjvKcJfS-A)\n<:Instagram:986137026262892584> - [Instagram](https://instagram.com/psychofamilygaming16?igshid=YmMyMTA2M2Y=)\n<:Twitter:986140163015081994> - [Twitter](https://twitter.com/PFG_16?t=3VEpzEWFBRQIc6TaaioHCA&s=09)",
        },
        {
          name: "Every follow/like helps the family for than we can say. We appreciate your support!",
          value: "**Clash On!**",
        }
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    embedchannel.send({ embeds: [socialembed], files: [socialheader] });
  },
};
