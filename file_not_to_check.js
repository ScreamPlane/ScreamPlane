var control_speed_towers = 100;
var control_speed_bird = 100;
var control_speed_plane = 200;

var is_game_started = false;

var Mic;

var score = 0;

let dayNightInterval, scoreCounterInterval;


var intervalTrackers = {
    addSmoke: 0,
    incrementSpeed: 0
};

const intervalTrackersMax = {
    addSmoke: 5, // 6 * (1000/60ms) = (1000/10ms) = 100ms
    incrementSpeed: 29, // 30 * (1000/60ms) = 500ms
};

function returnTrackers() {
    for (let tracker in intervalTrackers) {
        if (++intervalTrackers[tracker] > intervalTrackersMax[tracker]) {
            intervalTrackers[tracker] = 0;
        }
    }
}

var hills_movement = 0;
var towers_movement = 0;
var bird_movement = -50;

function shiftItems(fraction) {
    hills_movement += control_speed_towers * fraction / 50;
    towers_movement += control_speed_towers * fraction / 25;
    bird_movement += control_speed_bird * fraction / 20;

    if (towers.lastElementChild.getBoundingClientRect().right - window.outerWidth < 10) {
        let mr = getComputedStyle(towers.firstElementChild).marginRight;
        towers_movement -= (towers.firstElementChild.offsetWidth + Number(mr.substring(0, mr.length - 2)));
        towers.removeChild(towers.firstElementChild);

        let new_tower = document.createElement("div");

        // Substring to remove '.' from beginning
        new_tower.setAttribute("class", Identifiers.tower.substring(1));
        new_tower.style.top = (Constants.tower_top_margin + Math.random() * Constants.max_tower_top_percent) + '%';
        new_tower.innerHTML = generateRandomTower();
        towers.appendChild(new_tower);
    }

    if (bird_image.getBoundingClientRect().right + 30 < 10) {
        bird_movement = -50 * Constants.vwpx_factor;
        // bird_image.style.top = (10 + Math.random() * (bird_container.offsetHeight - 10)) * Constants.vwpx_factor + 'px';
        bird_image.style.top = (10 + Math.random() * (bird_container.offsetHeight - 10)) * Constants.vwpx_factor + 'vh';
    }

    // hills.style.backgroundPositionX = -hills_movement + 'px';
    hills.style.backgroundPositionX = -hills_movement * Constants.vwpx_factor + 'vw';
    // towers.style.left = -towers_movement + 'px';
    towers.style.left = -towers_movement * Constants.vwpx_factor + 'vw';
    // bird_container.firstElementChild.style.right = bird_movement + 'px';
    bird_container.firstElementChild.style.right = bird_movement * Constants.vwpx_factor + 'vw';

    if (intervalTrackers.addSmoke === 0) {
        addSmoke();
    }

    document.querySelectorAll(Identifiers.smoke).forEach(function (smoke) {
        // smoke.style.left = (smoke.getBoundingClientRect().left - 4 * fraction) + 'px';
        smoke.style.left = (smoke.getBoundingClientRect().left - 4 * fraction) * Constants.vwpx_factor + 'vw';
    });
}


function addSmoke() {
    var new_smoke = document.createElement('img');
    new_smoke.onload = function () {
        new_smoke.animate([{
                "opacity": "1"
            },
            {
                "opacity": "0"
            },
        ], {
            duration: 200
        });

        setTimeout(function () {
            new_smoke.remove();
        }, 200);
    };

    new_smoke.setAttribute("src", AssetsURL.smoke);
    new_smoke.setAttribute("class", Identifiers.smoke.substring(1));
    new_smoke.style.top = (plane.getBoundingClientRect().top + Paddings.smoke_from_plane_top) + 'px';
    top_section.appendChild(new_smoke);
}


function initiateInitialTowers() {
    document.querySelectorAll(Identifiers.tower).forEach(function (tower_div) {
        tower_div.innerHTML = generateRandomTower();
        tower_div.style.top = (Constants.tower_top_margin + Math.random() * Constants.max_tower_top_percent) + '%';
    });
}


