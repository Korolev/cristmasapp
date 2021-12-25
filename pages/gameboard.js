import React, {useState, useEffect} from 'react';
import Layout from '../components/Layout';
import fetch from 'isomorphic-unfetch';
import axios from 'axios';

import * as firebaseApp from 'firebase/app';
import * as firebase from 'firebase';
import {firebaseConfig} from '../firebase/firebase.config'
import Button from "../components/UI/Button/Button";

import {devQuestions, prodQuestions} from "../utilites/questions";

const gridContent = devQuestions;
// const gridContent = prodQuestions;

const modifyResponse = (userData) => {
    let firstGamer;

    return userData
        .map(player => {
            if (player.tryAnswerTime && player.tryAnswerTime < (firstGamer && firstGamer.tryAnswerTime || Infinity)) {
                firstGamer = player;
            }
            return player;
        })
        .map(player => {
            player.active = firstGamer && player.id === firstGamer.id;

            return player;
        })
}

const Gameboard = () => {
    const [content, setContent] = useState(gridContent);
    const [players, setPlayers] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const [wsInstance, setWsInstance] = useState(null);

    useEffect(() => {
        console.log('WS subscribe');
        let ws;
        if (!!window) {
            ws = new WebSocket(`ws://${window.location.host.replace('3000','8000')}/wss`);
            setWsInstance(ws);

            ws.onmessage = (message) => {
                const data = JSON.parse(message.data);


                switch (data.action) {
                    case "updatePlayersList":
                        console.log("Object.values(message.payload)",Object.values(data.payload));
                        setPlayers(
                            modifyResponse(Object.values(data.payload))
                        )
                        break;
                }
            }

            // const send = (event) => {
            //     event.preventDefault();
            //     const name = document.getElementById("name").value;
            //     const message = document.getElementById("message").value;
            //     ws.send(JSON.stringify({
            //         name, message
            //     }))
            //     return false;
            // }
        }

        return () => {
            if (ws && ws.readyState !== 3) {
                ws.close();
            }
        }
    }, [])

    useEffect(() => {
        console.log('init');
        axios.get('/player/all').then(response => {
            setPlayers(modifyResponse(response.data));
        });

    }, []);

    const deleteMember = gamer => {
        if (confirm('Удалить игрока?')) {
            if (gamer.id) {
                axios.delete(`/player/${gamer.id}`).then(response => console.log(response));
            }
        }
    };

    const resetMembersTry = () => {
        axios.delete(`/reset/answer`)
            .then(response => console.log(response))
    };

    const updateActiveGamerScore = (score, callback) => {
        if (players && players.length) {
            players.forEach(player => {
                if (player.active) {
                    axios.patch(`/player/${player.id}`, {
                        id: player.id,
                        score: score + (player.score ? player.score : 0)
                    }).then(response => console.log(response))

                    callback();
                }
            })
        }
    };

    const showRightAnswer = () => {
        console.log('show right answer');
        setActiveQuestion({
            ...activeQuestion,
            text: activeQuestion.answer
        })
    };

    const onRightAnswer = () => {
        console.log('Right!!');
        if (activeQuestion) {
            activeQuestion.answered = true;
            updateActiveGamerScore(activeQuestion.score, () => {
                showRightAnswer();
                setTimeout(() => {
                    setActiveQuestion(null);
                    resetMembersTry();
                }, 3000)
            })
        }

    };

    const onWrongAnswer = () => {
        console.log('Wrong!!');
        if (activeQuestion) {
            updateActiveGamerScore(activeQuestion.score * -1, () => {
                resetMembersTry();
            })
        }
    };

    const showQuestionText = question => {
        if (!question.answered) {
            setActiveQuestion(question);
            // resetMembersTry();
        }

        // (async () => {
        //     const res = await fetch('https://cristmasapp-1d61d.firebaseio.com/categories.json');
        //     const json = await res.json();
        //     console.log(json);
        // })();
    };

    return (
        <Layout>
            <div className={'gameBoard'}>
                {content.map(item => (
                    <div
                        key={item.id}
                        className={'gameBoard__row'}
                    >
                        <div className={'questionText'}>
                            {item.category}
                        </div>
                        {item.questions.map(question => (
                            <div
                                className={'questionScore'}
                                onClick={() => showQuestionText(question)}
                                key={question.id}
                            >
                                {question.answered ? '•' : question.score}
                            </div>
                        ))}
                    </div>
                ))}
                {activeQuestion ? <div className={'activePopup'}>
                    <div className={'questionText'}>{activeQuestion.text}</div>
                    {activeQuestion.answered ? '' : <div className={'questionButtons'}>
                        <Button type={'success'} onClick={onRightAnswer}>Верно</Button>
                        <Button type={'error'} onClick={onWrongAnswer}>Не верно</Button>
                    </div>}

                </div> : ''}
            </div>
            <div className={'membersList'}>
                {players && players.map(gamer => (
                    <div
                        key={gamer.id}
                        className={['member__item', gamer.active ? 'member__item_active' : ''].join(' ')}
                        onClick={() => deleteMember(gamer)}
                    >
                        {gamer.name}
                        <div>{gamer.score}</div>
                    </div>
                ))}
            </div>
            <style jsx>{`
              .membersList,
              .gameBoard {
                color: #fefefe;
                position: relative;
              }

              .gameBoard {
                font-size: 2.25rem;
              }

              .activePopup {
                background: #141E30; /* fallback for old browsers */
                background: -webkit-linear-gradient(to top, #243B55, #141E30); /* Chrome 10-25, Safari 5.1-6 */
                background: linear-gradient(to top, #243B55, #141E30); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
                position: absolute;
                width: 100%;
                height: 100%;
                padding: 5%;
                box-sizing: border-box;
                top: 0;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }

              .questionButtons {
                display: flex;
                justify-content: space-between;
              }

              .gameBoard__row {
                display: flex;
                justify-content: space-between;
                flex: 1 1 auto;
                margin: .5rem 0;
              }

              .gameBoard__row > div {
                padding: 1rem 0.5rem;
              }

              .gameBoard__row .questionText {
                flex-grow: 8;
                width: 340px;
                font-size: 95%;
                padding-left: 1rem;
                overflow: hidden;
                white-space: nowrap;
              }

              .questionScore {
                background: #0F2027; /* fallback for old browsers */
                background: -webkit-linear-gradient(to top, #2C5364, #203A43, #0F2027); /* Chrome 10-25, Safari 5.1-6 */
                background: linear-gradient(to top, #2C5364, #203A43, #0F2027); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

                margin-right: 0.5rem;
                cursor: pointer;
                flex-grow: 1;
                text-align: center;
                width: 8%;
                height: 8%;
                overflow: hidden;
                border-radius: 5px;
                cursor: pointer;
              }

              .questionScore:hover {
                background: #141E30; /* fallback for old browsers */
                background: -webkit-linear-gradient(to top, #243B55, #141E30); /* Chrome 10-25, Safari 5.1-6 */
                background: linear-gradient(to top, #243B55, #141E30); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
              }

              .member__item {
                width: 20%;
                border: 1px solid #ddd;
                margin: 1rem;
                padding: 0.2rem 0.5rem;
                border-radius: 5px;
                text-align: center;
                padding: 2px;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }

              .membersList {
                display: flex;
                margin-top: 2.5rem;
                font-size: 2rem;
                justify-content: center;
              }

              .member__item > div {
                color: #ffEEAA;
              }

              .member__item_active {
                border: 3px solid #ffcc00;
                padding: 0px;
                box-shadow: 0 0 0 rgba(255, 200, 0, 0.4);
                animation: pulse 2s infinite;
              }

              @-webkit-keyframes pulse {
                0% {
                  -webkit-box-shadow: 0 0 0 0 rgba(204, 169, 44, 0.8);
                }
                70% {
                  -webkit-box-shadow: 0 0 0 15px rgba(204, 169, 44, 0.2);
                }
                100% {
                  -webkit-box-shadow: 0 0 0 0 rgba(204, 169, 44, 0);
                }
              }

              @keyframes pulse {
                0% {
                  -moz-box-shadow: 0 0 0 0 rgba(204, 169, 44, 0.8);
                  box-shadow: 0 0 0 0 rgba(204, 169, 44, 0.8);
                }
                70% {
                  -moz-box-shadow: 0 0 0 15px rgba(204, 169, 44, 0.2);
                  box-shadow: 0 0 0 15px rgba(204, 169, 44, 0.2);
                }
                100% {
                  -moz-box-shadow: 0 0 0 0 rgba(204, 169, 44, 0);
                  box-shadow: 0 0 0 0 rgba(204, 169, 44, 0);
                }
              }
            `}</style>
        </Layout>
    );
};

export default Gameboard;