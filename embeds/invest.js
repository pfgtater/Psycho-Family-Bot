const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "familyinfo",
  description: "Embed",
  execute: function (interaction, client, embedchannel) {
    //Attach header images
    const header = new AttachmentBuilder("./assets/header/invest.png");

    // Create the embed for CWL Clan
    const embed = new EmbedBuilder()
      .setColor("#825408")
      .setTitle("**__Family Support__**")
      .setDescription(
        `Month in and month out, multiple members of leadership use their own money to allow members to maximize your gameplay. This would be a way to say Thank you. It doesn't have to be a lot, whatever you feel comfortable with.\n\n**Investment Allocation**\n<a:number1:1061757326605951006> Monthly Bases for reg war and legends\n<a:number2:1061757337636974612> Monthly Bases for CWL for the family\n<a:number3:1061757335288164352> Monthly subscription to Burntbase\n<a:number4:1061757333841117214> Discord maintenance (Patreon to certain bots)\n<a:number5:1061757331488116747> Discord server boosts (if we dip below 14)\n<a:number6:1061757325486071818> The YouTube Channel (We have hopes to expand it, most of it costs money)\n<a:number7:1061757328556298290> Future Events (The bigger the prize pool for an event, the more mates its attracts)\n\n**Investment Guarantee**\n<a:AnimatedExclamation:1061739231036317847> This account was set up for the family and the family only. Every dollar that goes into that account will be invested back to the family in some way.\n\n**Thank you**\nWe greatly appreciate any and all support! We wouldn't be where we are today without you and your support! Clash on!`
      )
      .setImage("https://i.imgur.com/yuYVTqM.png")
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Add Link button
    const linkButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("PayPal Link")
        .setURL("https://paypal.me/pfg2016?country.x=US&locale.x=en_US")
        .setStyle(ButtonStyle.Link)
    );
    embedchannel.send({
      embeds: [embed],
      files: [header],
      components: [linkButton],
    });
  },
};
