package com.yourpackage;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class Database {

    private static final String DB_URL = "jdbc:sqlite:pterodactylBot.db";

    public static void init() throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt1 = conn.prepareStatement(
                     "CREATE TABLE IF NOT EXISTS users (" +
                             "discord_id TEXT PRIMARY KEY, " +
                             "pterodactyl_id INTEGER, " +
                             "username TEXT, " +
                             "email TEXT, " +
                             "first_name TEXT, " +
                             "last_name TEXT)"
             );
             PreparedStatement stmt2 = conn.prepareStatement(
                     "CREATE TABLE IF NOT EXISTS servers (" +
                             "server_id TEXT PRIMARY KEY, " +
                             "discord_id TEXT, " +
                             "name TEXT, " +
                             "FOREIGN KEY (discord_id) REFERENCES users (discord_id))"
             )) {
            stmt1.execute();
            stmt2.execute();
        }
    }

    public static void addUser(String discordId, int pterodactylId, String username, String email, String firstName, String lastName) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(
                     "INSERT INTO users (discord_id, pterodactyl_id, username, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)"
             )) {
            stmt.setString(1, discordId);
            stmt.setInt(2, pterodactylId);
            stmt.setString(3, username);
            stmt.setString(4, email);
            stmt.setString(5, firstName);
            stmt.setString(6, lastName);
            stmt.executeUpdate();
        }
    }

    public static ResultSet getUser(String discordId) throws SQLException {
        Connection conn = DriverManager.getConnection(DB_URL);
        PreparedStatement stmt = conn.prepareStatement(
                "SELECT * FROM users WHERE discord_id = ?"
        );
        stmt.setString(1, discordId);
        return stmt.executeQuery();
    }

    public static void addServer(String serverId, String discordId, String name) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(
                     "INSERT INTO servers (server_id, discord_id, name) VALUES (?, ?, ?)"
             )) {
            stmt.setString(1, serverId);
            stmt.setString(2, discordId);
            stmt.setString(3, name);
            stmt.executeUpdate();
        }
    }

    public static ResultSet getServer(String serverId) throws SQLException {
        Connection conn = DriverManager.getConnection(DB_URL);
        PreparedStatement stmt = conn.prepareStatement(
                "SELECT * FROM servers WHERE server_id = ?"
        );
        stmt.setString(1, serverId);
        return stmt.executeQuery();
    }

    public static void deleteServer(String serverId) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(
                     "DELETE FROM servers WHERE server_id = ?"
             )) {
            stmt.setString(1, serverId);
            stmt.executeUpdate();
        }
    }

    public static ResultSet getServersByUser(String discordId) throws SQLException {
        Connection conn = DriverManager.getConnection(DB_URL);
        PreparedStatement stmt = conn.prepareStatement(
                "SELECT * FROM servers WHERE discord_id = ?"
        );
        stmt.setString(1, discordId);
        return stmt.executeQuery();
    }

    public static void deleteUser(String discordId) throws SQLException {
        try (Connection conn = DriverManager.getConnection(DB_URL);
             PreparedStatement stmt = conn.prepareStatement(
                     "DELETE FROM users WHERE discord_id = ?"
             )) {
            stmt.setString(1, discordId);
            stmt.executeUpdate();
        }
    }
}
