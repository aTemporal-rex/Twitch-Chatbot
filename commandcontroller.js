const CommandModel = require('./command');
const commandNames = ['!anime','!manga'];

const initCommands = async () => {
    const commands = [];

    // Creating commands !anime0 through !anime100
    for (i = 0; i < 100; ++i) {
        const newCommand = `!anime${i}`;
        commandNames.push(newCommand);
    }
    
    // Creating commands !manga0 through !manga100
    for (i = 0; i < 100; ++i) {
        const newCommand = `!manga${i}`;
        commandNames.push(newCommand);
    }

    commandNames.forEach((commandName) => {
        const newCommand = {
            name: commandName,
            permission: 'Everyone',
        }

        commands.push(newCommand);
    });

    await CommandModel.create(commands);
}

const init = async () => {
    // await CommandModel.deleteMany();
    // await initCommands();
}

// init();