/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.battlefun;

import org.apache.flink.statefun.sdk.Context;
import org.apache.flink.statefun.sdk.FunctionType;
import org.apache.flink.statefun.sdk.StatefulFunction;
import org.apache.flink.statefun.sdk.state.PersistedValue;

import io.battlefun.generated.FromGameFn;
import io.battlefun.generated.FromGameFn.Builder;
import io.battlefun.generated.FromGameFn.Failure;
import io.battlefun.generated.FromGameFn.GameUpdate;
import io.battlefun.generated.GameStatus;
import io.battlefun.generated.ToGameFn;
import io.battlefun.generated.ToGameFn.CreateGame;
import io.battlefun.generated.ToGameFn.GetGameStatus;
import io.battlefun.generated.ToGameFn.Resign;
import io.battlefun.generated.ToGameFn.Turn;

import java.util.Objects;

public final class GameFn implements StatefulFunction {

  public static final FunctionType Type = new FunctionType("io.battlefun", "game");

  private final PersistedValue<GameUpdate> game = PersistedValue.of("game", GameUpdate.class);

  @Override
  public void invoke(Context context, Object message) {
    ToGameFn in = (ToGameFn) message;
    FromGameFn.Builder out = FromGameFn.newBuilder();

    if (in.hasCreateGame()) {
      handleCreateGame(out, in.getCreateGame());
    } else if (in.hasGetGameStatus()) {
      handleGetGameStatus(out, in.getGetGameStatus());
    } else if (in.hasResign()) {
      handleResign(out, in.getResign());
    } else if (in.hasTurn()) {
      handleTurn(out, in.getTurn());
    } else {
      throw new IllegalStateException("Unknown message " + message);
    }

    context.send(Constants.OUTPUT, out.build());
  }

  private void handleCreateGame(Builder builder, CreateGame createGame) {
    GameUpdate.Builder gameUpdate = GameUpdate.newBuilder();

    // populate the game update structure
    gameUpdate.setGameId(gameUpdate.getGameId());
    gameUpdate.setPlayer1Id(createGame.getPlayer1Id());
    gameUpdate.setPlayer2Id(createGame.getPlayer2Id());
    gameUpdate.setPlayer1Placement(createGame.getPlayer1Placement());
    gameUpdate.setPlayer2Placement(createGame.getPlayer2Placement());

    gameUpdate.setStatus(GameStatus.PLAYER1_TURN);

    // remember the game
    game.set(gameUpdate.build());

    builder.setGameUpdate(gameUpdate);
    builder.setGameId(createGame.getGameId());
  }

  private void handleGetGameStatus(Builder builder, GetGameStatus getGameStatus) {
    GameUpdate game = this.game.get();
    builder.setGameId(getGameStatus.getGameId());

    if (game != null) {
      builder.setGameUpdate(game);
    } else {
      builder.setFailure(
          Failure.newBuilder().setCode(1).setFailureDescription("Unknown game").build());
    }
  }

  private void handleTurn(Builder builder, Turn turn) {
    GameUpdate game = this.game.get();
    builder.setGameId(turn.getGameId());

    if (game == null) {
      builder.setFailure(
          Failure.newBuilder().setCode(1).setFailureDescription("Unknown game").build());
      return;
    }
    
    // TODO: main game logic goes here
  }

  private void handleResign(Builder builder, Resign resign) {
    GameUpdate game = this.game.get();
    builder.setGameId(resign.getGameId());

    if (game == null) {
      builder.setFailure(
          Failure.newBuilder().setCode(1).setFailureDescription("Unknown game").build());
      return;
    }

    String who = resign.getPlayerId();
    if (Objects.equals(game.getPlayer1Id(), who)) {
      // player 1 resigned
      game = game.toBuilder().setStatus(GameStatus.PLAYER2_WIN).build();

    } else {
      // player 2 resigned
      game = game.toBuilder().setStatus(GameStatus.PLAYER1_WIN).build();
    }

    this.game.set(game);
    builder.setGameUpdate(game);
  }
}
