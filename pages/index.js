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


const Index = () => {
    const gamersApiUrl = 'https://cristmasapp-1d61d.firebaseio.com/gamers';
    const [gamer, setGamer] = useState({name: '', score: 0});
    const [viewState, setViewState] = useState({
        componentMount: false,
        loading: true,
        showLoginForm: false,
        inputTouched: false,
        inputValid: true,
    });

    const getLocalUserId = () => {
        return  window.localStorage.getItem('userId');
    };

    const createGamer = () => {
        setViewState({
            ...viewState,
            showLoginForm: false,
            loading: true
        });

        axios.post(gamersApiUrl + '.json', {name: gamer.name, score: 0}).then(response => {
            console.log(response);

            if (response.data) {

                setGamer({
                    name: gamer.name,
                    score: 0,
                    id: response.data.name
                });

                setViewState({
                    ...viewState,
                    showLoginForm: false,
                    loading: false
                });
                window.localStorage.setItem('userId', response.data.name);
            }
        }).catch(e => console.log(e));
    };

    const onInputChange = (val) => {
        setGamer({...gamer, name: val});
        setViewState({
            ...viewState,
            inputTouched: true,
            inputValid: val && val.length > 3
        })
    };

    useEffect(() => {
        console.log('useEffect', viewState.componentMount);

        if (!viewState.componentMount) {
            const userId = getLocalUserId();

            if (!userId) {
                setViewState({
                    ...viewState,
                    showLoginForm: true,
                    componentMount: true,
                    loading: false
                })
            } else if (!gamer.name) {
                console.log(userId);
                axios.get(gamersApiUrl + '/' + userId + '.json').then(response => {
                    let user = response.data;
                    console.log(user);
                    let showLoginForm = false;
                    if (user) {
                        user.id = userId;
                        console.log('USER', user);
                        setGamer(user);
                    } else {
                        window.localStorage.clear();
                        showLoginForm = true;
                    }

                    setViewState({
                        ...viewState,
                        showLoginForm,
                        loading: false
                    })
                }).catch(e => console.log(e))
            }
        }

        // == firebase watch
        if (firebaseApp && !firebaseApp.apps.length) {
            firebaseApp.initializeApp(firebaseConfig);
            let starCountRef = firebase.database().ref('gamers');

            starCountRef.on('value', function (snapshot) {
                let response = snapshot.val();
                const userId = getLocalUserId();
                console.log('resp AAA', response);
                if(response && !response[userId]){
                    setViewState({
                        ...viewState,
                        showLoginForm: true
                    })
                }else if(response){
                    setGamer({
                        ...gamer,
                        ...response[userId],
                        id: userId
                    })
                }
            });
        }
        // == firebase watch
    });

    let waitTryResult = false;
    const tryAnswer = () => {
        let userId = gamer.id;

        if(userId && !waitTryResult){
            waitTryResult = true;
            axios.patch(gamersApiUrl + '/' + userId + '.json', {
                name: gamer.name,
                score: gamer.score,
                tryAnswerTime: new Date().getTime(),
            }).then(response => {
                let user = response.data;
                setGamer({
                    ...gamer,
                    ...user
                });

                waitTryResult = false;
            }).catch(e => console.log(e))
        }
    };

    return (
        <Layout>
            <div className={'gameField'}>
                <div className={'gamerScore'}>{gamer.score}</div>
                <div className={'gamerName'}>{gamer.name}</div>
                <div>
                    <Button
                        size={'xl'}
                        type={'primary'}
                        onClick={tryAnswer}
                        disabled={!!gamer.tryAnswerTime}
                    >
                        Я знаю ответ!
                    </Button>
                </div>
            </div>

            {viewState.loading ? <Backdrop><Loader/></Backdrop> : ''}

            {viewState.showLoginForm ? <Backdrop>
                <div className={'gamerForm'}>
                    <Input label='Название команды'
                           value={gamer.name}
                           onChange={(event) => onInputChange(event.target.value)}
                           shouldValidate={true}
                           touched={viewState.inputTouched}
                           valid={viewState.inputValid}
                           errorMessage={'Значение не может быть пустым или короче 4х символов.'}
                    />
                    <Button disabled={!viewState.inputValid || !viewState.inputTouched} size={'l'} type={'success'}
                            onClick={() => createGamer()}>Подтвердить!</Button>
                </div>
            </Backdrop> : ''}
            <style jsx>{`
                .gameField{
                    text-align:center;
                    font-size:3rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 90vh;
                }
                                                
                .gamerName{
                    color: #eee;
                    text-shadow: 1px 1px 1px #777;
                    padding: 3rem 0;
                }
                
                               
                .gamerScore{
                    color: lightblue;
                    font-size:3rem;                    
                }
                
                .gamerForm{
                    position: absolute;
                    top: 50%;
                    left: 50%;                    
                    margin-top: -150px;
                    margin-left: -150px;
                    width: 300px;
                    height: 300px;
                    padding: 5%;
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