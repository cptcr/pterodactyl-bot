package com.yourpackage;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;

public class PterodactylApi {

    private static final String PTERODACTYL_URL = "https://your-pterodactyl-panel-url";
    private static final String PTERODACTYL_API_KEY = "your-pterodactyl-api-key";
    private static final HttpClient client = HttpClient.newHttpClient();

    public static String createServer(String json) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(PTERODACTYL_URL + "/api/application/servers"))
                .header("Authorization", "Bearer " + PTERODACTYL_API_KEY)
                .header("Accept", "Application/vnd.pterodactyl.v1+json")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        return response.body();
    }

    public static boolean deleteServer(String serverId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(PTERODACTYL_URL + "/api/application/servers/" + serverId))
                .header("Authorization", "Bearer " + PTERODACTYL_API_KEY)
                .header("Accept", "Application/vnd.pterodactyl.v1+json")
                .DELETE()
                .build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        return response.statusCode() == 204;
    }

    public static String updateServer(String serverId, String json) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(PTERODACTYL_URL + "/api/application/servers/" + serverId + "/details"))
                .header("Authorization", "Bearer " + PTERODACTYL_API_KEY)
                .header("Accept", "Application/vnd.pterodactyl.v1+json")
                .header("Content-Type", "application/json")
                .PATCH(HttpRequest.BodyPublishers.ofString(json))
                .build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        return response.body();
    }

    public static String getServerDetails(String serverId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(PTERODACTYL_URL + "/api/application/servers/" + serverId))
                .header("Authorization", "Bearer " + PTERODACTYL_API_KEY)
                .header("Accept", "Application/vnd.pterodactyl.v1+json")
                .build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        return response.body();
    }

    public static String controlServer(String serverId, String action) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(PTERODACTYL_URL + "/api/client/servers/" + serverId + "/power"))
                .header("Authorization", "Bearer " + PTERODACTYL_API_KEY)
                .header("Accept", "Application/vnd.pterodactyl.v1+json")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"signal\": \"" + action + "\"}"))
                .build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        return response.body();
    }
}