var mic_low = 15;

function checkMicrophone(fraction) {
    // setTimeout(function() {
    // getLocalStream();

    // Mic.startMic();
    // alert("f")
    // setInterval(function() {
    var s = Mic.getRMS(Mic.spectrum);

    // alert(s)
    var final = Math.pow(control_speed_plane, 1.05);
    // if (s > 25 * Math.log10(control_speed)) {
    if (s > mic_low) {
        final -= (Math.pow(control_speed_plane, 1.15) / 100) * s * (10 / mic_low);
        // final -= (Math.pow(control_speed_plane, 1.15) / 100) * s;
    }

    var finalCalcPlane = (plane.getBoundingClientRect().top + (final * fraction) / 100);
    // console.log(finalCalcPlane);
    finalCalcPlane = finalCalcPlane * Constants.vhpx_factor;

    // high_score.innerHTML = final + " " + plane.getBoundingClientRect().top;
    // high_score.innerHTML = final + " " + plane.getBoundingClientRect().top;
    // console.log(finalCalcPlane);
    // var finalCalcLight = (night_plane_light.getBoundingClientRect().top + (final) / 100);
    // var finalCalcRedLight = (night_plane_red_light.getBoundingClientRect().top + (final) / 100);
    if (finalCalcPlane >= 0) {
        // plane.style.top = finalCalcPlane + 'px';
        plane.style.top = finalCalcPlane + 'vh';
        high_score.innerHTML = plane.style.top;
        // night_plane_light.style.top = (finalCalcPlane + Paddings.light_from_plane_top) + 'px';
        night_plane_light.style.top = (finalCalcPlane + Paddings.light_from_plane_top * Constants.vhpx_factor) + 'vh';
    } 
    // console.log(s);
    // console.log(s);
    // }, 10);
}


function setScore() {
    // score = Math.floor(Math.pow(timestamp / 100, 1.05));
    current_score.innerHTML = score;
}


function playAgain() {
    start = undefined;
    gameOver = false;
    score = 0;
    setScore();
    control_speed_towers = 100;
    control_speed_bird = 100;
    control_speed_plane = 200;


    if (!is_day) {
        switchNightDay();
    }


    if (dead_timeout1) {
        clearTimeout(dead_timeout1);
    }
    if (dead_timeout2) {
        clearTimeout(dead_timeout2);
    }

    initialInterval = setInterval(() => {
        initialIntervalRunner();
    }, 1000 / 60);

    plane.classList.remove('plane-dead-2');
    plane.classList.remove('include-move-transition');
    plane.setAttribute('style', '');
    towers.setAttribute('style', '');
    bird_image.setAttribute('style', '');

    towers_movement = 0;
    bird_movement = -50;

    main_frame.classList.add('banner-hide');
    
    setTimeout(function() {
        main_frame.classList.remove('banner-hide');
        main_frame.classList.replace('gameover', 'playing');
        night_plane_light.style.display = 'initial';
    }, 1000);
    startGame();
}

var dead_timeout1, dead_timeout2;
function showGameover() {
    // banner_allow_mic.animate([
    //     {opacity: 1}, {opacity: 0}
    // ], {duration: 200, fill: "forwards"});
    // banner_allow_mic.style.display = 'none';
    // banner_start.style.display = 'initial';
    // banner_start.animate([
    //     {opacity: 0}, {opacity: 1}
    // ], {duration: 200, fill: "forwards"});
    var high_score = localStorage.getItem("high_score");

    if (high_score) {
        if (score > high_score) {
            high_score = score;
            localStorage.setItem("high_score", score);
            banner_did_highscore.innerHTML = "New High Record! ";
            banner_current_score.innerHTML = score;
            banner_high_score.innerHTML = score;
        } else {
            banner_did_highscore.innerHTML = "";
            banner_current_score.innerHTML = score;
            banner_high_score.innerHTML = high_score;
        }
    } else {
        high_score = score;
        localStorage.setItem("high_score", score);
        banner_did_highscore.innerHTML = "New High Record! ";
        banner_current_score.innerHTML = score;
        banner_high_score.innerHTML = score;
    }
    
    plane.classList.add('include-move-transition');
    main_frame.classList.replace('playing', 'gameover');

    clearInterval(dayNightInterval);
    clearInterval(scoreCounterInterval);

    let explode = document.createElement("img");
    explode.setAttribute("class", "explosion");
    explode.style.top = plane.getBoundingClientRect().top + Paddings.explostion_from_plane_top  + 'px';
    explode.style.left = plane.getBoundingClientRect().left + Paddings.explostion_from_plane_left + 'px';
    explode.setAttribute("src", AssetsURL.explosion);
    top_section.appendChild(explode);

    night_plane_light.style.display = 'none';

    plane.classList.add('plane-dead-1');

    dead_timeout1 = setTimeout(() => {plane.classList.remove('plane-dead-1'); explode.remove();}, 700);
    dead_timeout2 = setTimeout(() => {plane.classList.add('plane-dead-2');}, 1000);

}


