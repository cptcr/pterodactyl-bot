package com.yourpackage.commands;

import com.yourpackage.Database;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.sql.SQLException;

public class DeleteAccountCommand extends ListenerAdapter {
    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        String[] args = event.getMessage().getContentRaw().split("\\s+");
        if (args[0].equalsIgnoreCase("/deleteaccount")) {
            String discordId = event.getAuthor().getId();
            event.getChannel().sendMessage("Are you sure you want to delete your account? Type 'confirm' to proceed.").queue();
            event.getChannel().addMessageListener(message -> {
                if (message.getAuthor().getId().equals(discordId) && message.getContentRaw().equalsIgnoreCase("confirm")) {
                    try {
                        Database.deleteUser(discordId);
                        event.getChannel().sendMessage("Your account has been deleted.").queue();
                    } catch (SQLException e) {
                        event.getChannel().sendMessage("Error: " + e.getMessage()).queue();
                    }
                }
            });
        }
    }
}
