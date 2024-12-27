// Discord and related utilities
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");

const {
  getAutocompleteSuggestions,
  reportErrorToChannel,
} = require("./utilities.js");

const {
  uniqueUsers,
  tzRoles,
  roleOptionsMap,
  roleIds,
  familyRoleOptionsMap,
  selfPlayerOptionsMap,
  CLAN_DATA,
} = require("./shared.js");

const config = require("./config.json");
const fs = require("fs");
const { error } = require("console");

const { agendaschedular } = require("./tasks/agenda-schedular.js");

// Event handlers
const guildMemberAddHandler = require("./eventHandlers/guildMemberAddHandler");
const guildMemberRemoveHandler = require("./eventHandlers/guildMemberRemoveHandler");
const dmMessageHandler = require("./eventHandlers/dmMessageHandler.js");

// Interaction handlers
const commandHandler = require("./handlers/commandHandler");
const buttonHandler = require("./handlers/buttonHandler");
const selectMenuHandler = require("./handlers/selectMenuHandler");
const autocompleteHandler = require("./handlers/autocompleteHandler");

// Bot permissions and what it needs
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel], // Required for receiving DMs
});

// Handlers
client.on("messageCreate", async (message) => {
  dmMessageHandler(client, message);
});
client.on("guildMemberAdd", async (member) => {
  await guildMemberAddHandler(member);
});

client.on("guildMemberRemove", async (member) => {
  await guildMemberRemoveHandler(member);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand()) {
      commandHandler(interaction, client);
    } else if (interaction.isButton()) {
      buttonHandler(interaction, client);
    } else if (interaction.isStringSelectMenu()) {
      selectMenuHandler(interaction, client);
    } else if (interaction.isAutocomplete()) {
      autocompleteHandler(interaction, client);
    }
  } catch (error) {
    reportErrorToChannel(error, interaction.user, interaction, client);
  }
});

// Sets the user cooldown after they run a command
client.commands = new Collection();
const interactionCooldowns = new Map();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Bot logins and sets the presence description
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Set the bot's presence (status)
  client.user.setPresence({
    activities: [{ name: "Clash of Clans", type: "PLAYING" }],
    status: "online",
  });

  // Start schedular
  agendaschedular(client);

  //startLogMonitoring();

  /*
  // Upload animated avatar
  fs.readFile("assets/profile-picture/dev-pfp.gif", async (err, data) => {
    if (err) {
      console.log("Failed to upload animated avatar:", err);
    } else {
      try {
        await client.user.setAvatar(data);
        console.log("Animated avatar uploaded successfully!");
      } catch (e) {
        console.log("Failed to upload animated avatar:", e);
      }
    }
  });
 */
});

client.login(config.token).catch((error) => {
  console.error("Error during bot login:", error);
});
