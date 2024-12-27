const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "1v1rules",
  description: "Send rules embed",
  execute: function (interaction, client, embedchannel) {
    //// Create the embed for timezone
    const trembed = new EmbedBuilder()
      .setColor("#92600d")
      .setDescription(
        "**__General Rules__**\n<a:ZA_right_arrow:1133424908915982487> To register, head to <#908185147998871632> and add yourself to Clashkings roster. __Only add yourself if you will be available on Sunday for multiple matches__\n<a:ZA_right_arrow:1133424908915982487> Players must use account listed in ⁠⁠<#905679292204204032>\n<a:ZA_right_arrow:1133424908915982487> Only one account per player allowed\n<a:ZA_right_arrow:1133424908915982487> Participants are allowed to use their clans for the tournament. If not, <@&905663869303803964> will provide one\n<a:ZA_right_arrow:1133424908915982487> Negotiations can be handled through DM or ⁠<#908968472053186570>\n\n**__Event Details__**\n<a:ZA_right_arrow:1133424908915982487> Event hosted by <@581449141297610755>\n<a:ZA_right_arrow:1133424908915982487> Prize pool: First - $100 and Second - $50\n<a:ZA_right_arrow:1133424908915982487> Registration closing <t:1702187999:R>\n<a:ZA_right_arrow:1133424908915982487> It is a one day event. Only agree to participate if you are available during timeline below since TH16 is relasing on Monday! \n<a:ZA_right_arrow:1133424908915982487> Matches start on <t:1702188900:F>\n<a:ZA_right_arrow:1133424908915982487> Matches need to be completed  by <t:1702274399:F>\n\n**__Match Rules__** \n<a:ZA_right_arrow:1133424908915982487> This is a Friendly Challenge style tournament. Post a FC, scout the base up to 5 minutes and when ready, agree to start the attack at the same time! \n<a:ZA_right_arrow:1133424908915982487> Both mates must agree to start or attack will be voided. Attack will be voided if any mate scouts longer than 5 minutes.\n<a:ZA_right_arrow:1133424908915982487> Seasonal Troops are not allowed\n<a:ZA_right_arrow:1133424908915982487> Matches must be completed within the timeline provided above\n<a:ZA_right_arrow:1133424908915982487> If you do not reply to your opponent within 2 hours, they will advance to the next round. \n<a:ZA_right_arrow:1133424908915982487> Championship match will be a Best of Three match\n​\n**__Tie-Breaker__**\nIf the first match ends with a draw (percentage), a second match will be played with a shorter scout time (3 minutes).\n<:RedOne:908959051965153290> Total stars ⭐️\n<:RedTwo:908959076975788072> Total percentage of all matches\n<:RedThree:908959284136665169> Attack duration\n​\n**__Results__**\nYou are responsible for posting your results in <#905679338148618281> or higher seed will get the default win"
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    //// Define header image
    const header = new AttachmentBuilder("./assets/header/1v1rules.png");

    // Send the CWL Clan Roles embed along with the select menu
    embedchannel.send({ embeds: [trembed], files: [header] });
  },
};
