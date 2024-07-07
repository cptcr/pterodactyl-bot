import requests

PTERODACTYL_URL = 'https://your-pterodactyl-panel-url'
PTERODACTYL_API_KEY = 'your-pterodactyl-api-key'

headers = {
    'Authorization': f'Bearer {PTERODACTYL_API_KEY}',
    'Accept': 'Application/vnd.pterodactyl.v1+json',
    'Content-Type': 'application/json'
}

def create_server(data):
    response = requests.post(f'{PTERODACTYL_URL}/api/application/servers', headers=headers, json=data)
    return response.json()

def delete_server(server_id):
    response = requests.delete(f'{PTERODACTYL_URL}/api/application/servers/{server_id}', headers=headers)
    return response.status_code == 204

def update_server(server_id, data):
    response = requests.patch(f'{PTERODACTYL_URL}/api/application/servers/{server_id}/details', headers=headers, json=data)
    return response.json()

def get_server_details(server_id):
    response = requests.get(f'{PTERODACTYL_URL}/api/application/servers/{server_id}', headers=headers)
    return response.json()

def control_server(server_id, action):
    response = requests.post(f'{PTERODACTYL_URL}/api/client/servers/{server_id}/power', headers=headers, json={'signal': action})
    return response.json()
