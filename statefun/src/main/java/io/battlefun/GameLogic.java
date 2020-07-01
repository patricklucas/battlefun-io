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

import java.util.BitSet;
import java.util.List;
import java.util.Objects;

import static io.battlefun.GameLogicUtil.*;

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

    if (isGameOver(current)) {
      return Either.right(
          Failure.newBuilder()
              .setCode(FailureCodes.GAME_ALREADY_FINISHED)
              .setFailureDescription("The game is already finished")
              .build());
    }
    if (!isPlayersTurn(current, player)) {
      return Either.right(
          Failure.newBuilder()
              .setCode(FailureCodes.NOT_PLAYERS_TURN)
              .setFailureDescription("It is not the turn of player " + turn.getPlayerId())
              .build());
    }
    BitSet shotHistory = shotHistory(current, player);
    if (wasShotPreviouslyTaken(guessCell, shotHistory)) {
      return Either.right(
          Failure.newBuilder()
              .setCode(FailureCodes.SHOT_WAS_ALREADY_MADE)
              .setFailureDescription("The shot was already made")
              .build());
    }
    shotHistory.set(guessCell);

    // compute the next state of the game
    final Builder next = current.toBuilder();
    ShipPlacement opponentPlacement = getOpponentShipPlacement(current, player);
    boolean isHit = didShotHit(opponentPlacement, guessCell);
    addGuessToShotHistory(next, player, guessCell, isHit);
    if (!hasRemainingShips(opponentPlacement, shotHistory)) {
      setWinner(player, next);
    } else {
      alternateTurns(player, next);
    }
    return Either.left(next.build());
  }

  private static boolean wasShotPreviouslyTaken(int guessCell, BitSet shotHistory) {
    return shotHistory.get(guessCell);
  }

  private static void alternateTurns(int player, Builder next) {
    if (player == 0) {
      next.setStatus(GameStatus.PLAYER2_TURN);
    } else {
      next.setStatus(GameStatus.PLAYER1_TURN);
    }
  }

  private static ShipPlacement getOpponentShipPlacement(GameUpdate current, int player) {
    return (player == 0) ? current.getPlayer2Placement() : current.getPlayer1Placement();
  }

  private static void addGuessToShotHistory(Builder next, int player, int guessCell, boolean isHit) {
    if (player == 0) {
      next.addPlayer1Shots(Shot.newBuilder().setCellId(guessCell).setShot(isHit).build());
    } else {
      next.addPlayer2Shots(Shot.newBuilder().setCellId(guessCell).setShot(isHit).build());
    }
  }

  private static BitSet shotHistory(GameUpdate current, int player) {
    List<Shot> shots =
        (player == 0) ? current.getPlayer1ShotsList() : current.getPlayer2ShotsList();
    return shotsTaken(shots);
  }
}
