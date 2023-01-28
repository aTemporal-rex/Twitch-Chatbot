// const TimerModel = require('../models/timer');
// const db = require('../db');
// require('dotenv').config();

// const timerRecent = false,
//       timerDelay = 300000; // Delay between timers

// const timers = [];

// // Whenever the timers collection is changed, it triggers this event that updates the local timers array
// const timerEventEmitter = TimerModel.watch();
// timerEventEmitter.on('change', change => {
//     changeJson = change;
//     try {

//         if (changeJson.operationType === "insert") {
//             console.log("\n** Document Inserted **");

//             // Add new document to local timers array
//             timers.push(changeJson.fullDocument);
    
//         } else if (changeJson.operationType === "update") {
//             console.log("\n** Document Updated **");
    
//             // Get index of updated timer from local array
//             timerIndex = timers.findIndex(timer => timer._id.toString() == changeJson.documentKey._id.toString());
    
//             // Update each value locally that was changed in the database
//             Object.keys(changeJson.updateDescription.updatedFields).forEach(key => {
//                 timers[timerIndex][`${key}`] = changeJson.updateDescription.updatedFields[`${key}`]
//             });  
//         } else if (changeJson.operationType === "delete") {
//             console.log("\n ** Document Deleted **");

//             // Get index of deleted timer from local array
//             timerIndex = timers.findIndex(timer => timer._id.toString() == changeJson.documentKey._id.toString());

//             // Remove timer from timers array
//             timers.splice(timerIndex, 1);
//         }
        
//     } catch (err) {
//         console.error(err);
//     }
    
//     console.log(change);
// });

// async function getTimers() {
//     timers = await TimerModel.find();
//     timers.forEach(timer => 
//         timers.push({
//             _id: timer._id,
//             name: timer.name,
//             message: timer.message,
//             interval: timer.interval,
//             isOn: timer.isOn
//         })
//     );
//     return timers;
// }

// function onTimerHandler(client, target) {
//     timers.forEach(timer => {

//         // if (timer.isOn === true) {
//         //     if (timerRecent) {
//         //         setTimeout(() => { client.say(target, timer.message) }, timerDelay);
//         //     }
//         //     else {
//         //         client.say(target, timer.message);
//         //         timerRecent = true;
//         //     }
//         // }
//     })

//     if (timerRecent) {
//         setTimeout(() => { timer }, timerDelay);
//     }
// }

// Handling for creating a looped message using command
function onLoopHandler (msg, interval, target, client, nIntervId) {
    if (nIntervId) { clearInterval(nIntervId); }
    
    const id = setInterval(() => { client.say(target, msg); }, interval);

    return id;
}

module.exports = {
    onLoopHandler
};