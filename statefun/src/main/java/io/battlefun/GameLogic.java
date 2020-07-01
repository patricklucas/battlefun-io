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

import io.battlefun.generated.FromGameFn.Failure;
import io.battlefun.generated.FromGameFn.GameUpdate;
import io.battlefun.generated.FromGameFn.GameUpdate.Builder;
import io.battlefun.generated.GameStatus;
import io.battlefun.generated.ShipPlacement;
import io.battlefun.generated.Shot;
import io.battlefun.generated.ToGameFn.CreateGame;
import io.battlefun.generated.ToGameFn.Turn;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import static io.battlefun.GameLogicUtil.isGameOver;
import static io.battlefun.GameLogicUtil.isPlayersTurn;
import static io.battlefun.GameLogicUtil.reamingShips;
import static io.battlefun.GameLogicUtil.setWinner;
import static io.battlefun.GameLogicUtil.shotsTaken;

final class GameLogic {

  static GameUpdate create(CreateGame createGame) {
    GameUpdate.Builder gameUpdate = GameUpdate.newBuilder();

    // populate the game update structure
    gameUpdate.setGameId(createGame.getGameId());
    gameUpdate.setPlayer1Id(createGame.getPlayer1Id());
    gameUpdate.setPlayer2Id(createGame.getPlayer2Id());
    gameUpdate.setPlayer1Placement(createGame.getPlayer1Placement());
    gameUpdate.setPlayer2Placement(createGame.getPlayer2Placement());
    gameUpdate.setStatus(GameStatus.PLAYER1_TURN);
    return gameUpdate.build();
  }

  static Either<GameUpdate, Failure> apply(GameUpdate current, Turn turn) {
    final int player = Objects.equals(turn.getPlayerId(), current.getPlayer1Id()) ? 0 : 1;
    final int guessCell = (int) turn.getShot();
    final Builder next = current.toBuilder();
    //
    // 1. validate that the game is still in progress
    //
    if (isGameOver(current)) {
      return Either.right(
          Failure.newBuilder()
              .setCode(100)
              .setFailureDescription("The game is already finished")
              .build());
    }
    //
    // 2. validate that the correct player is placing the turn.
    //
    if (!isPlayersTurn(current, player)) {
      return Either.right(
          Failure.newBuilder()
              .setCode(101)
              .setFailureDescription("It is not the turn of player " + turn.getPlayerId())
              .build());
    }
    //
    // 3. validate that @guessCell wasn't tried before
    //
    List<Shot> shots =
        (player == 0) ? current.getPlayer1ShotsList() : current.getPlayer2ShotsList();
    Set<Integer> shotHistory = shotsTaken(shots);

    if (shotHistory.contains(guessCell)) {
      return Either.right(
          Failure.newBuilder()
              .setCode(102)
              .setFailureDescription("The shot was already made")
              .build());
    }
    //
    // 4. remember that shot
    //
    shotHistory.add(guessCell);
    if (player == 0) {
      next.addPlayer1Shots(Shot.newBuilder().setCellId(guessCell).build());
    } else {
      next.addPlayer2Shots(Shot.newBuilder().setCellId(guessCell).build());
    }
    //
    // 4. check for hit/miss
    // NOTE: that we need the placement of the other player.
    ShipPlacement opponentPlacement =
        (player == 0) ? current.getPlayer2Placement() : current.getPlayer1Placement();
    Map<String, Set<Integer>> remainingShips = reamingShips(opponentPlacement, shotHistory);
    if (remainingShips.isEmpty()) {
      // TODO: clear the state at some point.
      setWinner(player, next);
      return Either.left(next.build());
    }
    //
    // 5. alternate turns
    //
    if (player == 0) {
      next.setStatus(GameStatus.PLAYER2_TURN);
    } else {
      next.setStatus(GameStatus.PLAYER1_TURN);
    }
    return Either.left(next.build());
  }
}
