const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");
const ptero = require('../pterodactylApi');
const pagination = require("discord.js-pagination");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Manage your servers")
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
        ),

    /**
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        const { options, user, client } = interaction;
        const s = options.getSubcommand();

        switch (s) {
            case "create":
                const serverName = options.getString('name');
                const egg = options.getString('egg');
                const dockerImage = "quay.io/pterodactyl/core:debian"; // Default Docker image
                const startupCommand = "/start.sh"; // Default startup command

                // Check number of servers for non-admin users
                const servers = await db.getServersByUser(user.id);
                if (servers.length >= 2) {
                    return await interaction.reply({ content: 'You can only create a maximum of 2 servers.', ephemeral: true });
                }

                const serverData = {
                    name: serverName,
                    user: user.id, // Use Discord user ID
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
                        discord_id: user.id,
                        name: server.attributes.name
                    });
                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle('Server Created')
                        .setDescription(`Server **${server.attributes.name}** has been created successfully.`)
                        .setTimestamp(new Date());
                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    await user.send({
                        embeds: [new EmbedBuilder()
                            .setColor(0x0099ff)
                            .setTitle('Server Created')
                            .setDescription(`A new server named **${server.attributes.name}** has been created for you.`)
                            .setTimestamp(new Date())
                        ]
                    });
                } catch (error) {
                    await interaction.reply({ content: `Error creating server: ${error.message}`, ephemeral: true });
                }
                break;

            case "delete":
                const serverId = options.getString('serverid');
                try {
                    const server = await db.getServer(serverId);
                    if (!server || server.discord_id !== user.id) {
                        return await interaction.reply({ content: 'You do not have permission to delete this server.', ephemeral: true });
                    }

                    await ptero.deleteServer(serverId);
                    await db.deleteServer(serverId);
                    await interaction.reply({
                        embeds: [{
                            color: 0xff0000,
                            title: 'Server Deleted',
                            description: `Server with ID **${serverId}** has been deleted.`,
                            timestamp: new Date(),
                        }]
                    });

                    await user.send({
                        embeds: [{
                            color: 0xff0000,
                            title: 'Server Deleted',
                            description: `Your server with ID **${serverId}** has been deleted.`,
                            timestamp: new Date(),
                        }]
                    });
                } catch (error) {
                    await interaction.reply({ content: `Error deleting server: ${error.message}`, ephemeral: true });
                }
                break;

            case "update":
                const updateServerId = options.getString('serverid');
                const updatedServerData = {};
                if (options.getString('name')) updatedServerData.name = options.getString('name');
                if (options.getString('egg')) updatedServerData.egg = options.getString('egg');
                if (options.getString('docker-image')) updatedServerData.docker_image = options.getString('docker-image');
                if (options.getString('startup-command')) updatedServerData.startup = options.getString('startup-command');

                try {
                    const server = await db.getServer(updateServerId);
                    if (!server || server.discord_id !== user.id) {
                        return await interaction.reply({ content: 'You do not have permission to update this server.', ephemeral: true });
                    }

                    const updatedServer = await ptero.updateServer(updateServerId, updatedServerData);
                    await db.updateServer(updateServerId, updatedServerData);
                    await interaction.reply({
                        embeds: [{
                            color: 0x0099ff,
                            title: 'Server Updated',
                            description: `Server **${updatedServer.attributes.name}** has been updated successfully.`,
                            timestamp: new Date(),
                        }]
                    });

                    await user.send({
                        embeds: [{
                            color: 0x0099ff,
                            title: 'Server Updated',
                            description: `Your server **${updatedServer.attributes.name}** has been updated.`,
                            timestamp: new Date(),
                        }]
                    });
                } catch (error) {
                    await interaction.reply({ content: `Error updating server: ${error.message}`, ephemeral: true });
                }
                break;

            case "control":
                const controlServerId = options.getString('serverid');
                const action = options.getString('action');
                try {
                    const server = await db.getServer(controlServerId);
                    if (!server || server.discord_id !== user.id) {
                        return await interaction.reply({ content: 'You do not have permission to control this server.', ephemeral: true });
                    }

                    await ptero.controlServer(controlServerId, action);
                    const embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle('Server Control')
                        .setDescription(`Action **${action}** has been performed on server with ID **${controlServerId}**.`)
                        .setTimestamp(new Date());
                    await interaction.reply({ embeds: [embed] });

                    await user.send({
                        embeds: [{
                            color: 0x0099ff,
                            title: 'Server Control',
                            description: `Action **${action}** has been performed on your server with ID **${controlServerId}**.`,
                            timestamp: new Date(),
                        }]
                    });
                } catch (error) {
                    await interaction.reply({ content: `Error controlling server: ${error.message}`, ephemeral: true });
                }
                break;

            case "list":
                try {
                    const servers = await db.getServersByUser(user.id);
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
                    await interaction.reply({ content: `Error fetching servers: ${error.message}`, ephemeral: true });
                }
                break;
        }
    }
};
