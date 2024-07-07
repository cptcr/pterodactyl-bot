package com.yourpackage.commands;

import com.yourpackage.Database;
import com.yourpackage.PterodactylApi;
import net.dv8tion.jda.api.events.message.MessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;
import org.json.JSONObject;

import java.sql.ResultSet;
import java.sql.SQLException;

public class CreateServerCommand extends ListenerAdapter {
    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        String[] args = event.getMessage().getContentRaw().split("\\s+");
        if (args[0].equalsIgnoreCase("/create-server")) {
            if (args.length != 3) {
                event.getChannel().sendMessage("Usage: /create-server <name> <egg>").queue();
                return;
            }
            String discordId = event.getAuthor().getId();
            String name = args[1];
            String egg = args[2];

            try {
                ResultSet user = Database.getUser(discordId);
                if (!user.next()) {
                    event.getChannel().sendMessage("You need to register first.").queue();
                    return;
                }

                ResultSet servers = Database.getServersByUser(discordId);
                if (servers.last() && servers.getRow() >= 2) {
                    event.getChannel().sendMessage("You can only create a maximum of 2 servers.").queue();
                    return;
                }

                JSONObject serverData = new JSONObject();
                serverData.put("name", name);
                serverData.put("user", user.getInt("pterodactyl_id"));
                serverData.put("egg", egg);
                serverData.put("docker_image", "quay.io/pterodactyl/core:debian");
                serverData.put("startup", "/start.sh");
                serverData.put("limits", new JSONObject().put("memory", 512).put("swap", 0).put("disk", 1024).put("io", 500).put("cpu", 30));
                serverData.put("feature_limits", new JSONObject().put("backups", 1).put("databases", 1).put("allocations", 2));
                serverData.put("environment", new JSONObject());
                serverData.put("start_on_completion", true);

                String response = PterodactylApi.createServer(serverData.toString());
                JSONObject server = new JSONObject(response).getJSONObject("attributes");
                Database.addServer(server.getString("id"), discordId, server.getString("name"));
                event.getChannel().sendMessage("Server " + server.getString("name") + " has been created successfully.").queue();
            } catch (SQLException | Exception e) {
                event.getChannel().sendMessage("Error: " + e.getMessage()).queue();
            }
        }
    }
}
