import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";


const app = express();
app.use(cors())

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});


let players = {};

io.on("connection", socket => {
    console.log(`Player ${socket.id} connected`);
    players[socket.id] = {
        id: socket.id,
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
        direction: {x:0, y:0},
        snake: [{ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }],
    }
    io.emit("updatePlayers", players);
    
    
    socket.on("changeDirection", (direction) => {
        // if (direction.x !== -players[socket.id].direction.x && direction.y !== -players[socket.id].direction.y) {
        //     players[socket.id].direction = direction;
        // }
        if (
            (direction.x === -players[socket.id].direction.x && direction.y === 0) ||
            (direction.y === -players[socket.id].direction.y && direction.x === 0)
        ) {
            return;
        }
        players[socket.id].direction = direction;
        
    });
    
    socket.on('disconnect', () => {
        console.log(`Player ${socket.id} disconnected`);
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});



setInterval(() => {
    for (let id in players) {
        const player = players[id];
        if (player.is_over) {
            continue;
        }
        player.snake.unshift({ x: player.x, y: player.y }); // 插入蛇头  
        // 更新位置  
        player.x += player.direction.x;
        player.y += player.direction.y;
        player.snake.pop(); // 移除蛇尾
        // 边界处理  
        if (player.x > 20 || player.x < 1 || player.y > 20 || player.y < 1) {
            player.is_over = true;
        }
        // player.x = (player.x + 21) % 21;
        // player.y = (player.y + 21) % 21;
    }

    // 广播更新后的玩家状态  
    io.emit('updatePlayers', players);
    
}, 1000);


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})