function checkPlaneOverlap(tower) {
    let rect1 = tower.getBoundingClientRect();
    let rect2 = plane.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}


function incrementSpeeds(fraction) {
    if (intervalTrackers.incrementSpeed === 0) {
        if (control_speed_plane < Constants.control_speed_plane_max) {
            control_speed_plane += fraction;
        }
        if (control_speed_bird < Constants.control_speed_bird_max) {
            control_speed_bird += fraction;
        }
        control_speed_towers += fraction;
    }
}

function mainInterval(time) {
    const fraction = time / 16;

    shiftItems(fraction);
    incrementSpeeds(fraction);
    checkMicrophone(fraction);

    returnTrackers(fraction);

    return false;
}

// function microphoneInterval() {
//     checkMicrophone();

// }

// function startMicrophoneInterval() {
//     return setInterval(function() {

//     }, 1000/60);
// }


function initialIntervalRunner() {
    hills_movement += control_speed_towers / 50;
    // hills.style.backgroundPositionX = -hills_movement + 'px';
    hills.style.backgroundPositionX = -hills_movement * Constants.vwpx_factor + 'vw';

    if (intervalTrackers.addSmoke === 0) {
        addSmoke();
    }

    document.querySelectorAll(Identifiers.smoke).forEach(function (smoke) {
        // smoke.style.left = (smoke.getBoundingClientRect().left - 4) + 'px';
        smoke.style.left = (smoke.getBoundingClientRect().left - 4) * Constants.vwpx_factor + 'vh';
    });

    returnTrackers();
}
var initialInterval = setInterval(() => {
    initialIntervalRunner();
}, 1000 / 60);




// setInterval(function() {
//     // document.querySelectorAll('.smoke').forEach(function(smoke) {
//     //     smoke.style.left = (smoke.getBoundingClientRect().left - 4) + 'px';
//     // });
// }, 1000/60);

// setInterval(() => {
//     // if (has_plane_moved) {
//         var newSmoke = document.createElement('img');
//         newSmoke.onload = function() {
//             newSmoke.animate([
//                 {"opacity": "1"},
//                 {"opacity": "0"},
//             ], {duration: 200});

//             setTimeout(function() {
//                 newSmoke.remove();
//             }, 200);
//         };
//     // setInterval(function() {


//     // }, 100);
//     // newSmoke.setAttribute("src", "assets/images/smoke_left.png");

//         newSmoke.setAttribute("src", "assets/images/smoke_left.png");
//         newSmoke.setAttribute("class", "smoke");
//         // should_touch_smoke = true;
//         newSmoke.style.top = (plane.getBoundingClientRect().top + 34) + 'px';
//         top_section.appendChild(newSmoke);
//     // } else  {
//     //     var newSmoke = document.createElement('img');
//     //     newSmoke.onload = function() {
//     //         newSmoke.animate([
//     //             {"opacity": "1"},
//     //             {"opacity": "0"},
//     //         ], {duration: 200});

//     //         setTimeout(function() {
//     //             newSmoke.remove();
//     //         }, 200);
//     //     };
//     // // setInterval(function() {


