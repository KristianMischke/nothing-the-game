class Word {
    constructor(x, y, chars) {
        this.x = x;
        this.y = y;
        this.chars = chars;
    }

    draw(focused, color) {
        textAlign(CENTER, CENTER);
        textSize(32);

        fill(color);
        noStroke();
        text(this.chars, this.x, this.y);

        if(focused) {
            let wordW = textWidth(this.chars);
            strokeWeight(2);
            stroke(color);
            line(this.x - wordW/2, this.y + 12, this.x + wordW/2, this.y + 12)
        }
    }
    
}