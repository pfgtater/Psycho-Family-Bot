// Add all new commands under const commands, please do not remove anythiing as it will overwrite

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const config = require("./config.json"); // assuming you have a config.json with your bot's token
const { CLAN_INFO, REG_CLAN_INFO } = require("./shared.js");
const { TASK_CHOICES } = require("./commands/tasker.js");
const { getAvailableSeasons } = require("./utilities.js");
const seasonChoices = getAvailableSeasons();
console.log(seasonChoices);

const commands = [
  {
    name: "to-do",
    description: "Check to see if you have CWL & War attacks remaining",
    options: [
      {
        type: 6,
        name: "user",
        description: "User",
        required: false,
      },
    ],
  },
  {
    name: "accept",
    description: "Accept a clan",
    options: [
      {
        name: "clan",
        type: 3,
        description: "Choose a clan",
        required: true,
        choices: [
          ...REG_CLAN_INFO.map((clan) => ({
            name: clan.name,
            value: clan.abb,
          })),
          {
            name: "Friends Role",
            value: "gen",
          },
        ],
      },
      {
        name: "user",
        description: "The user to accept into the clan",
        type: 6, // User type
        required: true,
      },
    ],
  },

  // Bonus
  {
    name: "bonus",
    description: "Calculates CWL bonuses (ONLY VALID FOR 2023-09 AND UP)",
    options: [
      {
        name: "clan",
        type: 3,
        description: "Choose a clan",
        required: true,
        choices: CLAN_INFO.filter(
          (clan) => clan.abb !== "pm" 
        ) // Filter out clans with abb as 'pe' or 'pm'
          .map((clan) => ({
            name: clan.name,
            value: clan.tag,
          })),
      },
      {
        name: "season",
        type: 3,
        description: "Choose a season (ONLY 2023-09 AND UP)",
        required: true,
        choices: [
          {
            name: "March 2024",
            value: "2024-03",
          },
          {
            name: "February 2024",
            value: "2024-02",
          },
          {
            name: "January 2024",
            value: "2024-01",
          },
          {
            name: "December 2023",
            value: "2023-12",
          },
          {
            name: "November 2023",
            value: "2023-11",
          },
          {
            name: "October 2023",
            value: "2023-10",
          },
          {
            name: "September 2023",
            value: "2023-09",
          },
        ],
      },
      {
        name: "style",
        type: 3,
        description: "Background options",
        required: false,
        choices: [
          {
            name: "winter",
            value: "winter",
          },
          {
            name: "halloween",
            value: "halloween",
          },
          {
            name: "paper",
            value: "paper",
          },
          {
            name: "tater",
            value: "tater",
          },
        ],
      },
      {
        name: "no_bonus",
        type: 5,
        description: "Admin use only. No bonus or penalties? True/False",
        required: false,
      },
    ],
  },

  //Pin bonus
  {
    name: "pin-bonus",
    description: "Use to send bonus image in case bot schedule fails",
    options: [
      {
        name: "clan",
        type: 3,
        description: "Choose a clan",
        required: true,
        choices: CLAN_INFO.filter((clan) => clan.abb !== "pm") // Filter out clans with abb as 'pe' or 'pm'
          .map((clan) => ({
            name: clan.name,
            value: clan.tag,
          })),
      },
      {
        name: "style",
        type: 3,
        description: "Background options",
        required: false,
        choices: [
          {
            name: "winter",
            value: "winter",
          },
          {
            name: "halloween",
            value: "halloween",
          },
          {
            name: "paper",
            value: "paper",
          },
          {
            name: "tater",
            value: "tater",
          },
        ],
      },
    ],
  },

  //Equipment info
  {
    name: "equipment-info",
    description: "Show equipment stats",
    options: [
      {
        type: 3, //string type
        name: "player",
        description: "Enter player name",
        required: true,
        autocomplete: true,
      },
    ],
  },

  {
    name: "my-rank",
    description: "Retrieve player rank information",
    options: [
      {
        type: 3, //string type
        name: "player",
        description: "Enter player name",
        required: true,
        autocomplete: true,
      },
    ],
  },

  {
    name: "psycho",
    description: "tater will rule the world be careful executing this command",
    options: [],
  },

  {
    name: "pingu",
    description: "Time for some mad scientist experiments",
    options: [
      {
            name: 'user_id',
            description: 'Optional: UserID to run the command for',
            type: 4,
            required: false,
        }
    ],
  },

  // List task
  {
    name: "list-task",
    description: "List Currently scheduled task",
    options: [],
  },

  // Tasker
  {
    name: "tasker",
    description: "Modify task",
    options: [
      {
        type: 3,
        name: "action",
        description: "Choose to enable, disable or run command once",
        choices: [
          {
            name: "Enable",
            value: "enable",
          },
          {
            name: "Disable",
            value: "disable",
          },
          {
            name: "Run Now",
            value: "now",
          },
        ],
        required: true,
      },
      {
        type: 3,
        name: "task",
        description: "Choose task to modify",
        choices: TASK_CHOICES.map((task) => ({
          name: task.name,
          value: task.value,
        })),
      },
      {
        type: 4,
        name: "interval",
        description: "Task will be repeated every (<59 minutes)",
        required: false,
      },
    ],
  },

  //capital-spots
  {
    name: "capital-spots",
    description: "Displays how many capital spots remaining",
    options: [],
  },

  //Post bases into channel
  {
    name: "base-post",
    description: "Send base embeds into channel",
    options: [
      {
        type: 7,
        name: "channel",
        description: "Select channel where to post",
        required: false,
      },
      {
        type: 3,
        name: "style",
        description: "Select type of embed based on channel",
        required: false,
        choices: [
          {
            name: "CWL style",
            value: "cwl",
          },
          {
            name: "Regular style",
            value: "reg",
          },
        ],
      },
    ],
  },

  //DM bases
  {
    name: "base-send",
    description: "DM base to user",
    options: [
      {
        type: 3,
        name: "link",
        description: "Link of message you want to DM",
        required: true,
      },
      {
        type: 6,
        name: "user",
        description: "User",
        required: true,
      },
    ],
  },
  //CWL performance summary
  {
    name: "cwl-performance",
    description: "Check CWL performance of season",
    options: [
      {
        type: 3,
        name: "season",
        description: "Select Season",
        required: true,
        choices: [
          {
            name: "March 2024",
            value: "2024-03",
          },
          {
            name: "February 2024",
            value: "2024-02",
          },
          {
            name: "January 2024",
            value: "2024-01",
          },
          {
            name: "December 2023",
            value: "2023-12",
          },
          {
            name: "November 2023",
            value: "2023-11",
          },
          {
            name: "October 2023",
            value: "2023-10",
          },
          {
            name: "September 2023",
            value: "2023-09",
          },
        ],
      },
    ],
  },

  // Champs bases channel perms update
  {
    name: "champs-role-update",
    description: "Update champs channel role for clan",
    options: [],
  },

  // Legends leaderboard
  {
    name: "legends-leaderboard",
    description: "Show current trophies and ranking",
    options: [],
  },

  //Ongoing-comp command
  {
    name: "ongoing-comp",
    description: "Send ongoing comp embed",
    options: [
      {
        type: 3,
        name: "link",
        description: "Message link",
        required: false,
      },
    ],
  },

  //Repost command
  {
    name: "repost",
    description: "Resend message",
    options: [
      {
        type: 3,
        name: "link",
        description: "Message Link",
        required: true,
      },
    ],
  },

  //Purge CWL roles command
  {
    name: "rhuman-cwl",
    description: "Remove CWL roles from all members",
    options: [],
  },

  // Send Embed
  {
    name: "send-embed",
    description: "Send embed using from selection or attachment",
    options: [
      {
        name: "embedchannel",
        type: 7, // Channel
        description: "Target channel for the embed",
        required: false,
      },
      {
        type: 3,
        name: "selectembed",
        description: "Select an embed",
        required: false,
        choices: [
          { name: "The Law", value: "law" },
          { name: "Rules - Guidelines", value: "rules" },
          { name: "Player self role", value: "self-player" },
          { name: "CWL self role", value: "self-cwl" },
          { name: "Family self role", value: "self-family" },
          { name: "1v1 Rules", value: "1v1rules" },
          { name: "Social Links", value: "socialembed" },
          { name: "Invest in family", value: "invest" },
          { name: "To Do List", value: "todolist" },
        ],
      },

      {
        type: 11,
        name: "attachment",
        description: "Attach json of embed",
        required: false,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");
    const guildId = "549028189863804928";
    const response = await rest.put(
      Routes.applicationGuildCommands(config.clientId, guildId),
      { body: commands }
    );

    console.log("Response:", JSON.stringify(response, null, 2));
    console.log("Successfully reloaded application (/) commands.");
    response.forEach((cmd) => {
      console.log(`Command: ${cmd.name}, ID: ${cmd.id}`);
    });
  } catch (error) {
    console.error("Failed to reload application (/) commands.");
    console.error(error);
  }
})();