//     // // }, 100);
//     // // newSmoke.setAttribute("src", "assets/images/smoke_left.png");

//     //     newSmoke.setAttribute("src", "assets/images/smoke_left.png");
//     //     newSmoke.setAttribute("class", "smoke2");
//     //     should_touch_smoke = true;
//     //     newSmoke.style.top = (plane.getBoundingClientRect().top + 35) + 'px';
//     //     top_section.appendChild(newSmoke);
//         // alert('1');
//         // newSmoke.setAttribute("src", "assets/images/smoke_frames/frame_0.png");
//         // newSmoke.setAttribute("src", "assets/images/smoke2.gif");
//         // newSmoke.setAttribute("class", "smoke");
//         // smoke.animate([
//         //     {"opacity": "0"},
//         //     {"opacity": "1"}
//         // ], {duration: 200});



//         // smoke.style.top = (plane.getBoundingClientRect().top + 35) + 'px';
//         // smoke.style.opacity = 1;
//         // smoke.animate(
//         //     [{opacity: "0", left: "220px"},
//         //     {opacity: "1", left: "140px"}]
//         // , {
//         //     duration: 500, fill: "forwards"
//         // });
//     //     should_touch_smoke = false;
//     // }

//     // newSmoke.setAttribute("class", "smoke2");
// }, 1000/10);


// var hills_movement = 0;
// setInterval(() => {
//     // hills_movement += control_speed_towers / 50;
//     // hills.style.backgroundPositionX = -hills_movement + 'px';



//     // document.querySelectorAll('.smoke-to-move').forEach(function(smk) {
//     //     smk.style.left = (smk.getBoundingClientRect().left - 4) + 'px';
//     //     // alert('f');
//     // });

//     // if (should_touch_smoke) {
//     //     smoke.style.left = (smoke.getBoundingClientRect().left - 4) + 'px';
//     // }
// }, 1000/60);

// setTimeout(start_game, 3000);


let start, gameOver = false;

function step(timestamp) {
    if (start === undefined) {
        start = timestamp;
    }

    mainInterval(timestamp - start);
    setScore(timestamp);

    // console.log(Identifiers.tower + ' , ' + Identifiers.bird_image)
    document.querySelectorAll(Identifiers.tower + ' , ' + Identifiers.bird_image).forEach(function (c_tower) {
        if (checkPlaneOverlap(c_tower)) {
            gameOver = true;
        }
    });

    start = timestamp;

    if (!gameOver) {
        window.requestAnimationFrame(step);
    } else {
        showGameover();
    }
}



