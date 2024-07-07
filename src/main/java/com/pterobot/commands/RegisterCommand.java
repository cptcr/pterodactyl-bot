package com.yourpackage.commands;

import com.yourpackage.Database;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.sql.SQLException;

public class RegisterCommand extends ListenerAdapter {
    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        String[] args = event.getMessage().getContentRaw().split("\\s+");
        if (args[0].equalsIgnoreCase("/register")) {
            if (args.length != 6) {
                event.getChannel().sendMessage("Usage: /register <pterodactyl-id> <username> <email> <first_name> <last_name>").queue();
                return;
            }
            String discordId = event.getAuthor().getId();
            int pterodactylId = Integer.parseInt(args[1]);
            String username = args[2];
            String email = args[3];
            String firstName = args[4];
            String lastName = args[5];
            try {
                Database.addUser(discordId, pterodactylId, username, email, firstName, lastName);
                event.getChannel().sendMessage("You have been registered successfully!").queue();
            } catch (SQLException e) {
                event.getChannel().sendMessage("Error: " + e.getMessage()).queue();
            }
        }
    }
}
