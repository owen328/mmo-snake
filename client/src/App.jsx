import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";


const GRID_SIZE = 20;

const App = () => {

    // const [players, setPlayers] = useState({});
    const [socket, setSocket] = useState(null);
    const [started, setStarted] = useState(false);
    const [gridItems, setGridItems] = useState([]);
    
    useEffect(() => {
        const socketIO = io(window.location.host);

        setSocket(socketIO);

        socketIO.on('updateGame', (gameData) => {
            let tempItems = [];
            Object.values(gameData.players).forEach(player => {
                if (!player.is_start) {
                    if (player.id === socketIO.id){
                        setStarted(false);
                    }
                    return;
                }
                player.snake.forEach(({x,y}) => {
                    tempItems.push({
                        x: x,
                        y: y,
                        class: player.id === socketIO.id ? 'snake' : 'other-snake'
                    });
                });
                
            });
            gameData.foods.forEach(food => {
                tempItems.push({
                    x: food.x,
                    y: food.y,
                    class: 'food',
                });
            });
            
            setGridItems(tempItems);
            // setPlayers(gameData.players);
        });

        return () => {
            console.log(`socket IO disconnected`);
            socketIO.disconnect();
        }
    }, []);


    const handleKeyPress = (e) => {
        e.preventDefault();
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
        if (started) {
            socket.emit('startGame', true);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [socket, started]);


    useEffect(() => {
        return () => {
            if (started){
                alert('game over');
            }
        }
    }, [started]);
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
                {
                    gridItems.map((item, k) => {
                        return (
                            <div key={k} style={{
                                gridRowStart: item.y,
                                gridColumnStart: item.x,
                            }} className={item.class}></div>
                        );
                    })
                }
                {/*{[...Array(GRID_SIZE)].map((_, rowIndex) => (*/}
                {/*    <div key={rowIndex} className="row">*/}
                {/*        {[...Array(GRID_SIZE)].map((_, colIndex) => (*/}
                {/*            <div key={colIndex} className={`cell ${getCellClass(rowIndex, colIndex)}`}></div>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*))}*/}

                {/*{*/}
                {/*    Object.values(players).map((player, i) => {*/}
                {/*        if (!player.is_start) {*/}
                {/*            return;*/}
                {/*        }*/}
                {/*        let backColor;*/}
                {/*        if (player.id === socket.id) {*/}
                {/*            backColor = "greenyellow";*/}
                {/*        } else {*/}
                {/*            backColor = "orange";*/}
                {/*        }*/}
                {/*        return player.snake.map((position, index) => {*/}
                {/*            const key = i.toString() + index.toString();*/}
                {/*            // const style = `grid-row-start:${position.y};grid-col-start:${position.x}`;*/}
                {/*            return (<div style={{*/}
                {/*                gridRowStart: position.y,*/}
                {/*                gridColumnStart: position.x,*/}
                {/*                backgroundColor: backColor*/}
                {/*            }} className='snake' key={key}></div>);*/}
                {/*        });*/}
                
                {/*    })*/}
                {/*}*/}
            </div>
            {!started && <h2>按 Enter 开始游戏</h2>}
        </div>

    );

};


export default App;
