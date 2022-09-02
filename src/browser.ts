import { io } from "socket.io-client";
import Phaser from "phaser";
import { GameData, Player, PlayerUpdateFromServer } from "./types";

const socket = io();

class MyScene extends Phaser.Scene {
  playerSprites: {
    [playerId: string]: Phaser.GameObjects.Arc;
  } = {};

  player: Player;

  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;
  upKey: Phaser.Input.Keyboard.Key;
  downKey: Phaser.Input.Keyboard.Key;

  preload() {
    this.load.setBaseURL('https://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
  }

  addPlayer(id: string, colour: number, x: number, y: number): Phaser.GameObjects.Arc {
    const newCircle = this.add.circle(x, y, 25, colour);
    this.playerSprites[id] = newCircle;
    return newCircle;
  }

  removePlayer(id: string) {
    const circle = this.playerSprites[id];
    circle.destroy();
    delete this.playerSprites[id];
  }

  getPlayerSprite(id: string): Phaser.GameObjects.Arc {
    return this.playerSprites[id];
  }

  getCurrentPlayerSprite(): Phaser.GameObjects.Arc {
    return this.playerSprites[this.player.id];
  }

  create() {
    this.add.image(400, 300, 'sky');

    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    socket.emit("request-to-join", (thisPlayer: Player) => {
      this.player = Object(thisPlayer);
      this.addPlayer(thisPlayer.id, thisPlayer.colour, thisPlayer.x, thisPlayer.y);
    });

    socket.on("player-connected", (newPlayer: Player) => {
      this.addPlayer(
        newPlayer.id,
        newPlayer.colour,
        newPlayer.x,
        newPlayer.y
      );
      console.debug(`Player ${newPlayer.id} connected`);
    });

    socket.on("player-update", (playerUpdate: PlayerUpdateFromServer) => {
      const player = this.getPlayerSprite(playerUpdate.id);
      player.setX(playerUpdate.x);
      player.setY(playerUpdate.y);
    });

    socket.on("game-data", (gameData: GameData) => {
      for (let playerId of Object.keys(this.playerSprites)) {
        this.removePlayer(playerId);
      }

      for (let player of gameData.players) {
        this.addPlayer(player.id, player.colour, player.x, player.y);
      }
    })

    socket.on("player-disconnected", (playerId: string) => {
      this.removePlayer(playerId);
    });
  }

  update(time: number, delta: number): void {
    if (this.player === undefined) return;

    const currentPlayerSprite = this.getCurrentPlayerSprite();
    const playerSpeed = 100 / 1000;  // pixels per millisecond

    if (this.leftKey.isDown) {
      currentPlayerSprite.setX(currentPlayerSprite.x - playerSpeed * delta);
    }

    if (this.upKey.isDown) {
      currentPlayerSprite.setY(currentPlayerSprite.y - playerSpeed * delta);
    }

    if (this.downKey.isDown) {
      currentPlayerSprite.setY(currentPlayerSprite.y + playerSpeed * delta);
    }

    if (this.rightKey.isDown) {
      currentPlayerSprite.setX(currentPlayerSprite.x + playerSpeed * delta);
    }

    socket.emit("player-update", {
      x: currentPlayerSprite.x,
      y: currentPlayerSprite.y,
    });
  }
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: new MyScene({}),
};

var game = new Phaser.Game(config);
