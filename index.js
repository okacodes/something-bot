const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config({ path: './config/.env' })
const token = process.env.token;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });


client.commands = new Collection();
client.cooldowns = new Collection();

// gets path of commands folder and reads contents of the directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// iterate through contents of commands folder
for (const folder of commandFolders) {
	// gets full path of files, and filters our anything that doesn't end in '.js' 
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

	// iterates through the files(our commands)
	for (const file of commandFiles) {
		// gets full path of file
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// checks for existence of 'data' and 'execute' in files, else console log error
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// everything below this comment is very similar, though it iterates through events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);