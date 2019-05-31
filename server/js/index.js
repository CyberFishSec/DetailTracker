const borders = {
    x : {
        min:-50,
        max:50,
    },
    y : {
        min:-25,
        max:25,
    },
    z : {
        min:-65, 
        max:10,
    },
};

const opt = {
   star : {
     count : 2000,
     height : .2,
     radius : .2,
     segments : 3,
   },
   planet : {
      radius : 1,
      segments : 6,
      goodCount : 25,
      badCount : 25,
  },
  low : {
    x : 0,
    y : 0,
    z : .3,
  },
};

function normalize(v, vmin, vmax, tmin, tmax) {
    const nv = Math.max(Math.min(v, vmax), vmin);
    const dv = vmax - vmin;
    const pc = (nv - vmin) / dv;
    const dt = tmax - tmin;
    const tv = tmin + (pc * dt);
    return tv;
}

function handleMouseMove(event) {
    const tx = -1 + (event.clientX / window.innerWidth) * 2;
    const ty = 1 - (event.clientY / window.innerHeight) * 2;
    mousePos = {
        x: tx,
        y: ty
    };
}

function move(el){
    el.position.z+=opt.low.z ;
    el.position.x-=opt.low.x*mousePos.x;
    if(el.position.x > borders.x.max) el.position.x=borders.x.min;
    if(el.position.x < borders.x.min) el.position.x=borders.x.max;
  
    el.position.y-=opt.low.y*mousePos.y;
    if(el.position.y > borders.y.max) el.position.y=borders.y.min;
    if(el.position.y < borders.y.min) el.position.y=borders.y.max;
    if(el.position.z> borders.z.max) {
       el.position.z=borders.z.min;
       return 1;
    }
    else return 0;
}

let isUpdatable = false;
function updateCam() {
    if(isUpdatable){
        const tx = camera.rotation.x,
         ty = camera.rotation.y;
 
        camera.rotation.y += (-ty - (mousePos.x) * .35) / 20;
        camera.rotation.x += (-tx -.1 + mousePos.y * .5) / 20;
    }
}

function dist(x,y,z,a,b,c){
    return Math.sqrt((x-a)*(x-a) + (y-b)*(y-b) + (z-c)*(z-c));
}

function findCollision(el1, el2, d){
    if( dist( el1.position.x, el1.position.y, el1.position.z,
              el2.position.x, el2.position.y, el2.position.z ) < d) return 1;
}

document.addEventListener('mousemove', handleMouseMove, false);

class Rocket {
    constructor(scene){

        this.rocket = new THREE.Group(); // container for the rocket
        this.position = this.rocket.position;
        this.rotation = this.rocket.rotation;
        this.scale = this.rocket.scale;
        this.material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        this.createRatio();
        
        this.constructHead();
        this.constructMiddle();
        this.constructTail();
        this.constructWings();
        this.constructSmoke();
        
        this.rocket.position.z = -2;
        scene.add(this.rocket);
        this.createAnimations();
        this.goAway=false;
        this.isUpdatable= false;
    }

    createAnimations(){
        this.floatingTl = new TimelineMax({repeat:-1});
        this.floatingTl.add(TweenLite.to(this.position, 1, {
            y: '+=' + .12, 
            ease: Power1.easeInOut,
        }));
        this.floatingTl.add(TweenLite.to(this.position, 1, {
            y: '-=' + .12,
            ease: Power1.easeInOut,
        }));

        this.goUpTl = new TimelineMax({repeat: 0});
        this.goUpTl.add(TweenLite.to(this.position , 10, {
            y: 2,
            z:-2,
            x:0,
            ease: Power2.easeInOut,
        }));
        this.goUpTl.add(TweenLite.to(this.rotation, 6, {
            z: -Math.PI/16,
        }), '-=10');
        this.goUpTl.add(TweenLite.to(this.rotation, 4, {
            z: 0,
            x: -Math.PI/2,
            
        ease: Power2.easeOut,
        }), '-=4');
        //this.goUpTl.add(TweenLite.to(this.))
        this.goUpTl.stop();
    }

