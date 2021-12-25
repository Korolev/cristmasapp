const ws = require('ws');
const express = require('express')
const next = require('next')
const uuid = require('uuid')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

const PlayersStore = {};
const wsClients = {};

class Player {
    id = '';
    name = '';
    score = 0;

    constructor(name) {
        this.name = name;
        this.id = uuid.v4()
    }

    updateScore = (score) => {
        this.score = score;
    }
}

const notifyAllWSClients = () => {
    Object.keys(wsClients).forEach(clientId => {
        wsClients[clientId].send(
            JSON.stringify({
                action: "updatePlayersList",
                payload: PlayersStore
            })
        );
    })
}

app.prepare().then(() => {
    const server = express();
    server.use(express.json());

    const wss = new ws.Server({
        port: 8000,
        path: '/wss'
    });

    server.get('/player/:id', (req, res) => {
        const {id} = req.params;

        if (id === 'all') {
            res.status(200).type('application/json').send(Object.values(PlayersStore));
        } else {
            res.status(200).type('application/json').send(PlayersStore[id]);
        }
    })

    server.delete('/player/:id', (req, res) => {
        const {id} = req.params;

        if (id) {
            delete PlayersStore[id];

            notifyAllWSClients();

            res.status(200).type('application/json').send(Object.values(PlayersStore));
        } else{
            res.status(500);
        }
    })

    server.patch('/player/:id', (req, res) => {
        const {id, score} = req.body;

        if (id) {
            PlayersStore[id].score = score;

            notifyAllWSClients();

            res.status(200).type('application/json').send(Object.values(PlayersStore));
        } else{
            res.status(500);
        }
    })


    server.patch('/player/:id/answer', (req, res) => {
        const {id} = req.params;

        if (id) {
            Object.keys(PlayersStore).forEach( playerId => {
                PlayersStore[playerId].tryAnswerTime =  playerId === id ? Date.now() : Date.now()+ 1_000_000;
            })

            notifyAllWSClients()

            res.status(200).type('application/json').send(Object.values(PlayersStore));
        } else{
            res.status(500);
        }
    })


    server.delete('/reset/answer', (req, res) => {
        Object.keys(PlayersStore).forEach(playerId => {
            PlayersStore[playerId].tryAnswerTime = 0;
        })

        notifyAllWSClients()
        res.status(200).type('application/json').send(Object.values(PlayersStore));
    })


    server.post('/player', (req, res) => {
        const player = new Player(req.body.name);
        PlayersStore[player.id] = player;

        notifyAllWSClients()

        res.send(player);
    });

    server.all('*', (req, res) => {
        return handle(req, res)
    })

    server.listen(port, (err) => {
        if (err) throw err
        console.log(`> Ready on http://localhost:${port}`)
    })


    wss.on("connection", (ws) => {
        const id = uuid.v4();
        wsClients[id] = ws;

        console.log(`New client ${id}`);

        ws.send(JSON.stringify(PlayersStore));

        ws.on('message', (rawMessage) => {
            console.log('rawMessage', rawMessage);
            // const {name, message} = JSON.parse(rawMessage);
            // messages.push({name, message});
            // for (const id in clients) {
            //     clients[id].send(JSON.stringify([{name, message}]))
            // }
        })

        ws.on('close', () => {
            // delete clients[id];
            console.log(`Client is closed ${id}`)
        })
    })

    process.on('SIGINT', () => {
        console.log('Bye!')
        wss.close();
        process.exit();
    })
})

