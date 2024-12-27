const { agenda } = require("../tasks/agenda-schedular");
const cronstrue = require("cronstrue");

// Used to generate commands/tasker options
const TASK_CHOICES = [
  { name: "Pingu", value: "pingu" },
  { name: "CWL Data Pull", value: "cwl_data_pull" },
  { name: "Pull Members List", value: "pull_members_list" },
  { name: "Reg Clan Autoboard", value: "reg_clan_autoboard" },
  { name: "CWL Clan Autoboard", value: "cwl_clan_autoboard" },
  { name: "Legends Autoboard", value: "legends_autoboard" },
  { name: "Greece Legends Leaderboard", value: "greece_legends_leaderboard" },
  { name: "Raid Message", value: "raid_message" },
  { name: "CWL End Time", value: "cwl_end_time" },
  { name: "Bonus Archive", value: "bomus_archive" },
  { name: "CWL stats - Initital", value: "cwl_stats_initial" },
  { name: "CWL stats - Final", value: "cwl_stats_final" },
];

module.exports = {
  name: "tasker",
  description: "Modify task",
  async execute(interaction, client) {
    action = interaction.options.getString("action");
    taskvalue = interaction.options.getString("task");
    const task = TASK_CHOICES.find((c) => c.value === taskvalue); // Get readable form from string
    const intervalchoice = interaction.options.getInteger("interval");

    if (action === "enable") {
      const interval = `${intervalchoice} * * * *`;

      if (intervalchoice > 59) {
        await interaction.reply(`minutes part must be >= 0 and <= 59`);
        return;
      }
      console.log(`${interval}`);
      await agenda.every(`${interval} * * * *`, task.name);
      const repeatInterval = cronstrue.toString(interval, { verbose: true });
      await interaction.reply(
        `${task.name} is set to occur every ${repeatInterval}`
      );
    } else if (action === "disable") {
      await agenda.cancel({ name: task.name });
      await interaction.reply(`${task.name} has been disabled`);
    } else if (action === "now") {
      await interaction.reply(`${task.name} will be executed now`);
      const job = await agenda.jobs({ name: task.name });

      if (job.length > 0) {
        // If the job exists, run it immediately
        await job[0].run();
      } else {
        console.error("Task not found");
        await interaction.reply("Task not found");
      }
    }
  },
  // Export Tasks
  TASK_CHOICES,
};
