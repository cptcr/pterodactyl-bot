import discord
from discord.ext import commands
import database as db
import pterodactyl_api as ptero

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='/', intents=intents)

@bot.event
async def on_ready():
    print(f'Logged in as {bot.user}')

@bot.command()
async def register(ctx, pterodactyl_id: str, username: str, email: str, first_name: str, last_name: str):
    user = {
        'discord_id': str(ctx.author.id),
        'pterodactyl_id': pterodactyl_id,
        'username': username,
        'email': email,
        'first_name': first_name,
        'last_name': last_name
    }
    db.add_discord_user(**user)
    await ctx.send(f'{ctx.author.mention}, you have been registered successfully!')

@bot.command()
async def deleteaccount(ctx):
    def check(m):
        return m.author == ctx.author and m.channel == ctx.channel

    await ctx.send(f'{ctx.author.mention}, are you sure you want to delete your account? Type "confirm" to proceed.')
    msg = await bot.wait_for('message', check=check)
    
    if msg.content.lower() == 'confirm':
        db.delete_user(str(ctx.author.id))
        await ctx.send(f'{ctx.author.mention}, your account has been deleted.')
    else:
        await ctx.send(f'{ctx.author.mention}, account deletion cancelled.')

@bot.command()
async def create_server(ctx, name: str, egg: str):
    user = db.get_user(str(ctx.author.id))
    if not user:
        return await ctx.send(f'{ctx.author.mention}, you need to register first.')

    servers = db.get_servers_by_user(str(ctx.author.id))
    if len(servers) >= 2:
        return await ctx.send(f'{ctx.author.mention}, you can only create a maximum of 2 servers.')

    server_data = {
        'name': name,
        'user': user[1],
        'egg': egg,
        'docker_image': 'quay.io/pterodactyl/core:debian',
        'startup': '/start.sh',
        'limits': {'memory': 512, 'swap': 0, 'disk': 1024, 'io': 500, 'cpu': 30},
        'feature_limits': {'backups': 1, 'databases': 1, 'allocations': 2},
        'environment': {},
        'start_on_completion': True,
    }
    
    try:
        server = ptero.create_server(server_data)
        db.register_server({
            'server_id': server['attributes']['id'],
            'discord_id': str(ctx.author.id),
            'name': server['attributes']['name']
        })
        await ctx.send(f'{ctx.author.mention}, server **{server["attributes"]["name"]}** has been created successfully.')
    except Exception as e:
        await ctx.send(f'{ctx.author.mention}, error creating server: {str(e)}')

@bot.command()
async def delete_server(ctx, server_id: str):
    server = db.get_server(server_id)
    if not server or server[1] != str(ctx.author.id):
        return await ctx.send(f'{ctx.author.mention}, you do not have permission to delete this server.')

    try:
        ptero.delete_server(server_id)
        db.delete_server(server_id)
        await ctx.send(f'{ctx.author.mention}, server with ID **{server_id}** has been deleted.')
    except Exception as e:
        await ctx.send(f'{ctx.author.mention}, error deleting server: {str(e)}')

@bot.command()
async def update_server(ctx, server_id: str, name: str = None, egg: str = None, docker_image: str = None, startup_command: str = None):
    server = db.get_server(server_id)
    if not server or server[1] != str(ctx.author.id):
        return await ctx.send(f'{ctx.author.mention}, you do not have permission to update this server.')

    updated_server_data = {}
    if name: updated_server_data['name'] = name
    if egg: updated_server_data['egg'] = egg
    if docker_image: updated_server_data['docker_image'] = docker_image
    if startup_command: updated_server_data['startup'] = startup_command

    try:
        updated_server = ptero.update_server(server_id, updated_server_data)
        await ctx.send(f'{ctx.author.mention}, server **{updated_server["attributes"]["name"]}** has been updated successfully.')
    except Exception as e:
        await ctx.send(f'{ctx.author.mention}, error updating server: {str(e)}')

@bot.command()
async def control_server(ctx, server_id: str, action: str):
    server = db.get_server(server_id)
    if not server or server[1] != str(ctx.author.id):
        return await ctx.send(f'{ctx.author.mention}, you do not have permission to control this server.')

    try:
        ptero.control_server(server_id, action)
        await ctx.send(f'{ctx.author.mention}, action **{action}** has been performed on server with ID **{server_id}**.')
    except Exception as e:
        await ctx.send(f'{ctx.author.mention}, error controlling server: {str(e)}')

@bot.command()
async def list_servers(ctx):
    servers = db.get_servers_by_user(str(ctx.author.id))
    if not servers:
        return await ctx.send(f'{ctx.author.mention}, you have no servers.')

    for server in servers:
        await ctx.send(f'Server Name: {server[2]}, Server ID: {server[0]}')

bot.run('your-discord-bot-token')
