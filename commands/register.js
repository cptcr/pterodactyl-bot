const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Register yourself with the bot")
        .addStringOption(option => 
            option.setName('pterodactyl-id')
            .setDescription('Your Pterodactyl panel user ID')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('username')
            .setDescription('Your Pterodactyl panel username')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('email')
            .setDescription('Your Pterodactyl panel email')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('first_name')
            .setDescription('Your first name')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('last_name')
            .setDescription('Your last name')
            .setRequired(true)),

    /**
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        const { options, user } = interaction;

        const pterodactylId = options.getString('pterodactyl-id');
        const username = options.getString('username');
        const email = options.getString('email');
        const firstName = options.getString('first_name');
        const lastName = options.getString('last_name');

        try {
            await db.addDiscordUser(user.id, pterodactylId, username, email, firstName, lastName);

            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Registration Successful')
                .setDescription(`You have been registered successfully!`)
                .addFields(
                    { name: 'Pterodactyl ID', value: pterodactylId, inline: true },
                    { name: 'Username', value: username, inline: true },
                    { name: 'Email', value: email, inline: true },
                    { name: 'First Name', value: firstName, inline: true },
                    { name: 'Last Name', value: lastName, inline: true },
                )
                .setTimestamp(new Date());

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `Error during registration: ${error.message}`, ephemeral: true });
        }
    }
};
