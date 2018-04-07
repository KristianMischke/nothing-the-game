
var apiKey = 'gpssewn2erp4rx353bx38vcm';

const CHARACTERS = "you start with nothing";

const IMAGE_SEARCH = 'https://api.gettyimages.com/v3/search/images/creative?exclude_nudity=true&color=FFFFFF&number_of_people=none&sort_order=best_match&page_size=10&phrase=';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php?action=query&prop=images&format=json&formatversion=2&titles=';
const IMAGE_FILE = 'https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&format=json&titles=';

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

  for(let i = 0; i < things.length; i++) {
    let element = things[i];

    if(element.imgKey == null && savedQueries[element.termKey].populated) {

      let imageOptions = savedQueries[element.termKey].images;
      if(imageOptions.length > 0) {
        let index = floor(random(imageOptions.length));
        element.imgKey = imageOptions[index];
      } else {
        things.splice(i, 1);
      }

    }

    element.draw(savedImages);
  }


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

    $('canvas').click(function(e){
      $(this).focus();
    });
    $('canvas').click(function(e) {
        $('canvas').trigger('click');
    });
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
      let term = focusedWord.chars.replace(" ", "%20");
      let query = IMAGE_SEARCH + term;

      if( !(term in savedQueries) ) {
        savedQueries[term] = {'images': [], 'populated': false};
        getImages(query, term);
      }
      things.push(new Thing(focusedWord.x, focusedWord.y, 100, 100, term));
      focusedWord.chars = "";
      focusWord(null);
    }

    if(CHARACTERS.toUpperCase().indexOf(key) > -1) {
      focusedWord.chars += key.toLowerCase();
    }
  }

}

function getImages(query, term) {


  $.ajax(
    {
      type: 'GET',
      url: IMAGE_SEARCH + term,
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
      savedQueries[term].populated = true;
    }
  )
  .fail(function(data){
      alert(JSON.stringify(data,2))
    }
  );




 /* return;

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
  }, 'jsonp');*/

}


/*function gotImage(data) {

  let pages = data.query.pages;
  let pageKeys = Object.keys(data.query.pages);
  let imgTitle = pages[pageKeys[0]].title;
  let imgUrl = pages[pageKeys[0]].imageinfo[0].url;
  console.log(imgUrl);

  loadImage(imgUrl, function(img) {
    savedImages[imgTitle] = img;
  });
}*/



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