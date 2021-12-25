import Layout from "../components/Layout";
import Input from "../components/UI/Input/Input";
import Backdrop from "../components/UI/Backdrop/Backdrop";
import React, {useState, useEffect} from 'react';
import Button from "../components/UI/Button/Button";
import axios from 'axios';
import Loader from "../components/UI/Loader/Loader";

import * as firebaseApp from 'firebase/app';
import * as firebase from 'firebase';
import {firebaseConfig} from '../firebase/firebase.config'


const getLocalUserId = () => {
    return window && window.localStorage.getItem('userId');
};

const setLocalUserId = (name) => {
    return window && window.localStorage.setItem('userId', name);
};

const Index = () => {
    // const gamersApiUrl = 'https://cristmasapp-1d61d.firebaseio.com/gamers';
    const gamersApiUrl = '/player';
    const [player, setPlayer] = useState({name: '', score: 0});
    const [viewState, setViewState] = useState({
        componentMount: false,
        loading: true,
        showLoginForm: false,
        inputTouched: false,
        inputValid: true,
    });
    const [wsInstance, setWsInstance] = useState(null);


    useEffect(() => {
        console.log('WS subscribe');
        let ws;
        if (!!window) {
            ws = new WebSocket(`ws://${window.location.host.replace('3000', '8000')}/wss`);
            setWsInstance(ws);

            ws.onmessage = (message) => {
                const data = JSON.parse(message.data);
                switch (data.action) {
                    case "updatePlayersList":
                        Object.values(data.payload).forEach( p => {
                            console.log('data', p.id, player.id, player);
                            if(p.id === player.id){
                                console.log('P',p);
                                setPlayer(p);
                            }
                        })

                        break;
                }
            }
        }

        return () => {
            if (ws && ws.readyState !== 3) {
                ws.close();
            }
        }
    }, [viewState.loading])

    useEffect(() => {
        const userId = getLocalUserId();

        if (!userId) {
            setViewState({
                ...viewState,
                showLoginForm: true,
                componentMount: true,
                loading: false
            })
        } else if (!player.name) {
            console.log(userId);
            axios.get(gamersApiUrl + '/' + userId).then(response => {
                let user = response.data;
                console.log("user", user);
                let showLoginForm = false;
                if (user) {
                    user.id = userId;
                    console.log('USER', user);
                    setPlayer(user);
                } else {
                    window.localStorage.clear();
                    showLoginForm = true;
                }

                setViewState({
                    ...viewState,
                    showLoginForm,
                    loading: false
                })
            }).catch(e => {
                console.log(e)
                setLocalUserId('');
            })
        }

    }, []);

    const createGamer = () => {
        setViewState({
            ...viewState,
            showLoginForm: false,
            loading: true
        });

        axios.post(gamersApiUrl, {name: player.name, score: 0}).then(res => {
            console.log('res.data',res.data);
            if (res.data) {
                setPlayer(res.data);

                setViewState({
                    ...viewState,
                    showLoginForm: false,
                    loading: false
                });
                setLocalUserId(res.data.id);
            }
        }).catch(e => console.log(e));
    };

    const onInputChange = (val) => {
        setPlayer({...player, name: val});
        setViewState({
            ...viewState,
            inputTouched: true,
            inputValid: val && val.length > 3
        })
    };

    const tryAnswer = () => {
        let userId = player.id;

        if (userId) {
            axios.patch(gamersApiUrl + '/' + userId + '/answer').then(r => {
            }).catch(e => console.log(e))
        }
    };
console.log("player.tryAnswerTime",player.tryAnswerTime);
    return (
        <Layout>
            <div className={'gameField'}>
                <div className={'gamerScore'}>{player.score}</div>
                <div className={'gamerName'}>{player.name}</div>
                <div>
                    <Button
                        size={'xl'}
                        type={'primary'}
                        onClick={tryAnswer}
                        disabled={!!player.tryAnswerTime}
                    >
                        Я знаю ответ!
                    </Button>
                </div>
            </div>

            {viewState.loading ? <Backdrop><Loader/></Backdrop> : ''}

            {viewState.showLoginForm ? <Backdrop>
                <div className={'gamerForm'}>
                    <Input label='Название команды'
                           value={player.name}
                           onChange={(event) => onInputChange(event.target.value)}
                           shouldValidate={true}
                           touched={viewState.inputTouched}
                           valid={viewState.inputValid}
                           errorMessage={'Значение не может быть пустым или короче 4х символов.'}
                    />
                    <Button disabled={!viewState.inputValid || !viewState.inputTouched} size={'l'} type={'success'}
                            onClick={() => createGamer()}>Регистарция</Button>
                </div>
            </Backdrop> : ''}
            <style jsx>{`
              .gameField {
                text-align: center;
                font-size: 3rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 90vh;
              }

              .gamerName {
                color: #eee;
                text-shadow: 1px 1px 1px #777;
                padding: 3rem 0;
              }


              .gamerScore {
                color: lightblue;
                font-size: 3rem;
              }

              .gamerForm {
                position: absolute;
                top: 50%;
                left: 50%;
                margin-top: -150px;
                margin-left: -150px;
                width: 300px;
                height: 300px;
                padding: 24px;
                box-sizing: border-box;
                text-align: center;
                background: #fefefe;
                border-radius: 30px;
              }

              .gamerForm input {
                margin: 2rem 0;
              }
            `}</style>
        </Layout>
    );
};

export default Index;