const farts = ['PFFT', 'FRAAAP', 'POOT', 'BLAT', 'THPPTPHTPHPHHPH', 'BRAAAP', 'BRAAAACK', 'FRRRT', 'BLAAARP', 'PBBBBT'];

const CHANCE = 0.001;

function onFartHandler(target, client, context) {
    if (Math.random() <= CHANCE) {
        const fart = farts[Math.floor(Math.random() * farts.length)];
        const fartTarget = context['display-name'];
        client.say(target, `*${fart}* Birthday toot! Sorry ${fartTarget}!`);
    }
}

module.exports = {
    onFartHandler
};