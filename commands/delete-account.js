const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const db = require("../database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("deleteaccount")
        .setDescription("Delete your account from the bot's database"),

    /**
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        const { user } = interaction;

        // Create confirmation button
        const deleteButton = new ButtonBuilder()
            .setCustomId('confirm-delete')
            .setLabel('Confirm Delete')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel-delete')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(deleteButton, cancelButton);

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('Delete Account')
            .setDescription('Are you sure you want to delete your account? This action cannot be undone.')
            .setTimestamp(new Date());

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const filter = i => i.user.id === user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm-delete') {
                try {
                    await db.deleteUser(user.id);
                    await i.update({ content: 'Your account has been deleted.', components: [], embeds: [] });
                } catch (error) {
                    await i.update({ content: `Error deleting your account: ${error.message}`, components: [], embeds: [] });
                }
            } else if (i.customId === 'cancel-delete') {
                await i.update({ content: 'Account deletion cancelled.', components: [], embeds: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'Account deletion timed out.', components: [], embeds: [] });
            }
        });
    }
};