function startGame() {
    // plane.animate([
    //     {"transform": "scale(4)", "left": "320px"},
    //      {"transform": "scale(1)", "left": "250px"}
    // ],
    // {duration: 500, fill: "forwards"});
    // main_frame.setAttribute('class', 'day-initial playing');
    main_frame.classList.replace('not-started', 'playing');
    initiateInitialTowers();


    setTimeout(function () {
        plane.classList.remove('include-move-transition');
        clearInterval(initialInterval);

        var tempBottom = setInterval(function() {
            if (plane.getBoundingClientRect().bottom >= window.innerHeight) {
                gameOver = true;
            }
        }, 10);

        setTimeout(function() {clearInterval(tempBottom)}, 10000);

        scoreCounterInterval = setInterval(function() {
            score += 10;
            setScore();
        }, 50);


        // var main_interval = requestInterval(mainInterval, 0);
        window.requestAnimationFrame(step);
        // var main_interval = setInterval(mainInterval, 1000/60);
        // var microphone_interval = requestInterval(microphoneInterval, 5);
        // var microphone_interval = setInterval(microphoneInterval, 10);
        // var microphone_interval = startMicrophoneInterval();

    }, Constants.game_initial_delay);


    // setInterval(function() {
    //     if (control_speed_plane < 400) {control_speed_plane += 1}
    //     if (control_speed_bird < 400) {control_speed_bird += 1}
    //     control_speed_towers += 1;
    // }, 500);

    // var tower_colors = {
    //     "main_border": ["#2195f3", "#ffc107", "#4caf4f", "#ff6d40", "#c619ff"],
    //     "window": ["#8fdfff", "#ffeb3b", "#76ed78", "#ffb9a6", "#dba3f0"],
    //     "window_light": ["#ccf1ff", "#fff5d6", "#b8ffba", "#ffddd4", "#f2d1ff"]
    // };




    // var planeImage = document.querySelector('.plane > img');

    // function nextPlaneFrame() {
    //     var nextFrameNumber = String((Number(planeImage.getAttribute("data-frame")) + 1) % 13);
    //     planeImage.setAttribute("src", "assets/images/plane_frames/frame_" + nextFrameNumber + "_delay-0.05s.png");
    //     planeImage.setAttribute("data-frame", nextFrameNumber);
    // }

    // function animatePlane() {
    //     while (true) {
    //         setTimeout(function() {
    //             var nextFrameNumber = String((Number(planeImage.getAttribute("data-frame")) + 1) % 13);
    //             planeImage.setAttribute("src", "assets/images/plane_frames/frame_" + nextFrameNumber + "_delay-0.05s.png");
    //             planeImage.setAttribute("data-frame", nextFrameNumber);
    //         }, 50);
    //     }
    // }




    // var planeWorker = new Worker('./plane_animator.js');

    // var worker = new Worker(URL.createObjectURL(new Blob(["("+animatePlane.toString()+")()"], {type: 'text/javascript'})));



    // var towers_movement = 0;
    // // var hills_movement = 0;
    // setInterval(() => {
    //     // towers_movement += 4;
    //     towers_movement += control_speed_towers / 25;
    //     // hills_movement += 2;
    //     // hills_movement += control_speed / 50;
    //     if (towers.lastElementChild.getBoundingClientRect().right - window.outerWidth < 10) {
    //         var mr = getComputedStyle(towers.firstElementChild).marginRight;
    //         towers_movement -= (towers.firstElementChild.offsetWidth + Number(mr.substring(0, mr.length - 2)));
    //         towers.removeChild(towers.firstElementChild);

    //         let newTower = document.createElement("div");
    //         newTower.setAttribute("class", "tower h50");
    //         newTower.style.top = (5 + Math.random() * 50) + '%';
    //         newTower.innerHTML = generateRandomTower();
    //         towers.appendChild(newTower);
    //         // a -= towers.removeChild(towers.firstElementChild).offsetWidth;
    //         // console.log("Y");
    //     }
    //     towers.style.left = -towers_movement + 'px';
    //     // hills.style.backgroundPositionX = -hills_movement + 'px';



    //     // document.querySelectorAll('.smoke-to-move').forEach(function(smk) {
    //     //     smk.style.left = (smk.getBoundingClientRect().left - 4) + 'px';
    //     //     // alert('f');
    //     // });

    //     // if (should_touch_smoke) {
    //     //     smoke.style.left = (smoke.getBoundingClientRect().left - 4) + 'px';
    //     // }
    // }, 1000/60);

    // var has_plane_moved = false;
    // // var is_plane_fix
    // var plane_last_position = plane.style.top;
    // var add_long_smoke = true;
    // setInterval(() => {
    //     if (plane_last_position !== plane.style.top) {
    //         // smoke.style.top = (smoke_top + 35* Math.sin(plane_movement)) + 'px';
    //         // smoke.animate([
    //         //     {"opacity": "1"},
    //         //     {"opacity": "0"},
    //         // ], {duration: 2000});
    //         // smoke.style.animation = ".2s fadeout";
    //         if (!has_plane_moved && add_long_smoke) {
    //             var newLongSmoke = smoke.cloneNode();
    //             smoke.style.opacity = 0;
    //             newLongSmoke.setAttribute("class", "smoke-to-move");

    //             newLongSmoke.onload = function() {
    //                 newLongSmoke.animate([
    //                     {"opacity": "1"},
    //                     {"opacity": "0"},
    //                 ], {duration: 200});

    //                 setTimeout(function() {
    //                     newLongSmoke.remove();
    //                 }, 200);
    //             };

    //             add_long_smoke = false;

    //             top_section.append(newLongSmoke);
    //         }
    //         has_plane_moved = true;

    //         // smoke.setAttribute("class", "smoke-to-move");
    //         // setTimeout(function() {
    //         //     smoke.animate([
    //         //     {"opacity": "0"},
    //         //     {"opacity": "1"}
    //         // ], {duration: 2000});}, 0);
    //     } else {
    //         has_plane_moved = false;
    //         add_long_smoke = true;
    //     }
    //     plane_last_position = plane.style.top;

    // }, 1000/60);



    // var bird_movement = bird_container.style.right;
    // var bird_movement = -50;
    // setInterval(() => {
    //     // bird_movement += 5;
    //     bird_movement += (control_speed_bird / 20);

    //     // TEMPORARY
    //     if (bird_container.firstElementChild.getBoundingClientRect().right + 30 < 10) {
    //         bird_movement = -50;
    //         // bird_container.removeChild(bird_container.firstElementChild);
    //         // let newBird = document.createElement("img");
    //         // newBird.setAttribute("src", "assets/images/bird.gif");
    //         // newBird.style.top = (10 + Math.random() * (bird_container.offsetHeight - 10)) + 'px';
    //         bird_image.style.top = (10 + Math.random() * (bird_container.offsetHeight - 10)) + 'px';
    //         // bird_container.appendChild(newBird);
    //         // a -= towers.removeChild(towers.firstElementChild).offsetWidth;
    //         // console.log("Y");
    //     }
    //     bird_container.firstElementChild.style.right = bird_movement + 'px';
    // }, 1000/60);

    // for (var i = 0; i < 10; i++) {

    // }



    // var is_red_light_on = true;
    // setInterval(() => {
    //     if (is_red_light_on) {
    //         night_plane_red_light.style.background = 'black';
    //         is_red_light_on = false;
    //     } else {
    //         night_plane_red_light.style.background = 'red';
    //         is_red_light_on = true;
    //     }
    // }, 1000);



    // gramin_day_to_night.pause();

    // var gramin_night_to_day = new Granim({
    //     element: '.background-canvas',
    //     direction: 'top-bottom',
    //     stateTransitionSpeed: 700,
    //     // isnot-startedWhenNotInView: true,
    //     // loop: false,
    //     states : {
    //         "default-state": {
    //             gradients: [
    //                 ['#000428', '#004e92'],
    //                 ['#bbfeff', '#ffffff']
    //             ],
    //             loop: false,
    //             transitionSpeed: 700
    //         }
    //     }
    // });
    // gramin_night_to_day.pause();



    dayNightInterval = setInterval(function () {
        switchNightDay();
    }, 30000);

    // setTimeout(function() {
    //     switchNightDay();
    // }, 10000);


    // function getLocalStream() {
    //     navigator.mediaDevices.getUserMedia({video: false, audio: true}).then( stream => {
    //         window.localStream = stream; // A
    //         // window.localAudio.srcObject = stream; // B
    //         // window.localAudio.autoplay = true; // C
    //     }).catch( err => {
    //         console.log("u got an error:" + err);
    //     });
    // }







    // var plane_top = plane.getBoundingClientRect().top;
    // var nl_top = night_plane_light.getBoundingClientRect().top;
    // var nlr_top = night_plane_red_light.getBoundingClientRect().top;


    // var mic_low = 15;
    // setTimeout(function() {
    //     // getLocalStream();

    //     // Mic.startMic();
    //     // alert("f")
    //     setInterval(function() {
    //         var s = Mic.getRMS(Mic.spectrum);
    //         // alert(s)
    //         var final = Math.pow(control_speed_plane, 1.05);
    //         // if (s > 25 * Math.log10(control_speed)) {
    //         if (s > mic_low) {
    //             final -= (Math.pow(control_speed_plane, 1.15) / 100) * s;
    //         }

    //         var finalCalcPlane = (plane.getBoundingClientRect().top + (final) / 100);
    //         // var finalCalcLight = (night_plane_light.getBoundingClientRect().top + (final) / 100);
    //         // var finalCalcRedLight = (night_plane_red_light.getBoundingClientRect().top + (final) / 100);
    //         if (finalCalcPlane >= 0) {
    //             plane.style.top = finalCalcPlane + 'px';
    //             night_plane_light.style.top = (finalCalcPlane + 17) + 'px';
    //             night_plane_red_light.style.top = (finalCalcPlane + 55) + 'px';
    //         }
    //         // console.log(s);
    //         // console.log(s);
    //     }, 10);
    // }, 1000);

    // setInterval(function() {
    //     plane.style.top = (plane.getBoundingClientRect().top + 2) + 'px';
    // }, 1000/60);



    // var plane_top = plane.getBoundingClientRect().top;
    // var nl_top = night_plane_light.getBoundingClientRect().top;
    // var nlr_top = night_plane_red_light.getBoundingClientRect().top;
    // // var smoke_top = smoke.getBoundingClientRect().top;
    // var plane_movement = 0;
    // var plane_movement2 = 0;
    // // night_plane_light.style.top = nl_top + 'px';
    // setInterval(() => {
    //     plane_movement2 += 0.1;
    //     if (plane_movement2 < 40 && plane_movement2 > 20) {
    //         plane_movement += 0.1;
    //         plane.style.top = (plane_top + 35* Math.sin(plane_movement)) + 'px';
    //         night_plane_light.style.top = (nl_top + 35* Math.sin(plane_movement)) + 'px';
    //         night_plane_red_light.style.top = (nlr_top + 35* Math.sin(plane_movement)) + 'px';
    //     }

    //     // if (Math.abs(towers.lastElementChild.getBoundingClientRect().right - window.outerWidth) <= 10) {
    //     //     var mr = getComputedStyle(towers.firstElementChild).marginRight;
    //     //     towers_movement -= (towers.firstElementChild.offsetWidth + Number(mr.substring(0, mr.length - 2)));
    //     //     towers.removeChild(towers.firstElementChild);

    //     //     let newTower = document.createElement("div");
    //     //     newTower.setAttribute("class", "tower h50");
    //     //     newTower.style.top = (5 + Math.random() * 50) + '%';
    //     //     newTower.innerHTML = generateRandomTower();
    //     //     towers.appendChild(newTower);
    //     //     // a -= towers.removeChild(towers.firstElementChild).offsetWidth;
    //     //     // console.log("Y");
    //     // }
    //     // towers.style.left = -towers_movement + 'px';
    // }, 1000/60);


    // plane_sound.addEventListener("canplaythrough", event => {

    //   });
    // plane_sound = new Audio("assets/sounds/plane.mp3");
    // var plane_sound = document.querySelector('.plane .plane-sound');
    // var audioElement = document.createElement('audio');
    // audioElement.setAttribute('src', 'assets/sounds/plane2.mp3');
    // audioElement.setAttribute('play', 'autoplay');
    // audioElement.loop = true;
    // audioElement.load();
    // audioElement.play();
    // plane_sound.loop = true;
    // plane_sound.load();
    // plane_sound.loop = true;
    // plane_sound.load();
    // plane_sound = new Audio("assets/sounds/plane2.mp3");
    //   setInterval(function() {

    //     plane_sound.play();


    //     // plane_sound.play();
    // }, 10);

}


