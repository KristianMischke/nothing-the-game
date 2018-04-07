class Thing {
    constructor(x, y, width, height, termKey, imgKey) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.termKey = termKey;
        this.imgKey = imgKey;
    }

    draw(images) {
        if(this.imgKey != null && this.imgKey in images) {
            imageMode(CENTER);
            image(images[this.imgKey], this.x, this.y, this.width, this.height);
        } else {
            rectMode(CENTER);
            rect(this.x, this.y, this.width, this.height, 50)
        }
    }

}