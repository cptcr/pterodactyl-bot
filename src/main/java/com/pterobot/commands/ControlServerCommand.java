package com.yourpackage.commands;

import com.yourpackage.Database;
import com.yourpackage.PterodactylApi;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ControlServerCommand extends ListenerAdapter {
    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        String[] args = event.getMessage().getContentRaw().split("\\s+");
        if (args[0].equalsIgnoreCase("/control-server")) {
            if (args.length != 3) {
                event.getChannel().sendMessage("Usage: /control-server <server-id> <action>").queue();
                return;
            }
            String discordId = event.getAuthor().getId();
            String serverId = args[1];
            String action = args[2];

            try {
                ResultSet server = Database.getServer(serverId);
                if (!server.next() || !server.getString("discord_id").equals(discordId)) {
                    event.getChannel().sendMessage("You do not have permission to control this server.").queue();
                    return;
                }

                String response = PterodactylApi.controlServer(serverId, action);
                event.getChannel().sendMessage("Action " + action + " has been performed on server with ID " + serverId + ".").queue();
            } catch (SQLException | Exception e) {
                event.getChannel().sendMessage("Error: " + e.getMessage()).queue();
            }
        }
    }
}