btn_play.onclick = startGame;

btn_play_again.onclick = playAgain;

function config() {
    main_frame.classList.replace('gameover', 'config');
    main_frame.classList.replace('start', 'config');
    // if (cnd === "1") {
    //     banner_gameover.animate([
    //         {opacity: 1}, {opacity: 0}
    //     ], {duration: 200, fill: "forwards"});
    // } else {
    //     // alert("f")
    //     banner_start.animate([
    //         {opacity: 1}, {opacity: 0}
    //     ], {duration: 200, fill: "forwards"});
    // }

    // setTimeout(function() {
        // btn_record.setAttribute("data-origin", "gameover");
        banner_gameover.style.display = "none";
        banner_start.style.display = "none";
        banner_gameover.style.display = 'none';
        banner_config.animate([
            {opacity: 1}, {opacity: 0}
        ], {duration: 200, fill: "forwards"});
        // banner_hider.style.display = "initial";
        // banner_hider.animate([
        //     {opacity: 0}, {opacity: 1}
        // ], {duration: 200, fill: "forwards"});
        banner_config.style.display = 'initial';
        banner_config.animate([
            {opacity: 0}, {opacity: 1}
        ], {duration: 200, fill: "forwards"});
    // }, 2000);
}

btn_config.onclick = function() {
    btn_record.setAttribute("data-origin", "start");

    config();


}

