const reNext = /^!bnext ?\d{0,2}$/i;

const queue = [],   // Array containing the people coming up in the queue
      current = []; // Array containing the people currently up in the queue

let queueOpen = false;

async function onQueueHandler (target, context, commandName, client) {
    const ADMIN_PERMISSION = context.mod || process.env.TWITCH_NAME || context.badges.broadcaster;
    const user = context['display-name'];

    // Commands requiring ADMIN_PERMISSION
    if (ADMIN_PERMISSION) {
        switch (commandName) {
            case '!bstart':
                queueOpen = true;
                console.log('Queue opened');
                break;
            case '!bclose':
                queueOpen = false;
                console.log('Queue closed');
                break;
            case '!bend':
                queueOpen = false;
                onClearQueue();
                break;
            case '!bclear':
                onClearQueue();
                break;
        }
    }

    // Check if queue has been opened before continuing
    if (queueOpen === false) { 
        console.log('Queue is currently closed'); 
        return; 
    }

    switch (commandName) {
        case '!bjoin':
            onJoinQueue(user);
            break;
        case '!bqueue':
            onDisplayQueue(target, client, commandName);
            break;
        case '!bcurrent':
            onDisplayQueue(target, client, commandName);
            break;
    }
    
    if (reNext.test(commandName)) {
        const quantity = commandName.replace(/\D/g, '');
        console.log(quantity);
        quantity ? onNextQueue(quantity) : onNextQueue();
    }
}

async function onDisplayQueue(target, client, commandName) {
    switch (commandName) {
        case '!bqueue':
            queue.length > 0 ? client.say(target, `Queue order: ${queue.join(', ')}`) : client.say(target, 'Queue is empty');
            queue.length > 0 ? console.log(`Queue order: ${queue}`) : console.log('Queue is empty');
            break;
        case '!bcurrent':
            current.length > 0 ? client.say(target, `Currently up: ${current.join(', ')}`) : client.say(target, 'No current players');
            current.length > 0 ? console.log(`Current order: ${current}`) : console.log('No current players');
            break;
    }
}

async function onJoinQueue (user) {
    const index = queue.findIndex(element => element === user); // Getting index to see if user is already in queue

    if (index === -1) {
        queue.push(user);
        console.log(`${user} added to queue`);
    } else {
        console.log(`${user} already in queue`);
    }
}

async function onNextQueue (quantity = 1) {
    if (current.length > 0) { current.length = 0; }

    let i = 0;
    console.log(queue);
    while ( i < quantity ) {
        current.push(queue.shift());
        ++i;
    }

    console.log(current);
}

async function onClearQueue (commandName) {
    queue.length = 0;
    current.length = 0;
    commandName === '!bclear' ? console.log('Queue has been cleared') : console.log('Queue has been closed');
}

module.exports = {
    onQueueHandler
};
    