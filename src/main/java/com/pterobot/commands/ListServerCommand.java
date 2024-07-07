package com.yourpackage.commands;

import com.yourpackage.Database;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ListServersCommand extends ListenerAdapter {
    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        String[] args = event.getMessage().getContentRaw().split("\\s+");
        if (args[0].equalsIgnoreCase("/list-servers")) {
            String discordId = event.getAuthor().getId();
            try {
                ResultSet servers = Database.getServersByUser(discordId);
                if (!servers.next()) {
                    event.getChannel().sendMessage("You have no servers.").queue();
                } else {
                    do {
                        event.getChannel().sendMessage("Server Name: " + servers.getString("name") + ", Server ID: " + servers.getString("server_id")).queue();
                    } while (servers.next());
                }
            } catch (SQLException e) {
                event.getChannel().sendMessage("Error: " + e.getMessage()).queue();
            }
        }
    }
}
