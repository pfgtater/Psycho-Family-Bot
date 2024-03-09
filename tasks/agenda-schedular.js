const Agenda = require("agenda");
const mongoConnectionString =
  "Key_INFO";
const agenda = new Agenda({ db: { address: mongoConnectionString } });
const fs = require("fs");

//Find current season
const today = new Date();
const month = today.getMonth() + 1;
const year = today.getFullYear();
const season = `${year}-${month.toString().padStart(2, "0")}`;

const { memberspull, raidMessage } = require("./task-store.js");
const { regclan, cwlclan } = require("./clan-autoboard.js");
const { cwlendtime, cwlstore } = require("./cwl-store.js");
const { initialstats, finalstats } = require("./cwlPerformance.js");
const legendsautoboard = require("./legends-autoboard.js");
const greeceleaderboardsend = require("./greece-legends-leaderboard.js");
const pingu = require("./pingu.js");
const bonuspull = require("./bonus-pull.js");

// Function to setup and start the job
async function agendaschedular(client) {
  agenda.on("ready", async () => {
    await agenda.start();

    //////// Pingu
    agenda.define("Pingu", async (job) => {
      await pingu(client);
      console.log("Pingu is Here");
    });
    await agenda.every("5 * * * *", "Pingu"); //Every  minutes

    //////// Pull CWL Data
    agenda.define("CWL Data Pull", async (job) => {
      await bonuspull(client);
      console.log("Pingu is Here");
    });
    await agenda.every("25 * * * *", "CWL Data Pull"); //Every 60 minutes

    //////// Pull members list Job
    agenda.define("Pull Members List", async (job) => {
      await memberspull(client);
    });
    await agenda.every("50 04 * * *", "Pull Members List"); //Everyday at 04:50 AM UTC

    //////// Regular clan Autoboard
    agenda.define("Reg Clan Autoboard", async (job) => {
      await regclan(client);
    });
    await agenda.every("00 4 * * *", "Reg Clan Autoboard"); //Everyday at 4 AM UTC

    //////// CWL clan Autoboard
    agenda.define("CWL Clan Autoboard", async (job) => {
      await cwlclan(client);
    });
    await agenda.every("05 4 10,14 * *", "CWL Clan Autoboard"); //After CWL on 10th and 14th of each month

    //////// Legends Autoboard
    agenda.define("Legends Autoboard", async (job) => {
      await legendsautoboard(client);
    });
    await agenda.every("56 04 * * *", "Legends Autoboard"); //Everyday at 04:56 AM UTC

    //////// Greece Legends Leaderboard
    agenda.define("Greece Legends Leaderboard", async (job) => {
      await greeceleaderboardsend(client);
    });
    await agenda.every("57 04 * * *", "Greece Legends Leaderboard"); //Everyday at 04:57 AM UTC

    //////// Raid Weekend announcment message
    agenda.define("Raid Message", async (job) => {
      await raidMessage(client);
    });
    await agenda.every("00 07 * * 7", "Raid Message"); //Every Sunday at 7 AM UTC

    //////// Find CWL end time for clans
    agenda.define("CWL End Time", async (job) => {
      await cwlendtime(client);
    });
    await agenda.every("00 4 7,8,9 * *", "CWL End Time"); //During CWL on 7-9th of each month at 4 AM UTC

    //////// Schedule CWL Bonus archiving based on CWL end time
    // Define the main job - Not scheduled. Meant to be ran manually
    agenda.define("Bonus Archive", async (job) => {
      const cwlendtimeData = JSON.parse(
        fs.readFileSync(`${season}-cwlend.json`, "utf8")
      );
      await cwlendtime(client);

      cwlendtimeData.forEach(({ name, tag, unixtime }) => {
        const date = new Date(unixtime);
        const delayedTime = new Date(date.getTime() + 12 * 60 * 1000); // Add 12 minutes delay

        // Create a subtask job for each clan
        const subtaskName = `Bonus Archive - ${name}`;
        agenda.schedule(delayedTime, subtaskName, { tag });
      });
    });

    // Define the subtask job
    agenda.define("Bonus Archive - :clanName", async (job) => {
      const tag = job.attrs.data;
      const chosenStyles = "winter";

      if (tag) {
        try {
          await cwlstore(client, season, tag, chosenStyles);
        } catch (error) {
          console.error("Error executing cwl-store:", error);
        }
      } else {
        console.error(`Clan details not found for ${clanName}`);
      }
    });

    ///// CWL performance tasks
    // Initial
    agenda.define("CWL stats - Initital", async (job) => {
      await initialstats();
    });
    await agenda.every("05 4 2,3 * *", "CWL stats - Initital"); //Before CWL on 1st and 2nd of each month

    // Final - Not scheduled. Meant to be ran manually
    agenda.define("CWL stats - Final", async (job) => {
      await finalstats();
    });
    await agenda.every("05 4 10 * *", "CWL stats - Final"); //After CWL on 10th of month

    // Use to Cancel jobs
    // await agenda.cancel({ name: 'Bonus Archive' });

    // Use to delete unused tasks
    //await agenda.purge();

    console.log("Tasks scheduled");
  });

  agenda.on("error", (error) => {
    console.error("Failed to connect Agenda to MongoDB:", error);
  });
}

module.exports = { agendaschedular, agenda };