    prepare(){
        const tl = new TimelineMax();
        tl.add(TweenLite.to(head.position, .3,{
            y: -this.ratio.head.height/2 + this.ratio.head.radius/3,
        }));
        this.headTl2.play();
    }

    constructHead(){
        // head of the rocket
        const headG = new THREE.ConeGeometry(this.ratio.head.radius,
                                            this.ratio.head.height,
                                            this.ratio.head.segments);
        const headGeometry = new THREE.EdgesGeometry(headG);
        const head = new THREE.LineSegments( headGeometry, this.material );
        head.position.y-= this.ratio.head.height/2 - this.ratio.head.radius/3;

        //add some animation to the head part
        this.headTl1 = new TimelineMax({repeat: -1, repeatDelay: .6});
        this.headTl1.add(TweenLite.to(head.position, .3, {
            y: this.ratio.head.height/2 - this.ratio.head.radius,
        }))
        .add(TweenLite.to(head.position, .3,{
            y: -this.ratio.head.height/2 + this.ratio.head.radius/3,
        }));

        this.headTl2 = new TimelineMax({repeat: -1});
        this.headTl2.add(TweenLite.to(head.rotation, 2, {
            y: -Math.PI*2,
            ease: Linear.easeNone,
        }));
        this.headTl2.stop();

        this.rocket.add(head);
    }

    constructMiddle(){
        const middleG = new THREE.CylinderGeometry(this.ratio.middle.radius,
            this.ratio.middle.radius,
            this.ratio.middle.height,
            this.ratio.middle.segments);
        const middleGeometry = new THREE.EdgesGeometry(middleG);
        const middle = new THREE.LineSegments( middleGeometry, this.material );
        middle.position.y-=this.ratio.middle.height;
        this.rocket.add(middle);

        const middleInnerG = new THREE.CylinderGeometry(this.ratio.middle.radius*.8,
                    this.ratio.middle.radius*.8,
                    this.ratio.middle.height*.8,
                    this.ratio.middle.segments);
        const middleInnerGeometry = new THREE.EdgesGeometry(middleInnerG);
        const middleIn = new THREE.LineSegments( middleInnerGeometry, this.material );
        middleIn.position.y-=this.ratio.middle.height;

        let middleTl = new TimelineMax({repeat: -1});
        middleTl.add(TweenLite.to(middleIn.rotation, 1.5, {
        y:  -Math.PI*2,
        ease:Linear.easeNone,
        }));

        this.rocket.add(middleIn);

    }

    constructTail(){
        const tailG = new THREE.TorusGeometry(this.ratio.tail.radius,
                                            this.ratio.tail.tube,
                                            this.ratio.tail.rSegments,
                                            this.ratio.tail.tSegments);

        const tailGeometry = new THREE.EdgesGeometry(tailG);
        const tail = new THREE.LineSegments(tailGeometry,this.material);
        tail.rotation.x = Math.PI/2;
        //tail.rotation.z = Math.PI/6;
        tail.position.y-= this.ratio.middle.height + this.ratio.head.height;

        let tailTl = new TimelineMax({repeat: -1});
        tailTl.add(TweenLite.to(tail.rotation, 1.5, {
                z:  Math.PI*2,
                ease:Linear.easeNone,
        }));
        
        this.rocket.add(tail);
    }

    constructWings(){
        const wingG = new THREE.BoxGeometry( this.ratio.wing.height,
            this.ratio.wing.width,
            this.ratio.wing.depth);
        // we make them boxes firstly
        wingG.vertices[2].y -= this.ratio.wing.offset; //but then we're changing the positions of two of the vertices
        wingG.vertices[3].y -= this.ratio.wing.offset; //of the box and suddenly the boxes start to look like wings
        const wingGeometry = new THREE.EdgesGeometry(wingG);

        for(let i = 0 ; i <  4 ; i ++){
        const wing = new THREE.LineSegments(wingGeometry,this.material);

        // a little positioning is needed
        if(i%2==0) wing.position.x-=this.ratio.wing.offset*(i - 1);
        else wing.position.z=this.ratio.wing.offset*(i - 2);
        wing.position.y-=this.ratio.wing.offset*2.5;

        //each wing must be rotated the right way
        wing.rotation.y=(i)*Math.PI/2; 

        let wingTl = new TimelineMax({repeat: -1, repeatDelay: 1.6});
        wingTl.add(TweenLite.to(wing.position, .2, {
        y: -this.ratio.wing.offset*2.3,
        }))
        .add(TweenLite.to(wing.position, .3,{
        y: -this.ratio.wing.offset*2.5,
        }));

        this.rocket.add(wing);  
        } 
    }

