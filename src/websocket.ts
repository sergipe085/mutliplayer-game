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
}

const users: IUser[] = [];

interface IMoveRequest {
    direction: "up" | "down" | "left" | "right";
}

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
            };

            users.push(newUser);
        }

        io.emit("players", users);
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

    console.log("--------------------------");
    console.log(users);

    io.emit("players", users);
}
