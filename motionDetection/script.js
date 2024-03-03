let outputText = document.getElementById("text");

let capture;
let lastImage;
let numPixels;
let maxMovement = 0;
let averageMovement = [];

let threshhold = 50;
let secondsBetweenSend = 15;

let startTime = new Date();
console.log("Starting")

let mode = "BW";

function setup() {
    createCanvas(480, 360);
    capture = createCapture(VIDEO);
    capture.size(width, height);
    capture.parent('gridCont');
    document.getElementById("gridCont").appendChild(document.getElementById("defaultCanvas0"))
    //capture.hide();
    frameRate(30);
}

function draw() {
    if(mode == "RO"){
        image(capture, 0, 0, width, height);
    }else{
        background(0);
    }

    if(maxMovement == 1){
        maxMovement = 0 ;
    }

    if(frameCount > 1){
        numPixels = capture.width * capture.height * 4

        let motionImage = createImage(width,height);
        motionImage.loadPixels();
        capture.loadPixels();
        
        let deadPixels = 0;
        
        for (let i = 0; i < numPixels; i += 4) {
            let newR = capture.pixels[i] - lastImage[i];
            let newG = capture.pixels[i+1] - lastImage[i+1];
            let newB = capture.pixels[i+2] - lastImage[i+2];

            motionImage.pixels[i] =  newR;
            motionImage.pixels[i+1] = newG;
            motionImage.pixels[i+2] = newB;
            motionImage.pixels[i+3] = 255; //sets alpha
            if (newR + newG + newB < threshhold){
                deadPixels++;
                motionImage.pixels[i+3] = 0; //sets alpha
            }
            else{
                if(mode == "BW"){
                    motionImage.pixels[i+1] = 255;
                    motionImage.pixels[i+2] = 255;
                }else{
                    motionImage.pixels[i+1] = 0;
                    motionImage.pixels[i+2] = 0;
                }
                motionImage.pixels[i] =  255;
                motionImage.pixels[i+3] = 255;
            }
        }
        lastImage = capture.pixels;
        motionImage.updatePixels();

        
        let movement = normalizeValue(((numPixels-deadPixels)/numPixels),0.75,1)
        maxMovement = max(maxMovement,movement);
        averageMovement.push(movement);


        var currentTime = new Date();

        let av = averageMovement.reduce(function (accumulator, currentValue) {
            return accumulator + currentValue;
          }, 0);
        av = (av/averageMovement.length).toFixed(7);

        let prettyMovement = movement.toFixed(7)//.padStart(7, '0');
        let prettyMaxMovement = maxMovement.toFixed(7)//.padStart(7, '0');
        outputText.innerHTML = `${prettyMovement}% Movement
                            <br>${prettyMaxMovement}% Max Movement (${secondsBetweenSend}s)
                            <br>${av}% Average Movement (${secondsBetweenSend}s)
                            <br>${(((secondsBetweenSend*1000) - (currentTime.getTime()-startTime.getTime()))/1000).toFixed(3)} Seconds until next send`;

        image(motionImage, 0, 0, width, height);

        if(currentTime.getTime()-startTime.getTime() >= secondsBetweenSend*1000){
            // Replace YOUR_API_KEY and CHANNEL_ID with your actual values
            var apiKey = 'DHXGEVLWWCEZSOOT';
            
            let av = averageMovement.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue;
              }, 0);
            av = av/averageMovement.length;
            averageMovement = [];

            // Sample data to send to ThingSpeak
            var data = { MaximumMovement: maxMovement,AverageMovement:av};
            
            // URL to update a ThingSpeak channel
            var url = `https://api.thingspeak.com/update?api_key=${apiKey}&field1=${data.MaximumMovement}&field2=${data.AverageMovement}`;
    
            // Make a GET request to update the channel
            fetch(url)
                .then(response => response.json())
                .catch(error => console.error('Error:', error));

            startTime = currentTime;
            maxMovement = 0;
        }
        
    }
    else{
        lastImage = capture.pixels;
    }
    if(mode == "BW"){
        filter(GRAY)
    }
}

function normalizeValue(value, min, max) { //written by chat gpt
    // Ensure that the provided min and max are valid
    if (min >= max) {
        throw new Error('Invalid min and max values. Max must be greater than min.');
    }

    // Normalize the value between 0 and 1
    const normalizedValue = (value - min) / (max - min);

    // Ensure the result is within the [0, 1] range
    return Math.max(0, Math.min(1, normalizedValue));
}

function bw(){
    mode = "BW";
}
function ro(){
    mode = "RO";
}