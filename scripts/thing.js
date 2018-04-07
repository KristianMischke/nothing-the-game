class Thing {
    constructor(x, y, width, height, termKey, imgKey) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.termKey = termKey;
        this.imgKey = imgKey;

        this.gotAttributes = false;

        // physics
        this.xVel = 0;
        this.yVel = 0;
        this.xAcc = 0;
        this.yAcc = 0;
        this.mass = 1;

        //properties
        this.gravity = true;
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

    update(width, height) {
        this.xAcc = 0;
        this.yAcc = 0;

        if(this.gravity && this.y < height - this.height/2) {
            this.applyForce(0, 1);
        }

        if(this.x < this.width/2 || this.x > width - this.width/2) {

        }
        if(this.y > height - this.height/2) {
            //let diff = this.yVel//abs((height - this.height/2) - this.y);
            //diff *= 0.8;
            this.yVel *= -0.9;
        }


        this.xVel += this.xAcc;
        this.yVel += this.yAcc;
        this.x += this.xVel;
        this.y += this.yVel;
    }

    applyForce(xForce, yForce) {
        //F = ma, ergo a = F/m
        this.xAcc += xForce / this.mass;
        this.yAcc += yForce / this.mass;
    }

}