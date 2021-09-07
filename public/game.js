const socket = io("http://localhost:3000");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SIZE = 32;

const urlSearch = new URLSearchParams(window.location.search);

const username = urlSearch.get("username");

var fruit = null;

socket.emit("connectToGame", {
    username
})

document.addEventListener("keydown", (event) => {
    const key_direction = {
        "ArrowUp": "up",
        "ArrowDown": "down",
        "ArrowRight": "right",
        "ArrowLeft": "left",
    }

    updateFruit()

    socket.emit("move", {
        direction: key_direction[event.key]
    })
})

socket.on("players", (data) => {
    updateCanvas(data);
    updateScores(data);
})

socket.on("fruit", (data) => {
    fruit = { ...data };
    updateFruit();
})

socket.on("score", (data) => {
    updateScores(data);
})

function updateCanvas(players) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    players.forEach((player) => {
        if (player.username === username) {
            ctx.fillStyle = "green";
        } else {
            ctx.fillStyle = "gray";
        }
        ctx.fillRect(SIZE * player.position.x, SIZE * player.position.y, SIZE, SIZE);
    })

    updateFruit();
}

function updateFruit() {
    if (!fruit) {
        return;
    }

    ctx.fillStyle = "red";
    ctx.fillRect(SIZE * fruit.position.x, SIZE * fruit.position.y, SIZE, SIZE);
}

function updateScores(scores) {
    const scoresContainer = document.getElementById("score-container");

    var html = "";

    scores.forEach((score) => {
        html += `
            <div class="player">
                <p> ${score.score} - ${score.username} </p>
            </div>
        `
    });

    scoresContainer.innerHTML = html;
}

