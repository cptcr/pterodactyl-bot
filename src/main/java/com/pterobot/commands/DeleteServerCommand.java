package com.yourpackage.commands;

import com.yourpackage.Database;
import com.yourpackage.PterodactylApi;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.sql.ResultSet;
import java.sql.SQLException;

public class DeleteServerCommand extends ListenerAdapter {
    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        String[] args = event.getMessage().getContentRaw().split("\\s+");
        if (args[0].equalsIgnoreCase("/delete-server")) {
            if (args.length != 2) {
                event.getChannel().sendMessage("Usage: /delete-server <server-id>").queue();
                return;
            }
            String discordId = event.getAuthor().getId();
            String serverId = args[1];

            try {
                ResultSet server = Database.getServer(serverId);
                if (!server.next() || !server.getString("discord_id").equals(discordId)) {
                    event.getChannel().sendMessage("You do not have permission to delete this server.").queue();
                    return;
                }

                if (PterodactylApi.deleteServer(serverId)) {
                    Database.deleteServer(serverId);
                    event.getChannel().sendMessage("Server with ID " + serverId + " has been deleted.").queue();
                } else {
                    event.getChannel().sendMessage("Error deleting server.").queue();
                }
            } catch (SQLException | Exception e) {
                event.getChannel().sendMessage("Error: " + e.getMessage()).queue();
            }
        }
    }
}
