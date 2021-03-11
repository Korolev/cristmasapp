import React, {useState, useEffect} from 'react';
import Layout from '../components/Layout';
import fetch from 'isomorphic-unfetch';
import axios from 'axios';

import * as firebaseApp from 'firebase/app';
import * as firebase from 'firebase';
import {firebaseConfig} from '../firebase/firebase.config'
import Button from "../components/UI/Button/Button";

import { devQuestions, prodQuestions} from "../utilites/questions";

// const gridContent = devQuestions;
const gridContent = prodQuestions;

const Gameboard = () => {
    const [content, setContent] = useState(gridContent);
    const [gamers, setGamers] = useState([]);
    const [activeQuestion, setActiveQuestion] = useState(null);

    useEffect(() => {
        console.log('init');
        console.log(firebaseApp && firebaseApp.apps.length);
        if (firebaseApp && !firebaseApp.apps.length) {
            firebaseApp.initializeApp(firebaseConfig);
            let starCountRef = firebase.database().ref('gamers');

            starCountRef.on('value', (snapshot) => {
                let response = snapshot.val();
                let firstGamer;

                response && setGamers(Object.keys(response)
                    .map(key => {
                        let _gamer = {
                            ...response[key],
                            id: key
                        };
                        if (_gamer.tryAnswerTime && _gamer.tryAnswerTime < (firstGamer && firstGamer.tryAnswerTime || Infinity)) {
                            firstGamer = _gamer;
                        }
                        return _gamer;
                    })
                    .map(_gamer => {
                        _gamer.active = _gamer === firstGamer;
                        return _gamer;
                    })
                )

            });
        } else if (firebaseApp && firebaseApp.apps.length) {

        }
    });

    const deleteMember = gamer => {
        if (confirm('Удалить игрока?')) {
            if (gamer.id) {
                axios.delete(`https://cristmasapp-1d61d.firebaseio.com/gamers/${gamer.id}.json`).then(response => console.log(response));
            }
        }
    };

    const resetMembersTry = () => {
        if (gamers && gamers.length) {
            gamers.forEach(gamer => axios
                .delete(`https://cristmasapp-1d61d.firebaseio.com/gamers/${gamer.id}/tryAnswerTime.json`)
                .then(response => console.log(response))
            )
        }
    };

    const updateActiveGamerScore = (score, callback) => {
        if(gamers && gamers.length){
            gamers.forEach( gamer => {
                if(gamer.active){
                    let gamerUrl = `https://cristmasapp-1d61d.firebaseio.com/gamers/${gamer.id}`;
                    axios.patch(`${gamerUrl}.json`, {
                        name: gamer.name,
                        score: gamer.score + score
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
        if(activeQuestion){
            activeQuestion.answered = true;
            updateActiveGamerScore(activeQuestion.score, () => {
                showRightAnswer();
                setTimeout(() => {
                    setActiveQuestion(null);
                    resetMembersTry();
                },3000)
            })
        }

    };

    const onWrongAnswer = () => {
        console.log('Wrong!!');
        if(activeQuestion){
            updateActiveGamerScore(activeQuestion.score * -1, () => {
                resetMembersTry();
            })
        }
    };

    const showQuestionText = question => {
        if (!question.answered) {
            setActiveQuestion(question);
            resetMembersTry();
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
                { activeQuestion ? <div className={'activePopup'}>
                    <div className={'questionText'}>{activeQuestion.text}</div>
                    { activeQuestion.answered ? '' : <div className={'questionButtons'}>
                        <Button type={'success'} onClick={onRightAnswer} >Верно</Button>
                        <Button type={'error'} onClick={onWrongAnswer} >Не верно</Button>
                    </div> }

                </div> : ''}
            </div>
            <div className={'membersList'}>
                {gamers && gamers.map(gamer => (
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
            
            .gameBoard{                
                font-size: 2.25rem;
            }
            
            .activePopup{
                background: #141E30;  /* fallback for old browsers */
                background: -webkit-linear-gradient(to top, #243B55, #141E30);  /* Chrome 10-25, Safari 5.1-6 */
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
            
            .questionButtons{
                display: flex;
                justify-content: space-between;
            }
            
            .gameBoard__row{
                display: flex;
                justify-content: space-between;
                flex: 1 1 auto;
                margin: .5rem 0;
            }
            
            .gameBoard__row > div{
                padding: 1rem 0.5rem;                
            }
            
            .gameBoard__row .questionText{
                flex-grow: 8;
                width: 340px;
                font-size: 95%;
                padding-left: 1rem;
                overflow: hidden;
                white-space: nowrap;
            }
            
            .questionScore{                                
                background: #0F2027;  /* fallback for old browsers */
                background: -webkit-linear-gradient(to top, #2C5364, #203A43, #0F2027);  /* Chrome 10-25, Safari 5.1-6 */
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
                background: #141E30;  /* fallback for old browsers */
                background: -webkit-linear-gradient(to top, #243B55, #141E30);  /* Chrome 10-25, Safari 5.1-6 */
                background: linear-gradient(to top, #243B55, #141E30); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
            }
            
            .member__item{
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
                display flex;
                margin-top: 2.5rem;
                font-size: 2rem;
                justify-content: center;
            }
            
            .member__item > div {
                color: #ffEEAA;                
            }
            
            .member__item_active {
                border : 3px solid #ffcc00;
                padding: 0px;
                box-shadow: 0 0 0 rgba(255,200, 0, 0.4);
                animation: pulse 2s infinite;
            }
            
            @-webkit-keyframes pulse {
              0% {
                -webkit-box-shadow: 0 0 0 0 rgba(204,169,44, 0.8);
              }
              70% {
                  -webkit-box-shadow: 0 0 0 15px rgba(204,169,44, 0.2);
              }
              100% {
                  -webkit-box-shadow: 0 0 0 0 rgba(204,169,44, 0);
              }
            }
            @keyframes pulse {
              0% {
                -moz-box-shadow: 0 0 0 0 rgba(204,169,44, 0.8);
                box-shadow: 0 0 0 0 rgba(204,169,44, 0.8);
              }
              70% {
                  -moz-box-shadow: 0 0 0 15px rgba(204,169,44, 0.2);
                  box-shadow: 0 0 0 15px rgba(204,169,44, 0.2);
              }
              100% {
                  -moz-box-shadow: 0 0 0 0 rgba(204,169,44, 0);
                  box-shadow: 0 0 0 0 rgba(204,169,44, 0);
              }
            }
        `}</style>
        </Layout>
    );
};

Gameboard.getInitialProps = async ({req}) => {
    const res = await fetch('https://cristmasapp-1d61d.firebaseio.com/categories.json');
    const json = await res.json();

    console.log(json);

    return {};
};

export default Gameboard;