btn_config_gameover.onclick = function() {
    btn_record.setAttribute("data-origin", "gameover");


    config();
}

var recCount = 0;
var recSum = 0;
var banner_counter_number = 10;
var counter_button_lock = false;
btn_record.onclick = function() {
    
    if (!counter_button_lock) {
        counter_button_lock = true;
        var cInterval = setInterval(function() {
            var s = Mic.getRMS(Mic.spectrum);
            recCount++;
            recSum += s;

            if ((recCount - 1) % 50 === 0) {
                btn_record.innerHTML = banner_counter_number;
                banner_counter_number--;
            }

            if (recCount === 500) {
                btn_record.innerHTML = "Done!";

                localStorage.setItem('microphone_low', recSum / recCount);
                mic_low = recSum / recCount;
                // alert(recSum + ' ' + recCount + ' ' + mic_low)


                recCount = 0;
                recSum = 0;
                banner_counter_number = 10;

                setTimeout(function() {
                    banner_start_subtitle.innerHTML = "You're all set! now click play and go! boooom";
                    banner_config.animate([
                        {opacity: 1}, {opacity: 0}
                    ], {duration: 200, fill: "forwards"});
                    banner_config.style.display = 'none';

                    if (btn_record.getAttribute("data-origin") === "start") {
                        banner_start.style.display = 'initial';
                        banner_start.animate([
                            {opacity: 0}, {opacity: 1}
                        ], {duration: 200, fill: "forwards"});

                        main_frame.classList.replace('config', 'start');
                    } else {  // gameover
                        banner_gameover.style.display = 'initial';
                        banner_gameover.animate([
                            {opacity: 0}, {opacity: 1}
                        ], {duration: 200, fill: "forwards"});

                        main_frame.classList.replace('config', 'gameover');
                    }

                    btn_record.innerHTML = `Start <img src="assets/images/microphone.svg">`;
                    counter_button_lock = false;

                }, 500);

                clearInterval(cInterval);
            }
        }, 20);
    }
}

