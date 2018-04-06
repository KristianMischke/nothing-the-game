
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
  "padlock",
  "book-new",
  "disambig gray",
  "sound-icon",
  "ambox",
  ".ogg"
];

const START_WORDS = [
  "you",
  "start",
  "with",
  "nothing"
];

let words = [];
let things = [];

// prevent users from spamming the same entries over and over again
let savedQueries = {};
let savedImages = {};

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  words.push(new Word(width/2, height/2, "you start with nothing"));
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  background(200);

  words.forEach(function(element) {
    element.draw(element == focusedWord);
  });

  things.forEach(function(element) {

    if(element.imgKey == null) {
      let imageOptions = savedQueries[element.termKey].images;
      let i = floor(random(imageOptions.length));
      element.imgKey = imageOptions[i];
    }

    element.draw(savedImages);
  });


}

function mousePressed() {

  // check if we click a word
  for(let i = 0; i < words.length; i++) {
    let word = words[i];
    
    let wordW = textWidth(word.chars);
    if(mouseX > word.x - wordW/2 && mouseX < word.x + wordW/2
        && mouseY > word.y - 13 && mouseY < word.y + 13) {
        focusWord(word);
        return;
    }
  }

  if(focusedWord == null) {
    //if we havent clicked a word, make a new word, and focus it
    words.push(new Word(mouseX, mouseY, ""));
    focusWord(words[words.length - 1]);
  } else {
    focusWord(null);
  }
}


function focusWord(word) {

  if(focusedWord != word && focusedWord != null) {
    // we are defocussing the previous word
    // delete word if it has no characters
    if(focusedWord.chars.length == 0) {
      words.filter(function(element) {
        return element != focusedWord;
      });
    }
  }

  focusedWord = word;
}


function keyPressed() {

  //TODO: check for focused word
  if(focusedWord != null) {
    if(keyCode == BACKSPACE || keyCode == DELETE) {
      focusedWord.chars = focusedWord.chars.substring(0, focusedWord.chars.length - 1);
    }

    if(keyCode == ENTER) {
      let term = focusedWord.chars.replace(" ", "%20");
      let query = IMAGE_SEARCH + term;

      if( !(term in savedQueries) ) {
        savedQueries[term] = {images: []};
        getImages(query, term);
      }
      things.push(new Thing(focusedWord.x, focusedWord.y, 30, 30, term));
    }

    if(CHARACTERS.toUpperCase().indexOf(key) > -1) {
      focusedWord.chars += key.toLowerCase();
    }
  }

}

function getImages(query, term) {

  loadJSON(query, function(data) {
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
      
      for(let i = 0; i < images.length; i++) {
        savedQueries[term].images.push(images[i].title);
        let imgQuery = IMAGE_FILE + images[i].title.replace(" ", "%20");
        loadJSON(imgQuery, gotImage, 'jsonp');
      }
    }
  }, 'jsonp');

}


function gotImage(data) {

  let pages = data.query.pages;
  let pageKeys = Object.keys(data.query.pages);
  let imgTitle = pages[pageKeys[0]].title;
  let imgUrl = pages[pageKeys[0]].imageinfo[0].url;
  console.log(imgUrl);

  loadImage(imgUrl, function(img) {
    savedImages[imgTitle] = img;
  })
}