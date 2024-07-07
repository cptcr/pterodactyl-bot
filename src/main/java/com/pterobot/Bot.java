package com.yourpackage;

import com.yourpackage.commands.*;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;

import javax.security.auth.login.LoginException;
import java.sql.SQLException;

public class Bot {

    public static void main(String[] args) throws LoginException, SQLException {
        Database.init();
        
        JDA jda = JDABuilder.createDefault("your-discord-bot-token")
                .setActivity(Activity.playing("Managing Pterodactyl Servers"))
                .addEventListeners(new RegisterCommand())
                .addEventListeners(new DeleteAccountCommand())
                .addEventListeners(new CreateServerCommand())
                .addEventListeners(new DeleteServerCommand())
                .addEventListeners(new UpdateServerCommand())
                .addEventListeners(new ControlServerCommand())
                .addEventListeners(new ListServersCommand())
                .build();
    }
}
