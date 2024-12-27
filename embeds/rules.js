const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "rules",
  description: "Rules embed",
  execute: function (interaction, client, embedchannel) {
    //Attach rules header image
    const header = new AttachmentBuilder("./assets/header/rules.png");

    const ruleEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("**__Rules__**")
      .setDescription(
        `<:NoBully:859768726235381771> **Keep it classy**\n\nWe don't have many but we do ask that you respect our other members and friends in our discord community. We do allow and suggest some friendly banter from time to time! We like to have fun. Other than that welcome aboard!\n\n<:No:859768747846139954> **What we avoid!**\n\n<a:AnimatedRedArrow:784650120016822272> Sexually explicit posts\n<a:AnimatedRedArrow:784650120016822272> Racist jokes or comments\n<a:AnimatedRedArrow:784650120016822272> Rude or mean comments directed at any of our members/friends\n\n<:Yes:859768686335623169> **Guidelines**\n\n<a:AnimatedRedArrow:784650120016822272> All discord users must be 13 years of age or older per the discord terms of service.\n<a:AnimatedRedArrow:784650120016822272> Do not spam any of the channels with gibberish or non channel related chat.\n<a:AnimatedRedArrow:784650120016822272> When posting, please make sure you're posting in the correct channel.\n<a:AnimatedRedArrow:784650120016822272> Do not try and sell your CoC account or any account that would break the Terms of Service.\n<a:AnimatedRedArrow:784650120016822272> Do not post the same video links or any other content multiple times in a row or within the same day.\n\n<a:AnimatedExclamation:1061739231036317847> **Warning**\n\nIf you fail to follow these simple rules/guidelines, you’ll be asked to stop or you’ll be kicked/banned from the server. If you follow these, we’ll have a good time!`
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Create verify button
    const button = new ButtonBuilder()
      .setCustomId("rulesverify")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("1096902435596931142");

    // Create an action row
    const buttonrow = new ActionRowBuilder().addComponents(button);

    embedchannel.send({
      embeds: [ruleEmbed],
      components: [buttonrow],
      files: [header],
    });
  },
};