    constructSmoke(){
        const particleG = new THREE.SphereGeometry( this.ratio.smoke.radius,
            this.ratio.smoke.segments,
            this.ratio.smoke.segments);
        const particleGeometry = new THREE.EdgesGeometry(particleG);
        let smokeOffsets = [];
        for( let i = 0 ; i < this.ratio.smoke.number; i++){
        smokeOffsets.push([Math.random()*.2 -.1,Math.random()*.2 -.1]);
        }
        for( let i = 0 ; i < this.ratio.smoke.number; i++){
        const particle = new THREE.LineSegments(particleGeometry, this.material);
        particle.position.y = this.ratio.smoke.hStart;
        particle.rotation.set(Math.PI*2*Math.random(),Math.PI*2*Math.random(),Math.PI*2*Math.random());
        let posTl = new TimelineMax({repeat:-1});
        posTl.add(TweenLite.to(particle.position, .4, {
        y : this.ratio.smoke.hStart - this.ratio.smoke.hOffset,
        x : smokeOffsets[i][0],
        z : smokeOffsets[i][1],
        onComplete: () =>  {
        particle.rotation.set(Math.PI*2*Math.random(),Math.PI*2*Math.random(),Math.PI*2*Math.random());
        },
        }));
        posTl.delay(.12*i);
        let scaleTl = new TimelineMax({repeat:-1});
        scaleTl.add(TweenLite.to(particle.scale, .4, {
        x : this.ratio.smoke.scale,
        y : this.ratio.smoke.scale,
        z : this.ratio.smoke.scale,
        }));
        scaleTl.delay(.12*i);
        this.rocket.add(particle);
        }

    }

    updatePos(mouse){
        if(this.isUpdatable){
            let targetX = normalize(mouse.x, -4, 4, -30, 30);
            let targetY = normalize(mouse.y, -2, 2, -10, 12);

            this.position.x += -1*(this.position.x - targetX)*.025;
            this.position.y += -1*(this.position.y - targetY)*.025;

            this.rotation.x = -Math.PI/2 + mouse.y*1.2;
            this.rotation.z = -.95*mouse.x;

            if(this.goAway){
                if(this.position.z<=-50) {
                    this.position.z = 0;
                    this.goAway=false;
                }
                else{
                    this.position.z-=.5;
                }
            }
        }
    }

    passThrough(){
        let scaleChangeTl = new TimelineMax();
        scaleChangeTl.add(TweenLite.to(this.scale, .2, {
            x: 1.75, 
            y: 3.5,
            z: 1.75,
        }));
        scaleChangeTl.add(TweenLite.to(this.scale, .5,  {
            x: 1,
            y: 1,
            z: 1,
        }));
    }

    createRatio(){
        this.ratio = {
            head : {
                radius : .1,
                height : .15,
                segments : 6,
            },
            middle : {
                  radius : .1,
                  height : .25,
                  segments : 6,
            },
            tail : {
                radius : .055,
                tube : .04,
                rSegments : 6,
                tSegments : 6,
            },
            wing : {
                width : .1,
                height : .06,
                depth : .02,
                offset : .1,
            },
            smoke : {
                radius : .001,
                scale : 30,
                segments : 3,
                number : 13,
                hOffset : .45,
                hStart : -.375,
            }
        }
    }
}


