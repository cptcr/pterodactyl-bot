import sqlite3

conn = sqlite3.connect('pterodactylBot.db')
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    pterodactyl_id INTEGER,
    username TEXT,
    email TEXT,
    first_name TEXT,
    last_name TEXT
)''')

c.execute('''CREATE TABLE IF NOT EXISTS servers (
    server_id TEXT PRIMARY KEY,
    discord_id TEXT,
    name TEXT,
    FOREIGN KEY (discord_id) REFERENCES users (discord_id)
)''')

conn.commit()

def register_user(user):
    with conn:
        c.execute("INSERT INTO users (discord_id, pterodactyl_id, username, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)", 
                  (user['discord_id'], user['pterodactyl_id'], user['username'], user['email'], user['first_name'], user['last_name']))

def get_user(discord_id):
    c.execute("SELECT * FROM users WHERE discord_id = ?", (discord_id,))
    return c.fetchone()

def register_server(server):
    with conn:
        c.execute("INSERT INTO servers (server_id, discord_id, name) VALUES (?, ?, ?)", 
                  (server['server_id'], server['discord_id'], server['name']))

def get_server(server_id):
    c.execute("SELECT * FROM servers WHERE server_id = ?", (server_id,))
    return c.fetchone()

def delete_server(server_id):
    with conn:
        c.execute("DELETE FROM servers WHERE server_id = ?", (server_id,))

def get_servers_by_user(discord_id):
    c.execute("SELECT * FROM servers WHERE discord_id = ?", (discord_id,))
    return c.fetchall()

def get_all_users():
    c.execute("SELECT * FROM users")
    return c.fetchall()

def add_discord_user(discord_id, pterodactyl_id, username, email, first_name, last_name):
    with conn:
        c.execute("INSERT INTO users (discord_id, pterodactyl_id, username, email, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)", 
                  (discord_id, pterodactyl_id, username, email, first_name, last_name))

def delete_user(discord_id):
    with conn:
        c.execute("DELETE FROM users WHERE discord_id = ?", (discord_id,))
