const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pterodactylBot.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        discord_id TEXT PRIMARY KEY,
        pterodactyl_id INTEGER,
        username TEXT,
        email TEXT,
        first_name TEXT,
        last_name TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS servers (
        server_id TEXT PRIMARY KEY,
        discord_id TEXT,
        name TEXT,
        FOREIGN KEY (discord_id) REFERENCES users (discord_id)
    )`);
});

function registerUser(user) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`INSERT INTO users (discord_id, pterodactyl_id, username, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)`);
        stmt.run(user.discord_id, user.pterodactyl_id, user.username, user.email, user.first_name, user.last_name, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID);
        });
        stmt.finalize();
    });
}

function getUser(discordId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE discord_id = ?`, [discordId], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

function registerServer(server) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`INSERT INTO servers (server_id, discord_id, name) VALUES (?, ?, ?)`);
        stmt.run(server.server_id, server.discord_id, server.name, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID);
        });
        stmt.finalize();
    });
}

function getServer(serverId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM servers WHERE server_id = ?`, [serverId], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

function deleteServer(serverId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`DELETE FROM servers WHERE server_id = ?`);
        stmt.run(serverId, function (err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
        stmt.finalize();
    });
}

function getServersByUser(discordId) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM servers WHERE discord_id = ?`, [discordId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function getAllUsers() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users`, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

function addDiscordUser(discordId, pterodactylId, username, email, firstName, lastName) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`INSERT INTO users (discord_id, pterodactyl_id, username, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)`);
        stmt.run(discordId, pterodactylId, username, email, firstName, lastName, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID);
        });
        stmt.finalize();
    });
}

function deleteUser(discordId) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`DELETE FROM users WHERE discord_id = ?`);
        stmt.run(discordId, function (err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
        stmt.finalize();
    });
}

module.exports = { registerUser, getUser, registerServer, getServer, deleteServer, getServersByUser, getAllUsers, addDiscordUser, deleteUser };
