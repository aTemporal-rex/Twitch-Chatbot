const QueueModel = require('../models/queue');
const StatusModel = require('../models/status');
const db = require('../db');

const reNext = /^!next ?\d{0,2}$/i;

const queue = [],   // Array containing the people coming up in the queue
      current = [], // Array containing the people currently up in the queue
      MAX_QTY = 15,
      filterStatus = { name: "Queue" }
      options = {upsert: true, new: true, setDefaultsOnInsert: true };

let queueOpen = false,
    nextPosition = 0;

const queueEventEmitter = QueueModel.watch();
queueEventEmitter.on('change', change => {
    changeJson = change;
    try {

        if (changeJson.operationType === "insert") {
            console.log("\n** Document Inserted **");
            
            ++nextPosition;
            // Add new document to local queue array
            // queue.push(changeJson.fullDocument);
    
        } else if (changeJson.operationType === "update") {
            console.log("\n** Document Updated **");
            console.log("Guess I don't care?");
               
        } else if (changeJson.operationType === "delete") {
            console.log("\n ** Document Deleted **");

            --nextPosition;

            // Get index of deleted user from local array
            // queueIndex = queue.findIndex(user => user._id.toString() == changeJson.documentKey._id.toString());

            // Remove command from commands array
            // queue.splice(queueIndex, 1);
        }
        
    } catch (err) {
        console.error(err);
    }
    
    console.log(change);
});

async function getQueueStatus(status) {
    if (status === undefined) {
        status = await StatusModel.findOne({ name: "Queue" });
        queueOpen = status.isOn;
    } else { queueOpen = status; }

    nextPosition = await QueueModel.countDocuments() + 1;
}

async function getQueue() {
    await getQueueStatus();

    users = await QueueModel.find();
    console.log(users);
    users.forEach(user => {
        queue.push(user.name);
    })
    console.log(queue);
    
}

function getPositionWithOrdinal(position) {
    const suffix = ["th", "st", "nd", "rd"],
          modVal = position % 100;
    return position + (suffix[(modVal - 20) % 10] || suffix[modVal] || suffix[0]);
}

async function onQueueHandler (target, context, commandName, client) {
    const ADMIN_PERMISSION = context.mod === true ? true : context.badges.broadcaster === '1' ? true : context.username === process.env.TWITCH_NAME ? true : false;
    const user = context['display-name'];

    console.log(target);

    // Commands requiring ADMIN_PERMISSION
    if (ADMIN_PERMISSION) {
        switch (commandName) {
            case '!bstart':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);

                const resultStart = await StatusModel.findOneAndUpdate(filterStatus, { isOn: true }, options);
                console.log(resultStart);

                queueOpen = true;
                return;
            case '!bopen':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);

                const resultOpen = await StatusModel.findOneAndUpdate(filterStatus, { isOn: true }, options);
                console.log(resultOpen);

                queueOpen = true;
                return;
            case '!bclose':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);

                const resultClose = await StatusModel.findOneAndUpdate(filterStatus, { isOn: false }, options);
                console.log(resultClose);

                queueOpen = false;
                return;
            case '!bend':
                onDisplayQueue(target, client, commandName, ADMIN_PERMISSION);
                onClearQueue(commandName);

                const resultEnd = await StatusModel.findOneAndUpdate(filterStatus, { isOn: false }, options);
                console.log(resultEnd);

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

        if (commandName === '!pos' || commandName === '!position') {
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
        case '!join':
            await onJoinQueue(user);
            break;
        case '!bpos':
            getPosition(target, client, user);
            break;
    }
}

function onDisplayQueue(target, client, commandName, ADMIN_PERMISSION) {
    // const ADMIN_PERMISSION = context;

    if (ADMIN_PERMISSION) {
        switch (commandName) {
            case '!bstart':
                queueOpen ? client.say(target, 'Queue is already open') : client.say(target, 'Queue is now open, type !join to join');
                queueOpen ? console.log('Queue is already open') : console.log('Queue is now open');
                return;
            case '!bopen':
                queueOpen ? client.say(target, 'Queue is already open') : client.say(target, 'Queue is now open, type !join to join');
                queueOpen ? console.log('Queue is already open') : console.log('Queue is now open');
                return;
            case '!bclose':
                queueOpen ? client.say(target, 'Queue is now closed') : client.say(target, 'Queue is already closed');
                queueOpen ? console.log('Queue is now closed') : console.log('Queue is already closed');
                return;
            case '!bend':
                // queueOpen ? client.say(target, 'Queue is now terminated. Go get a healthy snack, you\'ve earned it AAUGH') : client.say(target, 'There is no active queue');
                if (queueOpen === false) { client.say(target, 'There is no active queue'); }
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

async function onJoinQueue (user) {
    const index = queue.findIndex(element => element === user); // Getting index to see if user is already in queue
    const newUser = { "name": user, "position": nextPosition }
    if (index === -1) {
        queue.push(user);
        const result = await QueueModel.create(newUser);
        console.log(result);
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
    const displayPosition = getPositionWithOrdinal(position);

    if (position === 0) {
        client.say(target, `You're not in queue, ${user}, type !join to join the queue`);
        console.log(`${user} is not in queue`);
    } else if (position > 0) {
        client.say(target, `${user}, you're ${displayPosition} in queue`);
        console.log(`${user}, you're ${displayPosition} in queue`);
    } else if (currentlyPlaying != -1) {
        client.say(target, `${user} you're up!`);
        console.log(`${user} you're up!`);
    } 
}

module.exports = {
    onQueueHandler,
    getQueue,
    getQueueStatus
};
    