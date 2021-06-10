const commandList = {};

commandList.animeAll = "!anime";
commandList.mangaAll = "!manga";
commandList.animeScore = /^!anime[0-9]{1,2}?$/;
commandList.mangaScore = /^!manga[0-9]{1,2}?$/;

console.log(commandList.animeAll);

// Maybe use an array of values from 0-99 instead of regex