const { agenda } = require("../tasks/agenda-schedular");
const {
  time,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("discord.js");
const cronstrue = require("cronstrue");

module.exports = {
  name: "list-task",
  description: "List Currently scheduled task",
  async execute(interaction) {
    // Ensure 'agenda' is passed if not globally available

    const allJobs = await agenda.jobs({});

    const embed = new EmbedBuilder()
      .setTitle("List of Scheduled tasks")
      .setColor("#825408")
      .setFooter({
        text: "#PsychoFamily",
        iconURL: "https://i.imgur.com/FSyJai0.png",
      })
      .setTimestamp();

    // Create a select menu for CWL Roles
    const taskmenu = new StringSelectMenuBuilder()
      .setCustomId("delete_task")
      .setPlaceholder("Select task to stop")
      .setMinValues(1)
      .setMaxValues(1);

    allJobs.forEach((job) => {
      const nextrunTime = job.attrs.nextRunAt;
      const nextrun = time(nextrunTime, "R");

      let valueText = `Next run - ${nextrun}`;

      if (job.attrs.repeatInterval) {
        const repeatInterval = cronstrue.toString(job.attrs.repeatInterval, {
          verbose: true,
        });
        valueText = `Schedule - ${repeatInterval}\n` + valueText;
      }

      if (job.attrs.lastRunAt) {
        const lastrunTime = job.attrs.lastRunAt;
        const lastrun = time(lastrunTime, "R");
        valueText += `\nLast run - ${lastrun}`;
      }

      embed.addFields({
        name: `**__${job.attrs.name}__**`,
        value: valueText,
      });

      taskmenu.addOptions({
        label: job.attrs.name,
        value: job.attrs._id.toString(),
      });
    });

    // Create an task row
    const deleteTaskRow = new ActionRowBuilder().addComponents(taskmenu);

    await interaction.reply({ embeds: [embed], components: [deleteTaskRow] });
  },
};
