import http from "http";
import express from "express";
import cors from "cors";
import Arena from "@colyseus/arena";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
const userService = require('./PlayFab/Login');
// import socialRoutes from "@colyseus/social/express"
import { MyRoom } from "./MyRoom";

const port = Number(process.env.PORT || 2567);
const app = express()
const router = express.Router();
const bodyParser = require("body-parser");

router.post('/cust-login',userService.LoginWithCustomID);
router.post('/email-login',userService.LoginWithEmail);
router.post('/deviceLogin',userService.LoginWithDevice);
router.post('/recovery-account',userService.AddRecovery);
router.post('/register',userService.RegisterWithEmail);


// const server = http.createServer(app);
// const gameServer = new Server({
//   server,
// });


export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {
// register your room handlers
gameServer.define('my_room', MyRoom).enableRealtimeListing();
    }, initializeExpress: (app) => {
/**
 *
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/authentication/)
 * - also uncomment the import statement
 */
 app.use(cors());
 app.use(express.json())
 //Here we are configuring express to use body-parser as middle-ware.
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());
 app.use(bodyParser.raw());
// app.use("/", socialRoutes);
app.use("/", router);
// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());
    },

    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
// gameServer.listen(port);
// console.log(`Listening on ws://localhost:${ port }`)