btn_allow_mic.onclick = function() {
    Mic = new Microphone();

    navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
    }).then(stream => {
        window.localStream = stream; // A
        Mic.init();

        mic_low = localStorage.getItem('microphone_low');


        // mic_low = 15;

        if (mic_low) {
            banner_allow_mic.animate([
                {opacity: 1}, {opacity: 0}
            ], {duration: 200, fill: "forwards"});
            banner_allow_mic.style.display = 'none';
            banner_start.style.display = 'initial';
            banner_start.animate([
                {opacity: 0}, {opacity: 1}
            ], {duration: 200, fill: "forwards"});
        } else {
            banner_allow_mic.animate([
                {opacity: 1}, {opacity: 0}
            ], {duration: 200, fill: "forwards"});
            banner_allow_mic.style.display = 'none';

            btn_record.setAttribute("data-origin", "start");

            banner_config.style.display = 'initial';
            banner_config.animate([
                {opacity: 0}, {opacity: 1}
            ], {duration: 200, fill: "forwards"});
        }

        // window.localAudio.srcObject = stream; // B
        // window.localAudio.autoplay = true; // C
    }).catch(err => {
        error(err);
        // console.log("err");



        // console.log("u got an error:" + err);
    });
};


// window.onload = function() {
let hs = localStorage.getItem("high_score");

if (hs) {
    high_score.innerHTML = "H : " + hs;
}
// };

// preload
var image = new Image();
image.src = 'assets/images/explosion.gif';
// switchNightDay();