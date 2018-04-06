
const CHARACTERS = "you start with nothing";

let focusedWord = null;


const IMAGE_SEARCH = 'https://en.wikipedia.org/w/api.php?action=query&prop=images&format=json&formatversion=2&titles='
const IMAGE_FILE = 'https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles='

const GARBAGE = [
  "wiki",
  "wik",
  "commons",
  "redirect",
  "wikipedia",
  "wiktionary",
  "logo",
  "padlock"
];



const START_WORDS = [
  "you",
  "start",
  "with",
  "nothing"
];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  background(200);
  textAlign(CENTER, CENTER);
  textSize(32);
  
  text(START_WORDS.join(" "), width/2, height/2);
}

function mousePressed() {

  let wordW = textWidth(START_WORDS.join(" "));
  if(mouseX > width/2 - wordW/2 && mouseX < width/2 + wordW/2
      && mouseY > height/2 - 10 && mouseY < height/2 + 10) {
      focusedWord = true;
  } else {
    focusedWord = null;
  }

}

function keyPressed() {

  //TODO: check for focused word
  if(focusedWord != null) {
    if(keyCode == BACKSPACE || keyCode == DELETE) {
      let i = START_WORDS.length-1;
      START_WORDS[i] = START_WORDS[i].substring(0, START_WORDS[i].length - 1);
      if(START_WORDS[i] == "" && START_WORDS.length > 1) {
        START_WORDS.splice(START_WORDS.length - 1, 1);
      }
    }

    if(keyCode == ENTER) {
      let term = START_WORDS.join("%20");
      let query = IMAGE_SEARCH + term;
      loadJSON(query, gotImages, 'jsonp');
    }

    if(CHARACTERS.toUpperCase().indexOf(key) > -1) {
      if(key == " ") {
        START_WORDS.push("");
      } else {
        START_WORDS[START_WORDS.length-1] += key.toLowerCase();
      }
    }
  }

}

function gotImages(data) {
  let images = data.query.pages[0].images;
  
  if(images != null) {
    
    // remove garbage links (aka logos and icons)
    for(let i = images.length - 1; i >= 0; i--) {

      let garbage = false;
      for(let j = 0; j < GARBAGE.length; j++) {
        if(images[i].title.toLowerCase().indexOf(GARBAGE[j]) > -1) {
          garbage = true;
        }
      }

      if(garbage) {
        images.splice(i, 1);
      }

    }
    
    if(images.length > 0) {
      // choose a random image from the list
      let rand = floor(random(0, images.length));
      let randImage = images[rand];

      let imgQuery = IMAGE_FILE + randImage.title.replace(" ", "%20");
      loadJSON(imgQuery, gotImage, 'jsonp');
    }
  }
}


function gotImage(data) {

  let pages = data.query.pages;
  let pageKeys = Object.keys(data.query.pages);
  let imgUrl = pages[pageKeys[0]].imageinfo[0].url;
  console.log(imgUrl);

  img = createImage(imgUrl);
  //img.hide;
  image(img, 0, 0, width, height);

  //noLoop();
}