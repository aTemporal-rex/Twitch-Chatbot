function onLoopHandler (msg, interval, target, client, nIntervId) {
    if (nIntervId) { clearInterval(nIntervId); }
    
    const id = setInterval(() => { client.say(target, msg); }, interval);

    return id;
}

module.exports = {
    onLoopHandler
};