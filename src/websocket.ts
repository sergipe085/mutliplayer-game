/* eslint-disable no-param-reassign */
/* eslint-disable dot-notation */
/* eslint-disable no-use-before-define */
import { io } from "./http";

const direction_position = {
    up: {
        x: 0,
        y: -1,
    },
    down: {
        x: 0,
        y: 1,
    },
    right: {
        x: 1,
        y: 0,
    },
    left: {
        x: -1,
        y: 0,
    },
};

interface IOptions {
    width: number;
    height: number;
    max_players: number;
}

const options: IOptions = {
    width: 16,
    height: 16,
    max_players: 16,
};

interface IVector {
    x: number;
    y: number;
}

interface IUser {
    socket_id: string;
    username: string;
    position: IVector;
    score: number;
}

let users: IUser[] = [];

interface IMoveRequest {
    direction: "up" | "down" | "left" | "right";
}

interface IFruit {
    position: IVector;
    size: 1;
}

const fruit: IFruit = {
    position: {
        x: 0,
        y: 0,
    },
    size: 1,
};

io.on("connection", async (socket) => {
    socket.on("connectToGame", (data) => {
        const { username } = data;

        const userAlreadyExists = users.find(
            (user) => user.username === username
        );

        if (userAlreadyExists) {
            userAlreadyExists.socket_id = socket.id;
        } else {
            const newUser: IUser = {
                socket_id: socket.id,
                username,
                position: {
                    x: 8,
                    y: 8,
                },
                score: 0,
            };

            users.push(newUser);
        }

        io.emit("players", users);
        socket.emit("fruit", fruit);
    });

    socket.on("move", (data: IMoveRequest) => {
        const { direction } = data;

        const user = users.find((val) => val.socket_id === socket.id);

        if (user && canMove(user, direction)) {
            movePlayer(user, direction_position[direction]);
        }
    });
});

function canMove(user: IUser, direction: "up" | "down" | "left" | "right") {
    const checkers = {
        up: user.position.y - 1 >= 0,
        down: user.position.y + 1 <= options.height,
        right: user.position.x + 1 <= options.width,
        left: user.position.x - 1 >= 0,
    };

    return checkers[direction];
}

function movePlayer(user: IUser, new_position: IVector) {
    user.position.x += new_position.x;
    user.position.y += new_position.y;

    checkFruit(user);

    io.emit("players", users);
}

function checkFruit(user: IUser) {
    if (
        user.position.x === fruit.position.x &&
        user.position.y === fruit.position.y
    ) {
        score(user, 1);
    }
}

function score(user: IUser, size: number) {
    user.score += size;

    users = sortedUsers(users);

    io.emit("score", users);

    const newFruitPosition: IVector = {
        x: randomIntFromInterval(0, 16),
        y: randomIntFromInterval(0, 16),
    };

    setFruit(newFruitPosition);
}

function setFruit(position: IVector) {
    fruit.position.x = position.x;
    fruit.position.y = position.y;

    io.emit("fruit", fruit);
}

function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function sortedUsers(users: IUser[]) {
    return users.sort((a, b) => {
        if (a.score > b.score) {
            return -1;
        }
        if (a.score < b.score) {
            return 1;
        }

        return 0;
    });
}
