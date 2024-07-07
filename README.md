# Pterodactyl Discord Bot

A Discord bot for managing Pterodactyl panel users and servers.

## Features
- Create, update, and delete users on the Pterodactyl panel.
- Create, update, and delete servers on the Pterodactyl panel.
- Automatically notify users of changes via direct messages.
- Display user and server details in Discord.

## Prerequisites

- Node.js
- SQLite3
- Pterodactyl panel API key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/cptcr/pterodactyl-bot.git
cd pterodactyl-bot
```

Install dependencies:

```bash
npm install
```
Set up the SQLite database:

```
node setupDatabase.js
```
Create a .env file with the following content:

```js
DISCORD_TOKEN=your-discord-bot-token
PTERODACTYL_API_KEY=your-pterodactyl-api-key
PTERODACTYL_URL=https://your-pterodactyl-url
CLIENT_ID=
GUILD_ID=
ADMIN_ROLE_ID=your-admin-role-id
```
Run the bot:

```bash
node index.js
```

# Commands Table


| Command                         | Description                                         | Options                                                                                                         |
|---------------------------------|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `/admin servers create`         | Create a server on the panel                        | `name` (Server Name, required) <br> `egg` (Egg type, required) <br> `docker-image` (Docker Image, required) <br> `startup-command` (Startup Command, required) |
| `/admin servers delete`         | Delete a server on the panel                        | `serverid` (Server ID, required)                                                                               |
| `/admin servers update`         | Update a server on the panel                        | `serverid` (Server ID, required) <br> `name` (New Server Name, optional) <br> `egg` (New Egg ID, optional) <br> `docker-image` (New Docker Image, optional) <br> `startup-command` (New Startup Command, optional) |
| `/admin servers information`    | Get information about a server                      | `serverid` (Server ID, required)                                                                               |
| `/admin servers control`        | Control a server (start, stop, restart, kill)       | `serverid` (Server ID, required) <br> `action` (Action to perform: start, stop, restart, kill, required)        |
| `/admin servers list`           | List all your servers                               | None                                                                                                           |
| `/admin users create`           | Create a new user                                   | `username` (Username, required) <br> `email` (Email, required) <br> `first_name` (First Name, required) <br> `last_name` (Last Name, required) <br> `password` (Password, required) |
| `/admin users delete`           | Delete a user                                       | `userid` (User ID, required)                                                                                   |
| `/admin users update`           | Update a user                                       | `userid` (User ID, required) <br> `username` (New Username, optional) <br> `email` (New Email, optional) <br> `first_name` (New First Name, optional) <br> `last_name` (New Last Name, optional) <br> `password` (New Password, optional) |
| `/admin users display-all`      | Display all users                                   | None                                                                                                           |
| `/register`                     | Register yourself with the bot                      | `pterodactyl-id` (Pterodactyl ID, required) <br> `username` (Username, required) <br> `email` (Email, required) <br> `first_name` (First Name, required) <br> `last_name` (Last Name, required) |
| `/deleteaccount`                | Delete your account from the bot's database         | None                                                                                                           |
| `/server create`                | Create a server on the panel                        | `name` (Server Name, required) <br> `egg` (Egg type, required)                                                                                     |
| `/server delete`                | Delete your server                                  | `serverid` (Server ID, required)                                                                               |
| `/server update`                | Update your server                                  | `serverid` (Server ID, required) <br> `name` (New Server Name, optional) <br> `egg` (New Egg ID, optional) <br> `docker-image` (New Docker Image, optional) <br> `startup-command` (New Startup Command, optional) |
| `/server control`               | Control your server (start, stop, restart, kill)    | `serverid` (Server ID, required) <br> `action` (Action to perform: start, stop, restart, kill, required)       |
| `/server list`                  | List all your servers                               | None                                                                                                           |


# Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

# License
This project is licensed under the Apache-2.0 License. See the LICENSE file for details.




