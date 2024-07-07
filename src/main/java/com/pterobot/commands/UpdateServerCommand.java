package com.yourpackage.commands;

import com.yourpackage.Database;
import com.yourpackage.PterodactylApi;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.json.JSONObject;

import java.sql.ResultSet;
import java.sql.SQLException;

public class UpdateServerCommand extends ListenerAdapter {
    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        String[] args = event.getMessage().getContentRaw().split("\\s+");
        if (args[0].equalsIgnoreCase("/update-server")) {
            if (args.length < 2) {
                event.getChannel().sendMessage("Usage: /update-server <server-id> [name=<new name>] [egg=<new egg>] [docker_image=<new image>] [startup_command=<new command>]").queue();
                return;
            }
            String discordId = event.getAuthor().getId();
            String serverId = args[1];

            try {
                ResultSet server = Database.getServer(serverId);
                if (!server.next() || !server.getString("discord_id").equals(discordId)) {
                    event.getChannel().sendMessage("You do not have permission to update this server.").queue();
                    return;
                }

                JSONObject updatedServerData = new JSONObject();
                for (int i = 2; i < args.length; i++) {
                    String[] param = args[i].split("=");
                    if (param.length == 2) {
                        updatedServerData.put(param[0], param[1]);
                    }
                }

                String response = PterodactylApi.updateServer(serverId, updatedServerData.toString());
                JSONObject updatedServer = new JSONObject(response).getJSONObject("attributes");
                event.getChannel().sendMessage("Server " + updatedServer.getString("name") + " has been updated successfully.").queue();
            } catch (SQLException | Exception e) {
                event.getChannel().sendMessage("Error: " + e.getMessage()).queue();
            }
        }
    }
}
