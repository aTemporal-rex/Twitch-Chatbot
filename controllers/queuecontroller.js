const reNext = /^!bnext ?\d{0,2}$/i;

const queue = [],   // Array containing the people coming up in the queue
      current = []; // Array containing the people currently up in the queue

const MAX_QTY = 15;

let queueOpen = false;

function onQueueHandler (target, context, commandName, client) {
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
            case '!bqueue':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                return;
            case '!bcurrent':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                return;
        }

        if (reNext.test(commandName)) {
            const quantity = commandName.replace(/\D/g, '');
            quantity ? onNextQueue(target, client, quantity) : onNextQueue();
            onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
            return;
        }
    }

    // Check if queue has been opened before continuing. !bqueue and !bcurrent are still allowed while queue is closed if they are not empty
    if (queueOpen === false && (queue.length > 0 || current.length > 0)) { 

        if (commandName === '!bpos') {
            getPosition(target, client, user);
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
        case '!join':
            onJoinQueue(user);
            break;
        case '!bpos':
            getPosition(target, client, user);
            break;
    }
}

function onDisplayQueue(target, client, commandName, context) {
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
            case '!bqueue':
                queue.length > 0 ? client.say(target, `Queue order: ${queue.slice(0, MAX_QTY).join(', ')}`) : client.say(target, 'Queue is empty');
                queue.length > 0 ? console.log(`Queue order: ${queue.slice(0, MAX_QTY)}`) : console.log('Queue is empty');
                return;
            case '!bcurrent':
                current.length > 0 ? client.say(target, `Currently up: ${current.join(', ')}`) : client.say(target, 'No current players');
                current.length > 0 ? console.log(`Current order: ${current}`) : console.log('No current players');
                return;
        }

        if (reNext.test(commandName)) {
            current.length > 0 ? client.say(target, `Next up: ${current.join(', ')}`) : client.say(target, 'Queue is empty');
            current.length > 0 ? console.log(`Next up: ${current}`) : console.log('Queue is empty');
            return;
        }
    }
}

function onJoinQueue (user) {
    const index = queue.findIndex(element => element === user); // Getting index to see if user is already in queue

    if (index === -1) {
        queue.push(user);
        console.log(`${user} added to queue`);
    } else {
        console.log(`${user} already in queue`);
    }
}

function onNextQueue (target, client, quantity = 1) {
    // Checks to make sure quantity is within a reasonable range to avoid flooding chat
    if (quantity > MAX_QTY) {
        client.say(target, `Please select a value less than ${MAX_QTY + 1}`);
        console.log(`Please select a value less than ${MAX_QTY + 1}`);
        return;
    }

    // Resets the current array
    if (current.length > 0) { current.length = 0; }

    let i = 0;
    while ( i < quantity ) {
        if (queue.length > 0) { current.push(queue.shift()); }
        ++i;
    }
}

function onClearQueue (commandName) {
    if (commandName === '!bclear') {
        queue.length = 0;
        console.log('Queue has been cleared');
    } else {
        queue.length = 0;
        current.length = 0;
        console.log('Queue has been closed');
    } 
}

const getPosition = (target, client, user) => {
    const position = queue.findIndex(element => element === user) + 1;
    const currentlyPlaying = current.findIndex(element => element === user);

    if (position === 0) {
        client.say(target, `You're not in queue ${user}, type !bjoin to join the queue`);
        console.log(`${user} is not in queue`);
    } else if (position > 0) {
        client.say(target, `${user}, your position in queue is ${position}`);
        console.log(`${user}, your position in queue is ${position}`);
    } else if (currentlyPlaying != -1) {
        client.say(target, `${user} you're up!`);
        console.log(`${user} you're up!`);
    } 
}

module.exports = {
    onQueueHandler
};
    