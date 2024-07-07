const fetch = require('node-fetch');
const { PTERODACTYL_API_KEY, PTERODACTYL_URL } = process.env;

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
    'Accept': 'application/json'
};

// Create User
async function createUser(userData) {
    const response = await fetch(`${PTERODACTYL_URL}/users`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(userData)
    });
    return response.json();
}

// Delete User
async function deleteUser(userId) {
    const response = await fetch(`${PTERODACTYL_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: headers
    });

    if (response.status === 204) {
        return { message: 'User deleted successfully.' };
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

// Update User
async function updateUser(userId, userData) {
    const response = await fetch(`${PTERODACTYL_URL}/users/${userId}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(userData)
    });
    return response.json();
}

// Get User Details
async function getUserDetails(userId) {
    const response = await fetch(`${PTERODACTYL_URL}/users/${userId}`, {
        method: 'GET',
        headers: headers
    });
    return response.json();
}

// Create Server
async function createServer(serverData) {
    const response = await fetch(`${PTERODACTYL_URL}/servers`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(serverData)
    });
    return response.json();
}

// Delete Server
async function deleteServer(serverId) {
    const response = await fetch(`${PTERODACTYL_URL}/servers/${serverId}`, {
        method: 'DELETE',
        headers: headers
    });

    if (response.status === 204) {
        return { message: 'Server deleted successfully.' };
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

// Update Server
async function updateServer(serverId, serverData) {
    const response = await fetch(`${PTERODACTYL_URL}/servers/${serverId}`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(serverData)
    });
    return response.json();
}

// Get Server Details
async function getServerDetails(serverId) {
    const response = await fetch(`${PTERODACTYL_URL}/servers/${serverId}`, {
        method: 'GET',
        headers: headers
    });
    return response.json();
}

module.exports = { createUser, deleteUser, updateUser, getUserDetails, createServer, deleteServer, updateServer, getServerDetails };
