const Constants = {
    tower_colors: {
        "border": ["#006164", "#1b5e1f", "#880e4f", "#ef6c00"],
        "fill_color": ["#00838f", "#388e3d", "#c2185c", "#ffa200"],
        "glass": ["#82b2ff", "#81c784", "#f48fb0", "#f5ff81"],
        "light_on_glass": ["#d9d9d9", "#d9d9d9", "#d9d9d9", "#d9d9d9"]
    },

    background_gradient_day: ['#bbfeff', '#ffffff'],  // top-bottom
    background_gradient_night: ['#000428', '#004e92'],  // top-bottom
    background_gradient_transition_speed: 700,  // ms
    
    control_speed_plane_max: 500,
    control_speed_bird_max: 400,
    max_tower_top_percent: 50,
    tower_top_margin: 5,

    game_initial_delay: 1000,  // ms
};

const AssetsURL = {
    smoke: "assets/images/smoke_left.png",
    explosion: "assets/images/explosion.gif",
};

const Paddings = {
    smoke_from_plane_top: 34,  // px
    light_from_plane_top: 17,  // px
    explostion_from_plane_top: -10,  // px
    explostion_from_plane_left: 0  // px
};