class Planet {
    constructor(r,s,c,b,scene){
        this.geometry = new THREE.SphereGeometry( r,  s,  s );
      
        this.material = new THREE.MeshBasicMaterial({color : c, wireframe : true, needsUpdate : true});
        
        this.planet = new THREE.Mesh(this.geometry, this.material);
      
        this.radius = r; 
        this.color = c;
        this.isBad = b;
        this.exploding = false;

        this.planet.rotation.set( Math.random()*.5,Math.random()*.5,Math.random()*.5);
        let randomScale = .8*Math.random() + .1;
        this.planet.scale.set(randomScale, randomScale, randomScale);
        this.position = this.planet.position;
        this.rotation = this.planet.rotation;
        this.scale = this.planet.scale;

        this.rotX = .003 + Math.random()*.01;
        this.rotY = .003 + Math.random()*.01;
        this.colorHelper = {
            r: 255,
            rMin: 255,
            rMax: 255,
            g: 5,
            gMin: 5,
            gMax: 143,
            b: 0,
            bMin: 0,
            bMax : 5,
        };
        if(b) this.bad();
        scene.add(this.planet);
    }

    bad() {
        this.verts = this.geometry.vertices;
        this.length = this.verts.length;
        this.bumps = [];
        for(let i=0; i<this.length; i++){
            const v = this.geometry.vertices[i];
    
            this.bumps.push({x : v.x,
                             y : v.y,
                             z : v.z, 
                             ang: Math.random()*Math.PI*2,
                             amp: Math.random()*.25,
                             speed: .1 + Math.random()*.1});
        };

        for (let i=0; i<this.length; i++){
            const v = this.verts[i];
            const vprops = this.bumps[i];
            v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
            v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
            v.z = vprops.z + Math.sin(vprops.ang)*vprops.amp;
            vprops.ang += vprops.speed;
        }
        const t1 = Math.random()*.3 + .35;
        const t2 = 1-t1;
        const pulseColorTl = new TimelineMax({repeat:-1});
        pulseColorTl.add(TweenLite.to(this.colorHelper, t1, {
            r: this.colorHelper.rMax,
            g: this.colorHelper.gMax,
            b: this.colorHelper.bMax,
        }));
        pulseColorTl.add(TweenLite.to(this.colorHelper, t2, {
            r: this.colorHelper.rMin,
            g: this.colorHelper.gMin,
            b: this.colorHelper.bMin,
        }));
    }

    playBad(){
        for (let i=0; i<this.length; i++){
            const v = this.verts[i];
            const vprops = this.bumps[i];
            v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
            v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
            v.z = vprops.z + Math.cos(vprops.ang)*vprops.amp;
            vprops.ang += vprops.speed;
        }
        this.geometry.verticesNeedUpdate= true;
        this.material.color.set("rgb("+ Math.floor(this.colorHelper.r) +","+Math.floor(this.colorHelper.g) +","+Math.floor(this.colorHelper.b) +")");
    }

    rotatePlanet(){
        this.rotation.x += this.rotX;
        this.rotation.y += this.rotY;
    }

    explode(){
        this.exploding = true;
        const explodeTl = new TimelineMax();
        explodeTl.add(TweenLite.to(this.scale, .5, {
           x: 10,
           y: 10,
           z: 10,
           onComplete : () => {
               this.exploding=false;
               this.scale.x = 1;
               this.scale.y = 1;
               this.scale.z = 1;
           } 
        }));
    }
}

class Star {
    constructor(r,h,s,c,scene){
        const halfGeom = new THREE.ConeGeometry(r, h, s);
        const geometry = new THREE.EdgesGeometry(halfGeom);
        const material = new THREE.LineBasicMaterial({color : c});

        const upper = new THREE.LineSegments (geometry, material);
        upper.rotation.z = Math.random()*.1 - .2;

        const lower = new THREE.LineSegments (geometry, material);
        lower.rotation.z = Math.PI + Math.random()*.1 -.2;
        lower.rotation.y = Math.PI*.5;
        lower.position.y -= h*.5;
        
        this.star = new THREE.Group();
        this.star.add(upper);
        this.star.add(lower);

        let randomScale = Math.random() + .1; // +.1 so we can't get extra small stars
        this.star.scale.set(randomScale,randomScale,randomScale);

        //we really want different look for each star   
        this.star.rotation.set( Math.random()*.5,Math.random()*.5,Math.random()*.5); 
        this.position = this.star.position;
        
        scene.add(this.star);
    } 
}

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('world').appendChild(renderer.domElement);
renderer.setClearColor('black');

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('black', 20, 50);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, -50, 2);

