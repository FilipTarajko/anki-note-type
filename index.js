const fs = require('node:fs');

const inputDirectory = "./src/";
const outputDirectory = './dist/';

const styleFile = inputDirectory+"style.css";
const scriptFile = inputDirectory+"script.js";

const mediaDirectory = "/home/ft/.local/share/Anki2/User 1/collection.media"

let noteTypeCount = 0;
let cardTypeCountDoubled = 0;

if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

const fileOrDirectory = fs.readdirSync(inputDirectory);
fs.copyFileSync(styleFile, outputDirectory+"styling.css");
const script = fs.readFileSync(scriptFile);
for (let i=0; i<fileOrDirectory.length; i++) {
  if (fileOrDirectory[i].includes(".")) {
    continue;
  }
  noteTypeCount++;
  const files = fs.readdirSync(inputDirectory+fileOrDirectory[i]);
  if (files.length > 0 && !fs.existsSync(outputDirectory+fileOrDirectory[i])) {
    fs.mkdirSync(outputDirectory+fileOrDirectory[i]);
  }
  for (let j=0; j<files.length; j++) {
    cardTypeCountDoubled++;
    let content = (fs.readFileSync(inputDirectory+fileOrDirectory[i]+"/"+files[j]));
    content += "\n\n"+script;
    fs.writeFileSync(outputDirectory+fileOrDirectory[i]+"/"+files[j], content);
  }
}

const mediaFiles = fs.readdirSync(mediaDirectory);
const backgroundImageFiles = mediaFiles.filter(e=>e.includes("_BG_"));
console.log(`Found ${mediaFiles.length} media files`);
console.log(`Found ${backgroundImageFiles.length} theme background files`);

const styleFileContent = fs.readFileSync(styleFile);
console.log(`Style file length: ${styleFileContent.toString().split('').filter(e=>e=="\n").length+1} lines`);

console.log(`Generated ${noteTypeCount} note types, ${cardTypeCountDoubled/2} card types`);
