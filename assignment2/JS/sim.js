window.addEventListener('DOMContentLoaded', () => {
    window.onresize = function () { location.reload(); }
    const FPS = 60;
    let tfCanvas = document.querySelector("#simCanvas");
    var c = tfCanvas.getContext("2d");

    var displayWidth = window.innerWidth;
    var displayHeight = window.innerHeight;
    var scale = 2;
    tfCanvas.style.width = displayWidth + 'px';
    tfCanvas.style.height = displayHeight + 'px';
    tfCanvas.width = displayWidth * scale;
    tfCanvas.height = displayHeight * scale;

    // Define constants
    const g = 9.81; // acceleration due to gravity (m/s^2)
    const e = 0.7; // coefficient of restitution
    const dt = 0.001; // time step (s)
    const total_time = 10; // total simulation time (s)
    const m = 0.5; // mass (kg)
    const r = 0.02; // radius
    const A = Math.PI * (r ** 2); // cross section area (m^2)
    const rho = 1.2; // air density (kg/m^3)
    const C = 0.47; // drag coeff

    const h = 1 / 6; //step size


    var mouse = { x: 0, y: 0, down: false, nodeSelected: -1 };
    let dragBallInterval;

    var rect = tfCanvas.getBoundingClientRect();
    //console.log(rect);

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    window.addEventListener('mousemove', function (e) {
        var mousePos = getMousePos(tfCanvas, e);

        mouse.x = mousePos.x * scale;
        mouse.y = mousePos.y * scale;
        mouse.down = e.buttons == 1;
        //console.log(mouse);
        //console.log(particleArray[0]);
        //console.log(e.buttons == 1); 
        if (e.buttons == 0) {
            mouse.nodeSelected = -1;
        }


    }, false);

    window.addEventListener('mousedown', function (e) {
        var mousePos = getMousePos(tfCanvas, e);

        mouse.x = mousePos.x * scale;
        mouse.y = mousePos.y * scale;
        mouse.down = e.buttons == 1;
        //console.log(mouse);
        //console.log(e.buttons == 1); 
        if (e.buttons == 0) {
            mouse.nodeSelected = -1;
        }
        if (e.buttons == 1) {
            dragBallInterval = setInterval(dragBalls,FPS /*execute every 100ms*/);
        }


    }, false);

    window.addEventListener('mouseup', function (e) {
        if (!(e.buttons == 1)) {
            clearInterval(dragBallInterval);
        }
    }, false);

    function dragBalls() {
        console.log("clicked");
        let mouseRadius = 550;
        for (var i = 0; i < particleArray.length; i++) {
            var dx = Math.abs(mouse.x - particleArray[i].x);
            var dy = Math.abs(mouse.y - particleArray[i].y);
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= particleArray[i].radius + mouseRadius) {
                //draw line to mouse
                c.beginPath();
                c.moveTo(particleArray[i].x, particleArray[i].y);
                c.lineTo(mouse.x, mouse.y);
                c.stroke();
                //draw circle at mouse
                // c.beginPath();
                // c.arc(mouse.x, mouse.y, mouseRadius, 0, Math.PI * 2, false);
                // c.fillStyle = "red";
                // c.fill();
                // c.stroke();

                // add force to particle
                var dx = mouse.x - particleArray[i].x;
                var dy = mouse.y - particleArray[i].y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                var force = distance * 0.005;
                var angle = Math.atan2(dy, dx);
                var fx = Math.cos(angle) * force;
                var fy = Math.sin(angle) * force;

                particleArray[i].ax += fx / m;
                particleArray[i].ay += fy / m;

                particleArray[i].vx += particleArray[i].ax * h;
                particleArray[i].vy += particleArray[i].ay * h;

                particleArray[i].x += particleArray[i].vx * h;
                particleArray[i].y += particleArray[i].vy * h;

            }

        }
    }

    class circle {

        constructor(color, type) {
            this.radius = 50;
            this.x = Math.random() * (tfCanvas.width - this.radius * 2) + this.radius;
            this.y = Math.random() * (tfCanvas.height - this.radius * 2) + this.radius;
            this.vx = (Math.random() * 2 - 1);
            this.vy = (Math.random() * 2 - 1);
            this.ax = 0;
            this.ay = 0;
            this.color = color;
            this.type = type;
            this.eor = e;
            this.mass = m;

        }

        draw() {
            //console.log("hej");
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

            c.fillStyle = hexToRgb(this.color);
            c.fill();
            c.stroke();
        }

        update() {
            this.draw();
        }

        //compute magnus effect force F_M
        calculateMagnus(vel, r) {
            const c_A = 0.1; //the magnus coefficient
            const F_M = c_A * (rho / 2) * (vel ** 2) * (Math.PI * (r ** 2));
            return F_M;
        }

        //compute floor friction 
        calculateFloorFriction(vel) {
            const my = 0.5; //the friction coefficient
            const F_friction = -my * vel;
        }
        

        moveCircle() { // updates every frame
            // Calculate drag force
            let F_drag_x, F_drag_y, v_mag_x, v_mag_y, scaled_r, F_magnus_x, F_magnus_y;
            /* if (this.y <= 0) {
                this.vx *= e;
                this.vy *= -e;
            } else { */
            v_mag_x = this.vx ** 2;
            v_mag_y = this.vy ** 2;

            //scale the radius
            scaled_r = this.radius * 0.001;

            //compute the drag
            F_drag_x = -0.5 * rho * (Math.PI * (scaled_r ** 2)) * C * v_mag_x;
            F_drag_y = -0.5 * rho * (Math.PI * (scaled_r ** 2)) * C * v_mag_y;


            //compute the magnus force
            F_magnus_x = this.calculateMagnus(this.vx, scaled_r);
            F_magnus_y = this.calculateMagnus(this.vy, scaled_r);


            //compute friction on floor, only in x-direction
            if (this.y >= tfCanvas.height - this.radius) {
                let floor_friction = this.calculateFloorFriction(this.vx);
                //apply drag- and magnus force and friction
                this.ax = (F_drag_x + F_magnus_x + floor_friction) / m;
                this.ay = ((F_drag_y + F_magnus_y) / m) + g;
            }

            //apply drag- and magnus force 
            this.ax = ((F_drag_x + F_magnus_x) / m);
            this.ay = (((F_drag_y + F_magnus_y) / m) + g);
            
            // Update velocity
            this.vx += this.ax * h;
            this.vy += this.ay * h;

            // Update position
            this.x += this.vx * h;
            this.y += this.vy * h;

            this.bounce();
        }

        bounce() {
            // Bounds calculations
            if (this.x + this.radius >= tfCanvas.width) {
                this.x = tfCanvas.width - this.radius;
            }
            if (this.x - this.radius <= 0) {
                this.x = this.radius;
            }
            if (this.y + this.radius >= tfCanvas.height) {
                this.y = tfCanvas.height - this.radius;
            }
            if (this.y - this.radius <= 0) {
                this.y = this.radius;
            }

            //collision check
            for (var i = 0; i < particleArray.length; i++) {
                if (this === particleArray[i]) continue; //check if self
                // if (this.checkCollision(particleArray[i])) {


                //     //console.log("collision");
                //     //deltaX = math.abs(this.x - particleArray[i].x)
                //     //deltaY = math.abs(this.y - particleArray[i].y)
                //     collidivec.push(new collidi(this.x, this.y, particleArray[i].x, particleArray[i].y))
                //     console.log(collidivec.length);


                // }
                this.checkCollision(particleArray[i])
            }
        }

        checkCollision(otherCircle) {
            // add move ball x and y on hit
            var dx = this.x - otherCircle.x;
            var dy = this.y - otherCircle.y;
            var distance = Math.sqrt(dx * dx + dy * dy);


            if (distance <= this.radius + otherCircle.radius) {

                
                //get normalized direction vector (Normal) from this to otherCircle
                let normalizedDx = dx / distance;
                let normalizedDy = dy / distance;
                //calculate collision point
                let collisionPointMidX = this.x - dx / 2;
                let collisionPointMidY = this.y - dy / 2;

                //fix new position with collisionPointMid
                this.x = collisionPointMidX + (this.radius * 1.02) * normalizedDx;
                this.y = collisionPointMidY + (this.radius * 1.02) * normalizedDy;
                otherCircle.x = collisionPointMidX - (otherCircle.radius * 1.02) * normalizedDx;
                otherCircle.y = collisionPointMidY - (otherCircle.radius * 1.02) * normalizedDy;

                //get tangetial vector to normal vector (90 degrees rotation counterclowise)
                let tangentX = -normalizedDy;
                let tangentY = normalizedDx;

                // get velocity in normal and tangent direction
                let thisInitialVNormal = this.vx * normalizedDx + this.vy * normalizedDy;
                let thisInitialVTangent = this.vx * tangentX + this.vy * tangentY;
                let otherInitialVNormal = otherCircle.vx * normalizedDx + otherCircle.vy * normalizedDy;
                let otherInitialVTangent = otherCircle.vx * tangentX + otherCircle.vy * tangentY;

                // tangent velocities remain the same
                let thisFinalVTangent = thisInitialVTangent;
                let otherFinalVTangent = otherInitialVTangent;

                // calculate the velocities in the normal direction after collision
                let thisFinalVNormal = this.mass * thisInitialVNormal + otherCircle.mass * otherInitialVNormal + otherCircle.mass * otherCircle.eor * (otherInitialVNormal - thisInitialVNormal);
                let otherFinalVNormal = this.mass * thisInitialVNormal + otherCircle.mass * otherInitialVNormal + this.mass * this.eor * (thisInitialVNormal - otherInitialVNormal);

                // set new velocities
                this.vx = (thisFinalVNormal * normalizedDx + thisFinalVTangent * tangentX);
                this.vy = (thisFinalVNormal * normalizedDy + thisFinalVTangent * tangentY);
                otherCircle.vx = (otherFinalVNormal * normalizedDx + otherFinalVTangent * tangentX);
                otherCircle.vy = (otherFinalVNormal * normalizedDy + otherFinalVTangent * tangentY);



                // Phong and Blinn-Phong shading calculations (no force) +
                // hanterar bara då this är över otherCircle

                // //vector from collision to this circle (Normal) (Normalised)
                // let v1xN = this.x - collisionPointMidX;
                // let v1yN = this.y - collisionPointMidY;
                // v1xN = v1xN / Math.sqrt(v1xN ** 2 + v1yN ** 2);
                // v1yN = v1yN / Math.sqrt(v1xN ** 2 + v1yN ** 2);
                
                // // vector from collision to input angle (L) (Normalised)
                // let v1xL = -this.vx
                // let v1yL = -this.vy
                // v1xL = v1xL / Math.sqrt(v1xL ** 2 + v1yL ** 2);
                // v1yL = v1yL / Math.sqrt(v1xL ** 2 + v1yL ** 2);

                // // calculate the dot product of the two vectors
                // let dotProduct1 = v1xL * v1xN + v1yL * v1yN;
                // //dotProduct1 = Math.abs(dotProduct1);
                // //console.log(dotProduct1);
                // // calculate the reflection vector
                // let reflectionX1 = 2 * dotProduct1 * v1xN - v1xL;
                // let reflectionY1 = 2 * dotProduct1 * v1yN - v1yL;

                // // vector from collision to other circle (Normal) (Normalised)
                // let v2xN = otherCircle.x - collisionPointMidX;
                // let v2yN = otherCircle.y - collisionPointMidY;
                // v2xN = v2xN / Math.sqrt(v2xN ** 2 + v2yN ** 2);
                // v2yN = v2yN / Math.sqrt(v2xN ** 2 + v2yN ** 2);

                // // vector from collision to input angle (L) (Normalised)
                // let v2xL = -otherCircle.vx
                // let v2yL = -otherCircle.vy
                // v2xL = v2xL / Math.sqrt(v2xL ** 2 + v2yL ** 2);
                // v2yL = v2yL / Math.sqrt(v2xL ** 2 + v2yL ** 2);

                // // calculate the dot product of the two vectors
                // let dotProduct2 = v2xL * v2xN + v2yL * v2yN;
                // //dotProduct2 = Math.abs(dotProduct2);
                // // calculate the reflection vector
                // let reflectionX2 = 2 * dotProduct2 * v2xN - v2xL;
                // let reflectionY2 = 2 * dotProduct2 * v2yN - v2yL;

                // // normalise the reflection vectors
                // let reflectionSize = Math.sqrt(reflectionX1 ** 2 + reflectionY1 ** 2);
                // reflectionX1 = reflectionX1 / reflectionSize;
                // reflectionY1 = reflectionY1 / reflectionSize;

                // let reflectionSize2 = Math.sqrt(reflectionX2 ** 2 + reflectionY2 ** 2);
                // reflectionX2 = reflectionX2 / reflectionSize2;
                // reflectionY2 = reflectionY2 / reflectionSize2;


                // // size of previous velocity
                // let v1Size = Math.sqrt(this.vx ** 2 + this.vy ** 2);
                // let v2Size = Math.sqrt(otherCircle.vx ** 2 + otherCircle.vy ** 2);

                // // calculate the new velocity
                // let oldv1x = this.vx;
                // let oldv1y = this.vy;
                // this.vx = reflectionX1 * v1Size * this.elasticity + otherCircle.vx * (1 - otherCircle.elasticity) * 0.8;
                // this.vy = reflectionY1 * v1Size * this.elasticity + otherCircle.vx * (1 - otherCircle.elasticity) * 0.8;
                // otherCircle.vx = reflectionX2 * v2Size * otherCircle.elasticity + oldv1x * (1 - this.elasticity) * 0.8;
                // otherCircle.vy = reflectionY2 * v2Size * otherCircle.elasticity + oldv1y * (1 - this.elasticity) * 0.8;
        
                // let tempV1 = this.vx * this.elasticity + otherCircle.vx * (1 - otherCircle.elasticity);
                // let tempV2 = this.vy * this.elasticity + otherCircle.vy * (1 - otherCircle.elasticity);
                // this.vx = otherCircle.vx * otherCircle.elasticity + this.vx * (1 - this.elasticity);
                // this.vy = otherCircle.vy * otherCircle.elasticity + this.vy * (1 - this.elasticity);
                // otherCircle.vx = tempV1;
                // otherCircle.vy = tempV2;

                return true;
            } else {
                return false;
            }
        }

        drawCircleVelocity() {
            c.beginPath();
            c.moveTo(this.x, this.y);
            c.lineTo(this.x + this.vx * 1, this.y + this.vy * 1);
            c.stroke();
        }

    } // end of class circle

    var particleArray = [];
    var arrayOfRainbowColors = [
        "ff0000",
        "ffa500",
        "ffff00",
        "008000",
        "0000ff",
        "4b0082",
        "ee82ee"
    ];

    function hexToRgb(hex) {
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }

    let btn = document.querySelector("#createParticleBtn");
    btn.addEventListener("click", function () {

        for (let i = 0; i < 10; i++) {

            var c1 = new circle(getNextColor(), 1);
            //console.log(c1.x);
            while (!checkSpawn(c1)) {
                c1 = new circle(getNextColor(), 1);
                //console.log(1, c1.x);
            }
            

            particleArray.push(c1);

        }
        //console.log(new circle(getNextColor(),1));
    });

    function getNextColor() {
        let color = arrayOfRainbowColors.shift();
        arrayOfRainbowColors.push(color);
        return color;
    }

    function checkSpawn(c) {
        var bool = true;
        for (let i = 0; i < particleArray.length; i++) {
            
            let distance = Math.sqrt((c.x - particleArray[i].x) ** 2 + (c.y - particleArray[i].y) ** 2);
            
            if (distance <= (c.radius + particleArray[i].radius)) {
                console.log(distance);
                bool = false;
                //break;
            } 

        }
        return bool;
    }
    function animate() {
        //requestAnimationFrame(animate);
        c.clearRect(0, 0, innerWidth * 2, innerHeight * 2);
        //console.log(particleArray);
        c.lineWidth = 1;
        for (var i = 0; i < particleArray.length; i++) {
            particleArray[i].moveCircle();
            particleArray[i].update();
            particleArray[i].drawCircleVelocity();
        }  

    }

    window.setInterval(animate, 1000 / FPS);

});
