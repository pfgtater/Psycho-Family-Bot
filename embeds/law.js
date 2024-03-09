const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  ActionRowBuilder,
} = require("discord.js");
module.exports = {
  name: "law",
  description: "Rules embed",
  execute: function (interaction, client, embedchannel) {
    //Attach rules header image
    const header = new AttachmentBuilder("./assets/header/law.png");

    const lawEmbed1 = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("**War Expectations**")
      .setDescription(
        `<a:AnimatedRedArrow:784650120016822272> We are a war clan, we do not miss hits.\n\n<a:AnimatedRedArrow:784650120016822272> Members are expected to have their shield always reflect their current war status.\n\n<a:AnimatedRedArrow:784650120016822272> Real life happens and amount of time you will have to game fluctuates. All we ask is that you *\"Red Shield\"* when you are unavailable.\n\n<a:AnimatedRedArrow:784650120016822272> If you are in war and are unable, or unlikely to get your hits in please tell leadership.\n\n<a:AnimatedRedArrow:784650120016822272> **Be proactive**. If something comes up, let leadership know. We would rather know ahead of time than after the fact.\n\n<a:AnimatedRedArrow:784650120016822272> Each member is given two unexcused missed hits. These hits can be one hit in two wars, or two hits in one war.\n\n<a:AnimatedRedArrow:784650120016822272> If a member reaches three unexcused hits(no coleader was informed ahead of time) then they will be removed from the clan and asked to reapply in three months.\n\n<a:AnimatedRedArrow:784650120016822272> Heros **must** be up to war.\n\n**__Flagging Bases__** (Does **NOT** apply for CWL)\n\n<a:AnimatedRedArrow:784650120016822272> Add a timestamp of current war timer after a base is flagged.\n\n<a:AnimatedRedArrow:784650120016822272> During the first 12 hours, time stamps have a maximum duration of 4 hours.\n\n<a:AnimatedRedArrow:784650120016822272> During the last 12 hours of war, any base that does not have a time stamp can be hit by anyone.\n\n<a:AnimatedRedArrow:784650120016822272> During the last 4 hours of war, time stamps have a maximum duration of 1 hour.\n\n<a:AnimatedRedArrow:784650120016822272> During the last 4 hours of war, one starred and unhit bases cannot be claimed. Everyone that believes they have a chance to trip may hit it.\n\n<a:AnimatedRedArrow:784650120016822272> Failure to follow flagging rules will not result in an immediate kick, but don't be the guy that becomes an issue.`
      );

    const lawEmbed2 = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("**CWL Expectations**")
      .setDescription(
        `<a:AnimatedRedArrow:784650120016822272> Inform a leader of all extended absences(out more than one day) before the CWL week. The CWL week is **ALWAYS** the 1st of the month, so please check your personal calendar and be proactive.\n\n<a:AnimatedRedArrow:784650120016822272> Be in your respective CWL clan **BEFORE** the 1st. It is not captain's job to track you down. Members that consistently do not move will be removed from CWL rosters all together.\n\n<a:AnimatedRedArrow:784650120016822272> Keep your bases fresh. Leaders upload new bases every month. Utilize it. Do not be the member that gets 3 starred every war with the same base.\n\n<a:AnimatedRedArrow:784650120016822272> Do **NOT** miss any CWL hits. Members that miss CWL hits will be **REMOVED** from the clan and be asked to reapply in 90 days.`
      );

    const lawEmbed3 = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("**Capital Raids**")
      .setDescription(
        `<a:AnimatedRedArrow:784650120016822272> Capital Raids are a collective effort, and although we play a competitive game, you don't have to actually do better than your teammates in this game mode.\n\n<a:AnimatedRedArrow:784650120016822272> Do not wait to open up a district or a peak, to maximize gold profit. All gold ends up in the same clan, so, work as a team and try to clear a district in the less possible hits, even if that means you'll be last in gold looted.\n\n<a:AnimatedRedArrow:784650120016822272> Again, it's a team effort. We encourage you to discuss your plan with your capital leaders. Even if you don't have a clue about what you must do in this mode, ask.\n\n<a:AnimatedRedArrow:784650120016822272> Always try to get the bonus hit. Do **NOT** stop a winning raid just to allow someone else get a hit, but also try to get your bonus as early as possible, like in your 3rd hit.\n\n<a:AnimatedRedArrow:784650120016822272> Goes without saying for a war clan: get the bonus hit and use all 6. Although you won't get an insta kick on missed capital hits, don't be the one who missed. Right?\n\n<a:AnimatedRedArrow:784650120016822272> Finally, do not try to get all your minis in the *\"big\"* clan just because you are online before the others. We work as a team, as a family. We try to maximize the gold gained for the family, not for each one individually. Do not be the drunk uncle who doesn't get invited to family reunions anymore.`
      );

    const lawEmbed4 = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("**Mini Accounts**")
      .setDescription(
        `<a:AnimatedRedArrow:784650120016822272> Clan members are limited to 3 accounts in our family at a time. We want our clans to be active and not filled by the same 10-15 people.\n\n<a:AnimatedRedArrow:784650120016822272> Members of the leadership team are granted the perk of having more than 3 accounts.\n\n<a:AnimatedRedArrow:784650120016822272> An exception can be made for people who can actively work on more than 3 accounts. If you think you can afford the time and want to have more, open a ticket in <#991951197844033587> and leadership will discuss it with you.`
      );

    const lawEmbed5 = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("**Friends Role**")
      .setDescription(
        `<a:AnimatedRedArrow:784650120016822272> We do have a friends role that has access to some channels on the server. If interested, please continue with opening a ticket and let admin know you’re here as a friend. They will be with you shortly.`
      );

    const lawEmbed6 = new EmbedBuilder()
      .setColor("#ff0000")
      .setTitle("**If you agree to the listed expectations:**")
      .setDescription(
        `<a:AnimatedRedArrow:784650120016822272> click the verify button below\n<a:AnimatedRedArrow:784650120016822272> head to <#983607370259255346>\n<a:AnimatedRedArrow:784650120016822272> open a ticket.\n\nOnce you complete these steps an admin will be with you as soon as possible.`
      )
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      });

    // Create verify button
    const button = new ButtonBuilder()
      .setCustomId("lawverify")
      .setLabel("Verify")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("1096902435596931142");

    // Create an action row
    const buttonrow = new ActionRowBuilder().addComponents(button);

    //Send embeds in sequence
    // Send embeds with pauses
    embedchannel.send({ embeds: [lawEmbed1], files: [header] });
    setTimeout(() => {
      embedchannel.send({ embeds: [lawEmbed2] });
    }, 1000); // 1s pause

    setTimeout(() => {
      embedchannel.send({ embeds: [lawEmbed3] });
    }, 1300); // 300ms pause

    setTimeout(() => {
      embedchannel.send({ embeds: [lawEmbed4] });
    }, 1600); // 300ms pause

    setTimeout(() => {
      embedchannel.send({ embeds: [lawEmbed5] });
    }, 1900); // 300ms pause

    setTimeout(() => {
      embedchannel.send({ embeds: [lawEmbed6], components: [buttonrow] });
    }, 2200); // 300ms pause
  },
};
