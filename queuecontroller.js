const reNext = /^!bnext ?\d{0,2}$/i;

const queue = [],   // Array containing the people coming up in the queue
      current = []; // Array containing the people currently up in the queue

let queueOpen = false;

async function onQueueHandler (target, context, commandName, client) {
    const ADMIN_PERMISSION = context.mod === true ? true : context.badges.broadcaster === '1' ? true : context.username === process.env.TWITCH_NAME ? true : false;
    const user = context['display-name'];

    // Commands requiring ADMIN_PERMISSION
    if (ADMIN_PERMISSION) {
        switch (commandName) {
            case '!bstart':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                queueOpen = true;
                return;
            case '!bopen':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                queueOpen = true;
                return;
            case '!bclose':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                queueOpen = false;
                return;
            case '!bend':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                onClearQueue(commandName);
                queueOpen = false;
                return;
            case '!bclear':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                onClearQueue(commandName);
                return;
        }

        if (reNext.test(commandName)) {
            const quantity = commandName.replace(/\D/g, '');
            quantity ? onNextQueue(quantity) : onNextQueue();
            onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
            return;
        }
    }

    // Check if queue has been opened before continuing. !bqueue and !bcurrent are still allowed while queue is closed if they are not empty
    if (queueOpen === false && (queue.length > 0 || current.length > 0)) { 

        if (commandName === '!bqueue' || commandName === '!bcurrent') { 
            onDisplayQueue(target, client, commandName ); 
            return; 
        }
        console.log('Queue is currently closed');
        return;

    } else if (queueOpen === false) {
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
}

async function onDisplayQueue(target, client, commandName, context) {
    const ADMIN_PERMISSION = context;

    if (ADMIN_PERMISSION) {
        switch (commandName) {
            case '!bstart':
                queueOpen ? client.say(target, 'Queue is already open') : client.say(target, 'Queue is now open, type !bjoin to join');
                queueOpen ? console.log('Queue is already open') : console.log('Queue is now open');
                return;
            case '!bopen':
                queueOpen ? client.say(target, 'Queue is already open') : client.say(target, 'Queue is now open, type !bjoin to join');
                queueOpen ? console.log('Queue is already open') : console.log('Queue is now open');
                return;
            case '!bclose':
                queueOpen ? client.say(target, 'Queue is now closed') : client.say(target, 'Queue is already closed');
                queueOpen ? console.log('Queue is now closed') : console.log('Queue is already closed');
                return;
            case '!bend':
                queueOpen ? client.say(target, 'Queue is now terminated. Go get a healthy snack, you\'ve earned it AAUGH') : client.say(target, 'There is no active queue');
                queueOpen ? console.log('Queue is now terminated') : console.log('There is no active queue');
                return;
            case '!bclear':
                queue.length > 0 ? client.say(target, 'Queue has been cleared') : client.say(target, 'Queue is already empty');
                queue.length > 0 ? console.log('Queue has been cleared') : console.log('Queue is already empty');
                return;
        }

        if (reNext.test(commandName)) {
            current.length > 0 ? client.say(target, `Next up: ${current.join(', ')}`) : client.say(target, 'Queue is empty');
            current.length > 0 ? console.log(`Next up: ${current}`) : console.log('Queue is empty');
            return;
        }
    }


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
    while ( i < quantity ) {
        if (queue.length > 0) { current.push(queue.shift()); }
        ++i;
    }
}

async function onClearQueue (commandName) {
    if (commandName === '!bclear') {
        queue.length = 0;
        console.log('Queue has been cleared');
    } else {
        queue.length = 0;
        current.length = 0;
        console.log('Queue has been closed');
    } 
}

module.exports = {
    onQueueHandler
};
    