const cameraUpTl = new TimelineMax({repeat: 0});
cameraUpTl.add(TweenLite.to(camera.position , 10, {
    y : 2,
    z : 5,
    ease: Power2.easeInOut,
    onComplete: () => {
      isUpdatable = true;
      rocket.isUpdatable = true; 
      scoreTl.play();
      scoreValue=0;
      opt.low.x=.3;
      opt.low.y=.3;
    },
}));
cameraUpTl.stop();

const message = document.getElementById("message");
const messageTl = new TimelineMax({repeat: 0, delay: 6});
messageTl.add(TweenLite.to("#message", 1, {
    onStart: () => {
      message.style.display="flex";
    },
    onComplete:() => {
      message.innerHTML="2";
    }
}));
messageTl.add(TweenLite.to(message, 1,{
  onComplete:() => {
    message.innerHTML="1";
  }
}));
messageTl.add(TweenLite.to(message, 1,{
  onComplete:() => {
    message.innerHTML="GO";
  }
}));
messageTl.add(TweenLite.to(message, 1,{
  onComplete:() => {
    message.style.display="none";
  }
}));
messageTl.stop();

let scoreValue = 0;
const score = document.getElementById("score");
const scoreTl = new TimelineMax({repeat:0});
scoreTl.add(TweenLite.to("#score", .8,{
  opacity: 1,
}));
scoreTl.stop();

const stars = [];
for(let i = 0 ; i < opt.star.count; i++){
    const star = new Star(opt.star.radius, opt.star.height, opt.star.segments, "#fff", scene);
    star.position.set(  Math.random()*(borders.x.max-borders.x.min) + borders.x.min,
                        Math.random()*(borders.y.max-borders.y.min) + borders.y.min,
                        Math.random()*(borders.z.max-borders.z.min) + borders.z.min,
    );
    stars.push(star);
}

const goodPlanets = [];
for(let i = 0 ; i < opt.planet.goodCount; i++){
    const planet = new Planet(opt.planet.radius, 2*opt.planet.segments, "#fff",false, scene);
    planet.position.set(Math.random()*(borders.x.max-borders.x.min) + borders.x.min,
                        Math.random()*(borders.y.max-borders.y.min) + borders.y.min,
                        Math.random()*(borders.z.max-borders.z.min) + borders.z.min,
    );
    goodPlanets.push(planet);
}

const badPlanets = [];
for(let i = 0 ; i < opt.planet.badCount; i++){
    const planet = new Planet(opt.planet.radius, opt.planet.segments, "#ffffff",true, scene);
    planet.position.set(Math.random()*(borders.x.max-borders.x.min) + borders.x.min,
                        Math.random()*(borders.y.max-borders.y.min) + borders.y.min,
                        Math.random()*(borders.z.max-borders.z.min) + borders.z.min,
    );
    badPlanets.push(planet);
}

const rocket = new Rocket(scene);
rocket.position.y=-50.05;
rocket.position.x-=1;


function goUP(){
    rocket.floatingTl.stop();
    rocket.goUpTl.play();
    rocket.headTl1.stop();
    rocket.headTl2.play();
    cameraUpTl.play();
    messageTl.play();
}


const planeGeom = new THREE.SphereGeometry(.2,32,32,0,Math.PI, 0 , Math.PI/4);
const pG = new THREE.EdgesGeometry(planeGeom);
const materialP = new THREE.MeshBasicMaterial( { color: 0xffffff} );
const plane = new THREE.LineSegments(pG, materialP);
plane.position.set(0,-50.1,2.75);
plane.rotation.y=Math.PI;
plane.scale.set(5,.1,10);
scene.add(plane);

let goodplanet= new Planet(2,opt.planet.segments, "#ffFFFF",false, scene);
goodplanet.position.set(2,-38,-12);

