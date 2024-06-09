const fs = require('node:fs');

const inputDirectory = "./src/";
const outputDirectory = './dist/';

const styleFile = inputDirectory+"style.css";
const scriptFile = inputDirectory+"script.js";

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

console.log(`Generated ${noteTypeCount} note types, ${cardTypeCountDoubled/2} card types`);
