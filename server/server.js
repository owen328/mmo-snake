import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get("/", (req, res) => {
    res.json({
        status: "success"
    });
});
const server = http.createServer(app);

const io = new Server(server);


let sockets = {};
let players = {};
let foods = [];
io.on("connection", socket => {
    console.log(`Player ${socket.id} connected`);
    // players[socket.id] = initPlayer(socket.id, true);
    // io.emit("updateGame", players);
    sockets[socket.id] = socket;

    socket.on('startGame', (started) => {
        players[socket.id] = initPlayer(socket.id, started);
    });
    
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
        io.emit('updateGame', players);
    });
});


const initPlayer = (socketId, isStart) => {
    let x = 0,y=0;
    
    if (isStart){
        ({x, y} = genRandomPosition());
    }
    return {
        id: socketId,
        is_start: isStart,
        x: x,
        y: y,
        // is_over: true,
        direction: isStart ? {x:0, y:0} : null,
        snake: isStart ? [{ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }] : null,
    }
}

const getGameData = () => {
    return {
        players: players,
        foods: foods,
    }
}

const genRandomPosition = () => {
    return {
        x: Math.floor(Math.random() * 20) + 1,
        y: Math.floor(Math.random() * 20) + 1,
    }
}

setInterval(() => {
    if (Object.keys(players).length !== 0 && foods.length === 0) {
        foods.push(genRandomPosition());
    }
    for (let id in players) {
        const player = players[id];
        if (!player.is_start) {
            continue;
        }
        // 更新位置  
        player.x += player.direction.x;
        player.y += player.direction.y;
        player.snake.unshift({ x: player.x, y: player.y }); // 插入蛇头  

        //吃food
        if (foods.some(food => {
            return food.x === player.x && food.y === player.y;
        })){
            foods = foods.filter(food => {
                return food.x !== player.x && food.y !== player.y
            });
        }else{
            player.snake.pop(); // 移除蛇尾
        }
        

        // 边界处理  
        if (player.x > 20 || player.x < 1 || player.y > 20 || player.y < 1) {
            player.is_start = false;
        }

        // 蛇相互吃
        if (Object
            .values(players)
            //过滤掉player自己
            .filter((item) => item.id !== player.id)
            .some((item) => {
                //当player的头坐标和其他snake的身体的坐标相等时,即player挂了
                return item.snake.some(({x,y}) => {
                    return x === player.x && y === player.y
                });
            })) {
            player.is_start = false;
        }
        
        // player.x = (player.x + 21) % 21;
        // player.y = (player.y + 21) % 21;
    }

    // 广播更新后的游戏数据  
    io.emit('updateGame', getGameData());
    
}, 500);


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})