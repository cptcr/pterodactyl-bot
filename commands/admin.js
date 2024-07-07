const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const db = require("../database");
const ptero = require('../pterodactylApi');
const pagination = require("discord.js-pagination");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Admin commands")
        .addSubcommandGroup(g => g
            .setName("servers")
            .setDescription("Manage Servers")
            .addSubcommand(x => x
                .setName("create")
                .setDescription("Create a server on the panel")
                .addStringOption(option => option.setName('name').setDescription('Server Name').setRequired(true))
                .addStringOption(option => option.setName('egg').setDescription('Egg type').setRequired(true).addChoices(
                    { name: "Generic Rust", value: "15" },
                    { name: "Generic Python", value: "16" },
                    { name: "Generic Nodemon", value: "17" },
                    { name: "Generic Node.js", value: "18" },
                    { name: "Generic Luvit", value: "19" },
                    { name: "Generic Java", value: "21" },
                    { name: "Generic Go", value: "22" },
                    { name: "Generic Elixir", value: "24" },
                    { name: "Generic Deno", value: "25" },
                    { name: "Generic C#", value: "26" },
                    { name: "Generic Dart", value: "27" },
                    { name: "Generic Bun", value: "28" },
                ))
                .addStringOption(option => option.setName('docker-image').setDescription('Docker Image').setRequired(true))
                .addStringOption(option => option.setName('startup-command').setDescription('Startup Command').setRequired(true))
            )
            .addSubcommand(c => c
                .setName("delete")
                .setDescription("Delete a server on the panel")
                .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
            )
            .addSubcommand(c => c
                .setName("update")
                .setDescription("Update a server on the panel")
                .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('Server Name').setRequired(false))
                .addStringOption(option => option.setName('egg').setDescription('Egg ID').setRequired(false))
                .addStringOption(option => option.setName('docker-image').setDescription('Docker Image').setRequired(false))
                .addStringOption(option => option.setName('startup-command').setDescription('Startup Command').setRequired(false))
            )
            .addSubcommand(c => c
                .setName("information")
                .setDescription("Get information about a server")
                .addStringOption(o => o.setName('serverid').setDescription("The Server ID").setRequired(true))
            )
            .addSubcommand(c => c
                .setName("control")
                .setDescription("Control a server")
                .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
                .addStringOption(option => option.setName('action').setDescription('Action to perform').setRequired(true).addChoices(
                    { name: "Start", value: "start" },
                    { name: "Stop", value: "stop" },
                    { name: "Restart", value: "restart" },
                    { name: "Kill", value: "kill" },
                ))
            )
            .addSubcommand(c => c
                .setName("list")
                .setDescription("List all your servers")
            )
        )
        .addSubcommandGroup(g => g
            .setName("users")
            .setDescription("Manage Users")
            .addSubcommand(x => x
                .setName("create")
                .setDescription("Create a new user")
                .addStringOption(option => option.setName('username').setDescription('Username').setRequired(true))
                .addStringOption(option => option.setName('email').setDescription('Email').setRequired(true))
                .addStringOption(option => option.setName('first_name').setDescription('First Name').setRequired(true))
                .addStringOption(option => option.setName('last_name').setDescription('Last Name').setRequired(true))
                .addStringOption(option => option.setName('password').setDescription('Password').setRequired(true))
            )
            .addSubcommand(c => c
                .setName("delete")
                .setDescription("Delete a user")
                .addStringOption(option => option.setName('userid').setDescription('User ID').setRequired(true))
            )
            .addSubcommand(c => c
                .setName("update")
                .setDescription("Update a user")
                .addStringOption(option => option.setName('userid').setDescription('User ID').setRequired(true))
                .addStringOption(option => option.setName('username').setDescription('New Username').setRequired(false))
                .addStringOption(option => option.setName('email').setDescription('New Email').setRequired(false))
                .addStringOption(option => option.setName('first_name').setDescription('New First Name').setRequired(false))
                .addStringOption(option => option.setName('last_name').setDescription('New Last Name').setRequired(false))
                .addStringOption(option => option.setName('password').setDescription('New Password').setRequired(false))
            )
            .addSubcommand(x => x
                .setName("display-all")
                .setDescription("Displays every user")
            )
        ),

    /**
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        const { options, member, client } = interaction;
        const g = options.getSubcommandGroup();
        const s = options.getSubcommand();

        const role = member.roles.cache.get(process.env.ADMIN_ROLE_ID);

        if (!role) {
            return await interaction.reply({
                content: "You are not allowed to execute these commands!",
                ephemeral: true
            });
        }

        switch (g) {
            case "servers":
                switch (s) {
                    case "create":
                        const serverName = options.getString('name');
                        const egg = options.getString('egg');
                        const dockerImage = options.getString('docker-image');
                        const startupCommand = options.getString('startup-command');
                        const targetUser = await db.getUser(member.id);

                        if (!targetUser) {
                            return await interaction.reply({ content: 'Target user not found in the database.', ephemeral: true });
                        }

                        const serverData = {
                            name: serverName,
                            user: targetUser.pterodactyl_id, // Use Pterodactyl user ID from the database
                            egg: egg,
                            docker_image: dockerImage,
                            startup: startupCommand,
                            limits: { memory: 512, swap: 0, disk: 1024, io: 500, cpu: 30 },
                            feature_limits: { backups: 1, databases: 1, allocations: 2 },
                            environment: {},
                            start_on_completion: true,
                        };

                        try {
                            const server = await ptero.createServer(serverData);
                            await db.registerServer({
                                server_id: server.attributes.id,
                                discord_id: member.id,
                                name: server.attributes.name
                            });
                            const embed = new EmbedBuilder()
                                .setColor(0x0099ff)
                                .setTitle('Server Created')
                                .setDescription(`Server **${server.attributes.name}** has been created successfully.`)
                                .setTimestamp(new Date());
                            await interaction.reply({ embeds: [embed], ephemeral: true });

                            const discordUser = await client.users.fetch(member.id);
                            await discordUser.send({
                                embeds: [{
                                    color: 0x0099ff,
                                    title: 'Server Created',
                                    description: `A new server named **${server.attributes.name}** has been created for you.`,
                                    timestamp: new Date(),
                                }]
                            });
                        } catch (error) {
                            await interaction.reply(`Error creating server: ${error.message}`);
                        }
                        break;

                    case "delete":
                        const serverId = options.getString('serverid');
                        try {
                            await ptero.deleteServer(serverId);
                            await interaction.reply({
                                embeds: [{
                                    color: 0xff0000,
                                    title: 'Server Deleted',
                                    description: `Server with ID **${serverId}** has been deleted.`,
                                    timestamp: new Date(),
                                }]
                            });

                            const discordUser = await client.users.fetch(member.id);
                            await discordUser.send({
                                embeds: [{
                                    color: 0xff0000,
                                    title: 'Server Deleted',
                                    description: `Your server with ID **${serverId}** has been deleted.`,
                                    timestamp: new Date(),
                                }]
                            });
                        } catch (error) {
                            await interaction.reply(`Error deleting server: ${error.message}`);
                        }
                        break;

                    case "update":
                        const updateServerId = options.getString('serverid');
                        const updatedServerData = {};
                        const updateUser = await db.getUser(member.id);
                        
                        if (!updateUser) {
                            return await interaction.reply({ content: 'Target user not found in the database.', ephemeral: true });
                        }

                        if (options.getString('name')) updatedServerData.name = options.getString('name');
                        if (options.getString('egg')) updatedServerData.egg = options.getString('egg');
                        if (options.getString('docker-image')) updatedServerData.docker_image = options.getString('docker-image');
                        if (options.getString('startup-command')) updatedServerData.startup = options.getString('startup-command');

                        try {
                            const updatedServer = await ptero.updateServer(updateServerId, updatedServerData);
                            await interaction.reply({
                                embeds: [{
                                    color: 0x0099ff,
                                    title: 'Server Updated',
                                    description: `Server **${updatedServer.attributes.name}** has been updated successfully.`,
                                    timestamp: new Date(),
                                }]
                            });

                            const discordUser = await client.users.fetch(member.id);
                            await discordUser.send({
                                embeds: [{
                                    color: 0x0099ff,
                                    title: 'Server Updated',
                                    description: `Your server **${updatedServer.attributes.name}** has been updated.`,
                                    timestamp: new Date(),
                                }]
                            });
                        } catch (error) {
                            await interaction.reply(`Error updating server: ${error.message}`);
                        }
                        break;

                    case "information":
                        const infoServerId = options.getString('serverid');
                        try {
                            const server = await ptero.getServerDetails(infoServerId);
                            const embed = new EmbedBuilder()
                                .setColor(0x0099ff)
                                .setTitle('Server Information')
                                .addFields(
                                    { name: 'Name', value: server.attributes.name, inline: true },
                                    { name: 'ID', value: server.attributes.id, inline: true },
                                    { name: 'Owner ID', value: server.attributes.user, inline: true },
                                    { name: 'Egg ID', value: server.attributes.egg, inline: true },
                                    { name: 'Docker Image', value: server.attributes.docker_image, inline: true },
                                    { name: 'Startup Command', value: server.attributes.startup, inline: true },
                                )
                                .setTimestamp(new Date());
                            await interaction.reply({ embeds: [embed] });
                        } catch (error) {
                            await interaction.reply(`Error fetching server information: ${error.message}`);
                        }
                        break;

                    case "control":
                        const controlServerId = options.getString('serverid');
                        const action = options.getString('action');
                        try {
                            const response = await ptero.controlServer(controlServerId, action);
                            const embed = new EmbedBuilder()
                                .setColor(0x0099ff)
                                .setTitle('Server Control')
                                .setDescription(`Action **${action}** has been performed on server with ID **${controlServerId}**.`)
                                .setTimestamp(new Date());
                            await interaction.reply({ embeds: [embed] });

                            const discordUser = await client.users.fetch(member.id);
                            await discordUser.send({
                                embeds: [{
                                    color: 0x0099ff,
                                    title: 'Server Control',
                                    description: `Action **${action}** has been performed on your server with ID **${controlServerId}**.`,
                                    timestamp: new Date(),
                                }]
                            });
                        } catch (error) {
                            await interaction.reply(`Error controlling server: ${error.message}`);
                        }
                        break;

                    case "list":
                        try {
                            const servers = await db.getServersByUser(member.id);
                            if (!servers.length) {
                                return interaction.reply({ content: 'You have no servers.', ephemeral: true });
                            }

                            const embeds = servers.map(server => new EmbedBuilder()
                                .setColor(0x0099ff)
                                .setTitle('Server Details')
                                .addFields(
                                    { name: 'Name', value: server.name, inline: true },
                                    { name: 'ID', value: server.server_id, inline: true },
                                )
                                .setTimestamp(new Date())
                            );

                            await pagination(interaction, embeds);
                        } catch (error) {
                            await interaction.reply(`Error fetching servers: ${error.message}`);
                        }
                        break;
                }
                break;

            case "users":
                switch (s) {
                    case "create":
                        const userData = {
                            username: options.getString('username'),
                            email: options.getString('email'),
                            first_name: options.getString('first_name'),
                            last_name: options.getString('last_name'),
                            password: options.getString('password'),
                            root_admin: false,
                            language: 'en'
                        };

                        try {
                            const user = await ptero.createUser(userData);
                            await db.registerUser({
                                discord_id: member.id,
                                pterodactyl_id: user.attributes.id,
                                username: user.attributes.username,
                                email: user.attributes.email,
                                first_name: user.attributes.first_name,
                                last_name: user.attributes.last_name
                            });

                            const embed = new EmbedBuilder()
                                .setColor(0x0099ff)
                                .setTitle('User Created')
                                .setDescription(`User **${user.attributes.username}** has been created successfully.`)
                                .setTimestamp(new Date());
                            await interaction.reply({ embeds: [embed] });

                            const discordUser = await client.users.fetch(member.id);
                            await discordUser.send({
                                embeds: [{
                                    color: 0x0099ff,
                                    title: 'User Created',
                                    description: `A new user account named **${user.attributes.username}** has been created for you.`,
                                    timestamp: new Date(),
                                }]
                            });
                        } catch (error) {
                            await interaction.reply(`Error creating user: ${error.message}`);
                        }
                        break;

                    case "delete":
                        const userId = options.getString('userid');
                        const deleteUser = await db.getUser(member.id);

                        if (!deleteUser) {
                            return await interaction.reply({ content: 'Target user not found in the database.', ephemeral: true });
                        }

                        try {
                            await ptero.deleteUser(userId);
                            await interaction.reply({
                                embeds: [{
                                    color: 0xff0000,
                                    title: 'User Deleted',
                                    description: `User with ID **${userId}** has been deleted.`,
                                    timestamp: new Date(),
                                }]
                            });

                            const discordUser = await client.users.fetch(member.id);
                            await discordUser.send({
                                embeds: [{
                                    color: 0xff0000,
                                    title: 'User Deleted',
                                    description: `Your user account with ID **${userId}** has been deleted.`,
                                    timestamp: new Date(),
                                }]
                            });
                        } catch (error) {
                            await interaction.reply(`Error deleting user: ${error.message}`);
                        }
                        break;

                    case "update":
                        const updateUserId = options.getString('userid');
                        const updatedUserData = {};
                        const updateUser = await db.getUser(member.id);

                        if (!updateUser) {
                            return await interaction.reply({ content: 'Target user not found in the database.', ephemeral: true });
                        }

                        if (options.getString('username')) updatedUserData.username = options.getString('username');
                        if (options.getString('email')) updatedUserData.email = options.getString('email');
                        if (options.getString('first_name')) updatedUserData.first_name = options.getString('first_name');
                        if (options.getString('last_name')) updatedUserData.last_name = options.getString('last_name');
                        if (options.getString('password')) updatedUserData.password = options.getString('password');

                        try {
                            const updatedUser = await ptero.updateUser(updateUserId, updatedUserData);
                            await interaction.reply({
                                embeds: [{
                                    color: 0x0099ff,
                                    title: 'User Updated',
                                    description: `User **${updatedUser.attributes.username}** has been updated successfully.`,
                                    fields: [
                                        { name: 'Username', value: updatedUser.attributes.username, inline: true },
                                        { name: 'Email', value: updatedUser.attributes.email, inline: true },
                                        { name: 'First Name', value: updatedUser.attributes.first_name, inline: true },
                                        { name: 'Last Name', value: updatedUser.attributes.last_name, inline: true },
                                    ],
                                    timestamp: new Date(),
                                }]
                            });

                            const discordUser = await client.users.fetch(member.id);
                            await discordUser.send({
                                embeds: [{
                                    color: 0x0099ff,
                                    title: 'User Updated',
                                    description: `Your user account **${updatedUser.attributes.username}** has been updated.`,
                                    timestamp: new Date(),
                                }]
                            });
                        } catch (error) {
                            await interaction.reply(`Error updating user: ${error.message}`);
                        }
                        break;

                    case "display-all":
                        try {
                            const users = await db.getAllUsers();
                            if (!users.length) {
                                return interaction.reply({ content: 'No users found.', ephemeral: true });
                            }

                            const embeds = users.map(user => new EmbedBuilder()
                                .setColor(0x0099ff)
                                .setTitle('User Details')
                                .addFields(
                                    { name: 'Username', value: user.username, inline: true },
                                    { name: 'Email', value: user.email, inline: true },
                                    { name: 'First Name', value: user.first_name, inline: true },
                                    { name: 'Last Name', value: user.last_name, inline: true },
                                )
                                .setTimestamp(new Date())
                            );

                            await pagination(interaction, embeds);
                        } catch (error) {
                            await interaction.reply(`Error fetching users: ${error.message}`);
                        }
                        break;
                }
                break;

            default:
                return await interaction.reply({
                    content: "This command does not exist.",
                    ephemeral: true
                });
        }
    }
};
