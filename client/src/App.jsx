import {useEffect, useState} from "react";
import {io} from "socket.io-client";


const GRID_SIZE = 20;

const App = () => {

    const [players, setPlayers] = useState({});
    const [socket, setSocket] = useState(null);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const socketIO = io('http://localhost:3001');

        setSocket(socketIO);

        socketIO.on('updatePlayers', (players) => {
            setPlayers(players);
            // drawSnake(players);
        });

        return () => {
            console.log(`socket IO disconnected`);
            socketIO.disconnect();
        }
    }, []);
    


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !started) {
            setStarted(true);
            console.log('Game started'); // 这里也增加一个日志  
        }
        if (started) {
            const keyMap = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

            if (!keyMap.includes(e.key)) {
                return;
            }
            let direction = {x: 0, y: 0};
            switch (e.key) {
                case 'ArrowUp':
                    direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    direction = {x: 1, y: 0};
                    break;
                default:
                    break;
            }
            if (direction.x !== 0 || direction.y !== 0) {
                socket.emit('changeDirection', direction);
            }
        }
    }

    useEffect(() => {

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [socket, started]);

    // const getCellClass = (row, col) => {
    //
    // }

    //
    // const drawSnake = (players) => {
    //     const gameEle = document.getElementById('game-grid');
    //     gameEle.innerHTML = '';
    //    
    //     Object.values(players).forEach((player) => {
    //    
    //         player.snake.forEach(({x, y}) => {
    //             const div = document.createElement('div');
    //             div.style.gridRowStart = y;
    //             div.style.gridColumnStart = x;
    //             if (player.id === socket.id){
    //                 div.classList.add('snake');
    //             }else{
    //                 div.classList.add('other-snake');
    //             }
    //             gameEle.appendChild(div);
    //         })
    //     })
    // }


    return (
        <div className="game">
            <h1>多人</h1>
            <div className="grid" id="game-grid" style={{
                display: 'grid',
                gridTemplateRows: `repeat(${GRID_SIZE}, 30px)`,
                gridTemplateColumns: `repeat(${GRID_SIZE}, 30px)`,
                margin: "auto",
                marginTop: "20px",
                width: `${GRID_SIZE * 30}px`,
                backgroundColor: "black"
            }}>
                {/*{[...Array(GRID_SIZE)].map((_, rowIndex) => (*/}
                {/*    <div key={rowIndex} className="row">*/}
                {/*        {[...Array(GRID_SIZE)].map((_, colIndex) => (*/}
                {/*            <div key={colIndex} className={`cell ${getCellClass(rowIndex, colIndex)}`}></div>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*))}*/}

                {
                    Object.values(players).map((player, i) => {
                        let backColor;
                        if (player.id === socket.id) {
                            backColor = "greenyellow";
                        } else {
                            backColor = "orange";
                        }
                        return player.snake.map((position, index) => {
                            const key = i.toString() + index.toString();
                            // const style = `grid-row-start:${position.y};grid-col-start:${position.x}`;
                            return (<div style={{
                                gridRowStart: position.y,
                                gridColumnStart: position.x,
                                backgroundColor: backColor
                            }} className='snake' key={key}></div>);
                        });

                    })
                }
            </div>
            {!started && <h2>按 Enter 开始游戏</h2>}
        </div>

    );

};


export default App;
