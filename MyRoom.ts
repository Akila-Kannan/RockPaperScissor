import { Room, Client, generateId, Delayed } from "colyseus";
import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
var PlayFab = require("./node_modules/playfab-sdk/Scripts/PlayFab/PlayFab");
const TURN_TIMEOUT = 60;
PlayFab.settings.titleId = "4F5E3";
export class MyRoom extends Room {
  maxClients = 2;
  randomMoveTimeout: Delayed;
  MaxRoundCount = 5;
  onCreate(options: any) {
    console.log("enterd on create" );
    this.setState(new State());
    this.onMessage("choice", (client, message) => this.playerAction(client, message));
  }

  async onAuth(client: Client, options: any) {
    console.log("onAuth(), options!", options);
    return new Promise((resolve, reject) => {
      this.verifyPlayFabTicket(options,resolve,reject)});
  }
  verifyPlayFabTicket(option: any, callback: any, callbackerror: any) {
     console.log("req" , option,PlayFab.GetServerUrl());
    PlayFab.MakeRequest(
      PlayFab.GetServerUrl() + "/Client/GetPlayerProfile",
      {  PlayFabId: option.fabid },
      "X-Authorization",
      option.ticket,
      function (error: any, result: any) {
        if(result){
          console.log("Authenticated", result);

        }
        else{
          console.log("error onAuth", error);

        }
        callback(result);
        callbackerror(error);
      },
    );
  }

  onJoin(client: Client, options: any) {
    console.log("enterd on join");
    this.state.players[client.sessionId] = client.sessionId;
    if (Object.keys(this.state.players).length === 2) {
      this.state.playerIds = Object.keys(this.state.players);
      this.setAutoMoveTimeout();
      this.state.roundCount = 1;
      // lock this room for new users
      this.lock();
    }
  }
  setAutoMoveTimeout() {
    if (this.randomMoveTimeout) {
      this.randomMoveTimeout.clear();
    }
    this.randomMoveTimeout = this.clock.setTimeout(() => this.doRandomMove(), TURN_TIMEOUT * 1000);
  }
  playerAction(client: Client, data: any) {

    if (this.state.winner || this.state.draw) {
      return false;
    }

    if (this.state.rounds.length > 0 && (this.state.rounds[(this.state.roundCount)] && !this.state.rounds[(this.state.roundCount)].playersChoice[client.sessionId])) {
      this.state.rounds[(this.state.roundCount)].playersChoice[client.sessionId] = data.choice;
      console.log("coice ", data.choice);
      console.log("clientId  ", client.sessionId);
      this.checkRoundWin();
    }
    else if (!this.state.rounds[(this.state.roundCount)]) {
      this.state.rounds[(this.state.roundCount)] = new Round();
      this.state.rounds[(this.state.roundCount)].playersChoice[client.sessionId] = data.choice;
      console.log("coice ", data.choice, "choice count " + this.state.rounds.length, this.state.rounds[(this.state.roundCount)]);
      console.log("clientId  ", client.sessionId);
      this.state.roundWinner = "";
      this.state.roundDraw = false;
    }
  }

  onLeave(client: Client, consented: boolean) {
    this.state.winner = this.state.playerIds[0] === client.sessionId ? this.state.playerIds[1] : this.state.playerIds[0];
  }

  onDispose() {
  }
  checkRoundWin() {
    console.log("round " + this.state.roundCount, " playersChoice Count" + Object.keys(this.state.rounds[(this.state.roundCount)].playersChoice).length)
    if ((Object.keys(this.state.rounds[(this.state.roundCount)].playersChoice).length == 2)) {
      this.state.player1Choice = this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[0]];
      this.state.player2Choice = this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[1]];
      const opponentChoice = this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[1]];
      console.log("player1 ", opponentChoice, "player 2 ", this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[0]]);
      if(opponentChoice ==this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[0]])
      {
        this.state.rounds[(this.state.roundCount)].draw = true;
          this.state.roundDraw = true;
          console.log("draw");
      }else{
      switch (this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[0]]) {
        case 'Rock':
          if (opponentChoice == 'Paper') {
            this.state.rounds[(this.state.roundCount)].winner = this.state.playerIds[1];
            this.state.roundWinner = this.state.playerIds[1];
            console.log("winner ", this.state.playerIds[1]);
          }
          else {

            this.state.rounds[(this.state.roundCount)].winner = this.state.playerIds[0];
            this.state.roundWinner = this.state.playerIds[0];
          }
          break;
        case 'Paper':
          if (opponentChoice == 'Scissor') {

            this.state.rounds[(this.state.roundCount)].winner = this.state.playerIds[1];
            this.state.roundWinner = this.state.playerIds[1];
          }
          else {

            this.state.rounds[(this.state.roundCount)].winner = this.state.playerIds[0];
            this.state.roundWinner = this.state.playerIds[0];
          }
          break;
        case 'Scissor':
          if (opponentChoice == 'Rock') {

            this.state.rounds[(this.state.roundCount)].winner = this.state.playerIds[1];
            this.state.roundWinner = this.state.playerIds[1];
          }

          else {

            this.state.rounds[(this.state.roundCount)].winner = this.state.playerIds[0];
            this.state.roundWinner = this.state.playerIds[0];
          }
          break;
        default:
          this.state.rounds[(this.state.roundCount)].draw = true;
          this.state.roundDraw = true;
          break;
      }
    }

      if (this.state.roundCount < this.MaxRoundCount )
        this.state.roundCount++;
    }
    else if (this.state.roundCount == this.MaxRoundCount ) {
      this.checkGameWin();
    }
    console.log("win ", this.state.roundWinner);
  }
  checkGameWin() {
    let player1WinCount = 0;
    let player2WinCount = 0;
    for (let i = 1; i <= this.state.rounds.length; i++) {
      if (this.state.rounds[i].winner === this.state.playerIds[0]) {
        player1WinCount++;
      }
      if (this.state.rounds[i].winner === this.state.playerIds[1]) {
        player2WinCount++;
      }

    }
    if (player1WinCount == player2WinCount) {
      this.state.draw = true;
    }
    else {
      this.state.winner = player2WinCount > player1WinCount ? this.state.playerIds[1] : this.state.playerIds[0];
    }
    console.log("game winner ", this.state.winner, " draw ", this.state.draw);
  }
  doRandomMove() {
    if (this.state.rounds.length > 0) {
      if ((this.state.rounds[(this.state.roundCount)])) {
        for (let i = 0; i < this.state.playerIds.length; i++) {
          if (!this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[i]]) {
            this.state.rounds[(this.state.roundCount)].playersChoice[this.state.playerIds[i]] = this.getChoice(this.getRandomInt(3));
            this.checkRoundWin();
          }
        }
      }
    }
  }
  getChoice(choice: number) {
    switch (choice) {
      case 0:
        return "Rock";
      case 1:
        return "Paper";
      case 2:
        return "Scissor";
    }
  }
  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }


}
export class Round {
  @type({ map: "string" }) playersChoice = new MapSchema<string>();
  @type("string") winner: string;
  @type("boolean") draw: boolean;
}
export class State extends Schema {
  @type({ map: "string" }) players = new MapSchema<boolean>();
  @type("string") winner: string;
  @type("boolean") draw: boolean;
  rounds = Array<Round>(6);
  @type("string") roundWinner: string;
  @type("string") player1Choice: string;
  @type("string") player2Choice: string;
  @type("boolean") roundDraw: boolean;
  @type("number") roundCount: number;
  playerIds: string[];
}
