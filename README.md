# Psycho Bot 
![Psycho Bot Banner](https://cdn.discordapp.com/attachments/1157098298331631657/1158117215795683358/Welcome4.png?ex=6591bb35&is=657f4635&hm=2e62fe4590730ad8540cec473aee22d42eba7656607038f45a6c4ca3372e1fae&)
<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <img src="https://i.imgur.com/LoPveKB.png" alt="Logo" width="100" height="100">
  <h3 align="center">Psycho Bot</h3>
  <p align="center">
    The essential utility bot for Psycho Family Gaming, offering a wide range of commands to enhance gaming experiences.
  </p>
</div>

## About The Project
Psycho Bot is developed specifically for the Psycho Family Gaming community. It incorporates various utility commands to facilitate game management, player interaction, and community engagement.

## Contributors
This project is humbly brought to life by the dedication and efforts of Necrophos and Tater.

---

# Commands
Psycho Bot offers a range of commands for different functionalities within the Psycho Family Gaming community.

### `Accept`
- **Structure**: `/accept (clan)`
- **Description**: Accepts a new member into the family.
- **Permissions**: Leadership only.

### `Base`
- **Structure**: `/base (channel)`
- **Description**: Fetches base data from Google Sheets and sends an embed.
- **Permissions**: Admin only.

### `Bonus`
- **Structure**: `/bonus (clan) (season) (style)`
- **Description**: Calculates net stars for CWL bonus and responds with an image.
- **Permissions**: CWL Captain and Leadership.

### `Bonus-pull`
- **Structure**: `/bonus-pull`
- **Description**: Fetches current CWL data immediately.
- **Permissions**: Admin only.

### `Capital Spots`
- **Structure**: `/capital-spots`
- **Description**: Determines the total number of participating members in various clans and outputs the information as an image.
- **Permissions**: PFG Family role.

### `Ongoing-comp`
- **Structure**: `/ongoing-comp (message link)`
- **Description**: Fetches ongoing competition data from Google Sheets and sends an embed.
- **Permissions**: Admin only.

### `Pingu`
- **Description**: Used to test new commands. Currently not in use.

### `Repost`
- **Structure**: `/repost (message ID)`
- **Description**: Resends a message for which the ID is provided. Soon to be removed.
- **Permissions**: Admin only.

### `Rhuman-cwl`
- **Structure**: `/rhuman-cwl`
- **Description**: Removes CWL clan roles and Captain role from all members
- **Permissions**: Admin only.


### `Send embed`
- **Structure**: `/send-embed (embedchannel) (selectembed) (attachment)`
- **Description**: Sends stored embeds to a specified channel, supporting Discohook.org json format for message data.
- **Permissions**: Admin and Tater.

### `My-rank`
- **Structure**: `/my-rank (player tag)`
- **Description**: Calculates global, local, and family rank. Returns an image 
- **Permissions**: PFG Family Role

---

# Scheduled Tasks
Psycho Bot automates several tasks to enhance the community experience.

### Raid Message
- Announces the raid weekend 24 hours before its conclusion and sends a capital spots image to showcase remaining spots in the clans

### CWL Data Fetch
- Fetches CWL data at specific intervals:
  - Every 6 hours on the 6th and 7th day of each month.
  - Every hour on the 8th to 9th day of each month.

### Family Info - Clans and CWL Clans
- Regularly fetches clan data; CWL clan data fetched on the 12th and 13th of each month.
- Script located in `/tasks`.

### Family Member List - 
- Regularly fetches family player data for all clans in CLAN_INFO. Stored in member.json
- Script located in `/tasks`.

### Legends Autoboard
- Post legends-autoboard daily at legend day reset
---

### Deploying New Commands
- deployCommands.js contains all commmands in the bot 
- utilize node to execute the script to refresh all commands and/or add/remove commands

# To-Do List
- [ ] Move and redefine fonts to another folder
- [ ] New folder called template (or base-image) to store all base canvas images (bonus, my-rank, raids, etc)
- [ ] Look into AWS CDN for a singular "assets" storage. Costs: $0
- [ ] my-rank: implement a previous day reset rank?
- [ ] Update code to discord js 14
- [ ] Refine index.js and split each handler into their own folder (buttons, select menu, etc)
- [ ] Move scheduled tasks into their own folder with node-cron, call those tasks in under client.once ready

---

# Ideas
- [ ] CWL performance overview.
- [ ] Comp performance trackers.

---
# utilities.js Explained

This section provides a concise explanation of each function within the `utilities.js` file, aimed at facilitating understanding and usage for developers. Tater will rule the world.

---

### `sleep(ms)`
Pauses execution for the specified number of milliseconds. Useful for delaying operations in asynchronous functions.

### `reportErrorToChannel(error, user, interaction, client)`
Sends a detailed error report to a predefined Discord channel. It includes the error type, stack trace, user information, interaction type, and the timestamp of the occurrence.

### `getLogoPath(clanName)`
Retrieves the file path for a clan's logo based on its name. This function maps clan names to their corresponding logo file paths.

### `getAvailableSeasons()`
Generates a list of available seasons, starting from a predefined date to the current date. Each season is formatted as `year-month`.

### `areWarDetailsAvailable(roundData)`
Checks if all necessary war details are available for a given round. Returns `true` if data is complete, otherwise `false`.

### `calculateClanRankAndRoundsWon(warDetails, ourClanTag)`
Calculates and returns the rank and number of rounds won by a clan in a war. It uses detailed war information to make the calculation.

### `calculateLeaderboard(warDetails, interaction, ourClanTag, leagueGroupData, warLeagueName, chosenStyles)`
Processes war data to generate a leaderboard image. This includes clan rank, rounds won, and individual player statistics. The function also handles the rendering of the image based on specified styles.

### `generateRaidscanvas(fields)`
Creates and saves an image using Canvas, based on provided fields. This function is typically used for generating custom graphics for raids.

### `fetchRaidsData()`
Fetches data for capital raids from an external API. The function formats this data for use in image generation or other purposes.

### `fetchCWLData(CLAN_TAG, client, clanName)`
Fetches Clan War League data for a specific clan and saves it to a file. This function is essential for gathering detailed war information.

### `logRoleChange(client, interaction, action, role)`
Logs any changes in user roles on Discord to a specified channel. It includes details about the user, the action taken, and the role involved.

### `fetchClanLeagues()`
Fetches and organizes clans by their league names from an API. This function is useful for categorizing clans based on their league affiliations.

### `fetchClanMembers()`
Fetches player names and tags for all clans in CLAN_INFO array from an API. This function stores that data into a file called members.json. 

### `getAutocompleteSuggestions()`
This section details the constants and functions in the `shared.js` file. It sends the member name and player tag. The value it passes is member.tag
---


# shared.js Explained

---

## Constants

- **`uniqueUsers`**: A set to store unique user identifiers.
- **`tzRoles`**: Maps timezone abbreviations to Discord role IDs.
- **`roleOptionsMap`**: Maps Discord role IDs to clan names.
- **`roleIds`**: Maps clan names to their corresponding Discord role IDs.
- **`familyRoleOptionsMap`**: Maps various family role types to Discord role IDs.
- **`selfPlayerOptionsMap`**: Maps player types (e.g., 'qc', 'hydra') to Discord role IDs.
- **`CLAN_DATA`**: Maps clan names to their respective Clash of Clans (CoC) clan tags.
- **`CAPITAL_DATA`**: Defines clan tags for clan capital participation tracking.
- **`clanlogoURL`**: Maps clan names to their logo URLs.
- **`API_KEY`**: The API key for accessing external CoC services.
- **`BASE_URL`**: The base URL for the CoC API.
- **`headers`**: Common HTTP headers used in API requests, including authorization and content type.
- **`CLAN_INFO`**: An array of objects, each containing detailed information about a clan, such as name, abbreviation, tag, icons, logos, and related Discord information.
- **`leagueEmojis`**: Maps CoC league names to corresponding Discord emoji strings.

---

## Function

- **`generateFileName(clanName, season)`**: Generates a filename for storing clan data based on the clan name and season.


---
