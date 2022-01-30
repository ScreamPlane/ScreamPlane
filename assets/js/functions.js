var is_day = true;


function generateRandomTower() {
    var index = Math.floor(Math.random() * (Constants.tower_colors.border.length));
    return SVGContents.tower_html.replace('{border}', Constants.tower_colors.border[index])
        .replace('{fill_color}', Constants.tower_colors.fill_color[index])
        .replace('{glass}', Constants.tower_colors.glass[index])
        .replace('{light_on_glass}', Constants.tower_colors.light_on_glass[index]);
}

var granim = new Granim({
    element: Identifiers.background_canvas,
    direction: 'top-bottom',
    stateTransitionSpeed: Constants.background_gradient_transition_speed,
    states: {
        "default-state": {
            gradients: [Constants.background_gradient_day],
            loop: false
        },

        "night-state": {
            gradients: [Constants.background_gradient_night],
            loop: false
        }
    }
});


function switchNightDay() {
    if (is_day) {
        main_frame.classList.replace('day', 'night');
        granim.changeState('night-state');
        is_day = false;
        bird_image.setAttribute("src", "assets/images/night_bird.gif");
    } else {
        main_frame.classList.replace('night', 'day');
        granim.changeState('default-state');
        is_day = true;
        bird_image.setAttribute("src", "assets/images/bird.gif");
    }
}
