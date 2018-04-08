
var apiKey = 'gpssewn2erp4rx353bx38vcm';

const CHARACTERS = "you start with nothing";

const GETTY_IMAGE_SEARCH = 'https://api.gettyimages.com/v3/search/images/creative?exclude_nudity=true&color=FFFFFF&number_of_people=none&sort_order=best_match&page_size=10&phrase=';
const WIKI_IMAGE_SEARCH = 'https://en.wikipedia.org/w/api.php?action=query&prop=images&format=json&formatversion=2&titles=';
const WIKI_IMAGE_FILE = 'https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=';

const WIKI_EXTRACT_SEARCH = 'https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&generator=allpages&gaplimit=3&prop=extracts&exintro=&explaintext=&exsentences=4&exsectionformat=plain&gapfrom=';

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
  ".ogg",
  "icon"
];

const USE_WIKI_IMAGES = false;
const USE_GETTY_IMAGES = true;

let focusedWord = null;
let words = [];
let things = [];

// prevent users from spamming the same entries over and over again
let savedQueries = {};
let savedImages = {};

let imageQueue = {
  'ready': true,
  'images': []
};



let backgroundMode = "none";

let goals = [
  new Goal("space",       ["star", "sun", "night"], 3, "starry night"),
  new Goal("destruction", ["tnt", "gun", "shot", "rust", "ruin"], 3, "destruction"),
  new Goal("party",       ["noisy", "toy"], 3, "party"),
  new Goal("peace",       ["yin", "yang", "yin%20yang", "yoga", "grass", "air"], 3, "peace")
];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  reset();
}

function reset() {
  things = [];
  words = [];

  backgroundMode = "none";

  words.push(new Word(width/2, height/2, "you start with nothing"));
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {

  switch(backgroundMode) {
    case "starry night":
      background(10, 10, 30);
      break;
    case "peace":
      background(180, 220, 190);
      break;
    case "party":
      background(255);
      break;
    case "destruction":
      background(180, 100, 30);
      break;
    default:
      background(200);
  }


  goals.forEach((goal) => {
    goal.checkGoal = 0;
  });

  for(let i = 0; i < things.length; i++) {
    let element = things[i];

    // update image
    if(element.imgKey == null && savedQueries[element.termKey].populatedGetty && savedQueries[element.termKey].populatedWiki) {

      let imageOptions = savedQueries[element.termKey].images;
      if(imageOptions.length > 0) {
        let index = floor(random(imageOptions.length));
        element.imgKey = imageOptions[index];
      } else {
        things.splice(i, 1);
      }

    }

    // update attributes
    if(!element.gotAttributes && savedQueries[element.termKey].populatedAttributes) {

      if(savedQueries[element.termKey].attributes.indexOf("no-gravity") > -1) {
        element.gravity = false;
        element.xVel = 0;
        element.yVel = 0;
      }

      element.attributes = savedQueries[element.termKey].attributes;
      element.gotAttributes = true;
    }

    // check goals
    goals.forEach((goal) => {
      goal.objects.forEach((object) => {
        if(object.indexOf(RiTa.singularize(element.termKey)) > -1) {
          goal.checkGoal++;
        }
      });
    });

    //update physics and draw
    element.update(width, height);
    element.draw(savedImages);
  }

  words.forEach(function(element) {
    let color = (backgroundMode == "starry night") ? 255 : 30
    element.draw(element == focusedWord, color);
  });


  goals.forEach((goal) => {
    if(goal.checkGoal > goal.amount) {
      if(!goal.complete) {
        submitWord(new Word(0, 0, goal.submit));
        goal.complete = true;
      }
    } else {
      goal.complete = false;
    }
  });


  downloadImages();

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

    //$('#field').focus();
    //$('#field').click();
    //$('#field').trigger('click');
    /*$('#field').click(function(e) {
        $('#field').trigger('click');
    });*/
  }

  focusedWord = word;
}


function keyPressed() {

  //TODO: check for focused word
  if(focusedWord != null) {
    if(keyCode == BACKSPACE || keyCode == DELETE) {
      focusedWord.chars = focusedWord.chars.substring(0, focusedWord.chars.length - 1);
    }

    if(keyCode == ENTER && focusedWord.chars != "") {
      submitWord(focusedWord);
      focusedWord.chars = "";
      focusWord(null);
    }

    if(CHARACTERS.toUpperCase().indexOf(key) > -1) {
      focusedWord.chars += key.toLowerCase();
    }
  }

}

