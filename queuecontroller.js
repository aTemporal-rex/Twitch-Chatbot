const reNext = /^!bnext\d{0,2}/i,
      reStart = /^!bstart$/i;

const queue = [],   // Array containing the people coming up in the queue
      current = []; // Array containing the people currently up in the queue

let queueOpen = false;

async function onQueueHandler (target, context, commandName, client) {
    
    if (reStart.test(commandName) && (context.mod || context.badges.broadcaster)) { queueOpen = true; } // If command was !bstart, start the queue
    if (queueOpen === false) { return; } // If queue hasn't been started, then return

    const user = context['display-name'];

    switch (commandName) {
        case '!bclose':
            queueOpen = false;
            break;
        case '!bend':
            onClearQueue();
            queueOpen = false;
            break;
        case '!bjoin':
            onJoinQueue(user);
            break;
        case '!bqueue':
            client.say(target, `Queue order: ${queue.join(', ')}`);
            console.log(`Queue order: ${queue}`);
            break;
        case '!bcurrent':
            client.say(target, `Currently up: ${current.join(', ')}`);
            break;
        case '!bclear':
            onClearQueue();
            break;
    }
    
    if (reNext.test(commandName)) {
        const quantity = commandName.replace(/\D/g, '');
        console.log(quantity);
        quantity ? onNextQueue(quantity) : onNextQueue();
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

async function onClearQueue () {
    queue.length = 0;
    current.length = 0;
}

module.exports = {
    onQueueHandler
};
    