let badplanet= new Planet(1.75,opt.planet.segments, "#ffFF00",true, scene);
badplanet.position.set(0,-45.5,-8);

loadFont();


function loadFont() {
    var loader = new THREE.FontLoader();
    loader.load(
      "https://raw.githubusercontent.com/asarbinski/font/master/Roboto_Bold.json",
      function(res) {
        createText(res);
      }
    );
  }

  function createText(font) {
    
    let material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

    const textGeo1 = new THREE.TextGeometry("DESTROY THE BAD PLANETS !", {font: font, size: .1, height: .01, curveSegments: 2,});
    textGeo1.computeBoundingBox();
    textGeo1.computeVertexNormals();
    const head1 = new THREE.EdgesGeometry(textGeo1);
    const text1 = new THREE.LineSegments(head1, material);
    text1.position.set(-.5,-49.75,-2.5);
    scene.add(text1);

    const textGeo2 = new THREE.TextGeometry("DO NOT TOUCH THE GOOD PLANETS !", {font: font, size: .1, height: .01, curveSegments: 2,});
    textGeo2.computeBoundingBox();
    textGeo2.computeVertexNormals();
    const head2 = new THREE.EdgesGeometry(textGeo2);
    const text2 = new THREE.LineSegments(head2, material);
    text2.position.set(-.5,-50,-2.5);
    scene.add(text2);

    const textGeo3 = new THREE.TextGeometry("PRESS SPACEBAR TO CONTINUE !", {font: font, size: .1, height: .01, curveSegments: 2,});
    textGeo3.computeBoundingBox();
    textGeo3.computeVertexNormals();
    const head3 = new THREE.EdgesGeometry(textGeo3);
    const text3 = new THREE.LineSegments(head3, material);
    text3.position.set(-.5,-50.25,-2.5);
    scene.add(text3);

    const textGeo4 = new THREE.TextGeometry("BAD PLANET", {font: font, size: .9, height: .01, curveSegments: 2,});
    textGeo4.computeBoundingBox();
    textGeo4.computeVertexNormals();
    const head4 = new THREE.EdgesGeometry(textGeo4);
    const text4 = new THREE.LineSegments(head4, material);
    text4.position.set(-2,-45.5,-12.5);
    scene.add(text4);

    const textGeo5 = new THREE.TextGeometry("GOOD PLANET", {font: font, size: 1.3, height: .01, curveSegments: 2,});
    textGeo5.computeBoundingBox();
    textGeo5.computeVertexNormals();
    const head5 = new THREE.EdgesGeometry(textGeo5);
    const text5 = new THREE.LineSegments(head5, material);
    text5.position.set(-2,-38.5,-20.5);
    scene.add(text5);
  }



  document.onkeydown = function(evt) {
    evt = evt || window.event;
    let isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key == " " || evt.key == "Space");
    } else {
        isEscape = (evt.keyCode == 32);
    }
    if (isEscape) {
        goUP();
    }
};

let mousePos = {
    x: 0,
    y: 0
};

function checkCollisions(planets, rocket){
    planets.forEach(planet => {
        if(findCollision(rocket,planet, planet.radius) && !planet.exploding) {
            if(!planet.isBad && scoreValue!=0) scoreValue-=10;
            if(planet.isBad) scoreValue+=10; 
            planet.explode();
            rocket.passThrough();
        }
    }); 
}

function drawFrame() {
    requestAnimationFrame(drawFrame);

    score.innerHTML = "SCORE : " + scoreValue;
    updateCam();

    for(let i = 0 ; i < opt.star.count; i++) move(stars[i]);
    rocket.updatePos(mousePos);
    
    checkCollisions(badPlanets, rocket);
    checkCollisions(goodPlanets, rocket);
    for(let i = 0 ; i < opt.planet.goodCount; i++) {
        move(goodPlanets[i]);
        goodPlanets[i].rotatePlanet();
    }

    for(let i = 0 ; i < opt.planet.badCount; i++) {
        badPlanets[i].playBad();
        badPlanets[i].rotatePlanet();
        move(badPlanets[i]);
    }
    badplanet.playBad();
    const canvas = renderer.domElement;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
}

drawFrame();