function submitWord(word) {
  switch(word.chars) {
    case 'nothing':
      reset();
      break;

    case 'starry night':
      for(let i = 0; i < random(10, 20); i++) {
        let size = random(10, 100);
        createObject("star", random(0, width), random(0, height), size, size);
        createObject("shooting star", random(0, width), random(0, height), size, size);
      }
      words = [];
      words.push(new Word(width/2, height/2, "welcome to space!"));
      backgroundMode = word.chars;
      break;

    case 'peace':
      for(let i = 0; i < random(10, 20); i++) {
        let size = random(10, 100);
        createObject("flower", random(0, width), random(0, height), size, size);
        createObject("nature", random(0, width), random(0, height), size, size);
      }
      words = [];
      words.push(new Word(width/2, height/2, "the serenity!"));
      backgroundMode = word.chars;
      break;

    case 'destruction':
      for(let i = 0; i < random(10, 20); i++) {
        let size = random(10, 100);
        createObject("smoke", random(0, width), random(0, height), size, size);
        createObject("destruction", random(0, width), random(0, height), size, size);
      }
      words = [];
      words.push(new Word(width/2, height/2, "BANG!"));
      backgroundMode = word.chars;
      break;

    case 'party':
      for(let i = 0; i < random(10, 20); i++) {
        let size = random(10, 100);
        createObject("balloon", random(0, width), random(0, height), size, size);
        createObject("present", random(0, width), random(0, height), size, size);
      }
      words = [];
      words.push(new Word(width/2, height/2, "Congratulations!"));
      backgroundMode = word.chars;
      break;

    default:
      createObject(word.chars, word.x, word.y, 100, 100);
      break;
  }
}

function createObject(term, x, y, width, height) {
  term = term.replace(" ", "%20");

  if( !(term in savedQueries) ) {
    savedQueries[term] = {
      'images': [],
      'populatedGetty': !USE_GETTY_IMAGES,
      'populatedWiki': !USE_WIKI_IMAGES,
      'populatedAttributes': false,
      'attributes': []
    };
    
    getWikipediaText(term);

    if(USE_WIKI_IMAGES)
      getWikipediaImages(term);
    if(USE_GETTY_IMAGES)
      getGettyImages(term);
  }

  things.push(new Thing(x, y, width, height, term));
}


function getWikipediaText(term) {
  loadJSON(WIKI_EXTRACT_SEARCH + term, function(data) {
    console.log(data);

    let extract = data.query.pages[0].extract;

    if(extract.indexOf("multiple topics") > -1 || extract.indexOf("refer to") > -1) {
      extract = data.query.pages[1].extract;
    }

    let rs = new RiString(extract);

    for(let i = 0; i < rs.words().length; i++)
    {
        let w = rs.wordAt(i);
        if(RiTa.isAdjective(w)) {
            console.log(w + " - adj");
        }
        if(RiTa.isVerb(w)) {
            console.log(w + " - v");
        }

        if(["fixed", "center", "inflated"].indexOf(w) > -1) {
          savedQueries[term].attributes.push('no-gravity');
        }

        if(["inflated"].indexOf(w) > -1) {
          savedQueries[term].attributes.push('float');
        }

    }


    savedQueries[term].populatedAttributes = true;

  }, 'jsonp');//end loadJSON
}





function getGettyImages(term) {
  $.ajax(
    {
      type: 'GET',
      url: GETTY_IMAGE_SEARCH + term,
        beforeSend: function (request) {
          request.setRequestHeader("Api-Key", apiKey);
        }
    }
  )
  .done(function(data) {
      console.log("Success with data")
      for(let i = 0; i < data.images.length; i++)
      {
        savedQueries[term].images.push(data.images[i].display_sizes[0].uri);
        imageQueue.images.push({
          'imgUrl': data.images[i].display_sizes[0].uri,
          'imgTitle': data.images[i].display_sizes[0].uri
        });
      }
      savedQueries[term].populatedGetty = true;
    }
  )
  .fail(function(data){
      alert(JSON.stringify(data,2))
    }
  );
}


function getWikipediaImages(term) {
  loadJSON(WIKI_IMAGE_SEARCH + term, function(data) {
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
        let imgQuery = WIKI_IMAGE_FILE + images[i].title.replace(" ", "%20");
        loadJSON(imgQuery, function(data) {
          let pages = data.query.pages;
          let pageKeys = Object.keys(data.query.pages);
          let imgTitle = pages[pageKeys[0]].title;
          let imgUrl = pages[pageKeys[0]].imageinfo[0].url;
          //console.log(imgUrl);

          imageQueue.images.push({
            'imgUrl': imgUrl,
            'imgTitle': imgTitle
          });
        }, 'jsonp');//end loadJSON
      }
      savedQueries[term].populatedWiki = true;
    }
  }, 'jsonp');//end loadJSON
}



function downloadImages() {

  if(imageQueue.ready && imageQueue.images.length > 0) {
    imageQueue.ready = false;
    loadImage(imageQueue.images[0].imgUrl, function(img) {
      
      let dimensions = min(img.width, img.height);
      let g = createGraphics(dimensions, dimensions);

      g.imageMode(CENTER);
      g.image(img, dimensions/2, dimensions/2);
      g.loadPixels();
      for(let y = 0; y < dimensions; y++) {
        for(let x = 0; x < dimensions; x++) {
          
          let d = dist(x, y, dimensions/2, dimensions/2);
          let i = (x + y * dimensions) * 4;
          //g.pixels[i]     = 0;
          //g.pixels[i + 1] = 0;
          //g.pixels[i + 2] = 0;
          g.pixels[i + 3] = map(d, dimensions/3, dimensions/2, 255, 0);

        }
      }
      g.updatePixels();
      
      //savedImages[imageQueue.images[0].imgTitle] = img;
      savedImages[imageQueue.images[0].imgTitle] = g;

      imageQueue.ready = true;
      imageQueue.images.splice(0, 1);
    });
  }

}