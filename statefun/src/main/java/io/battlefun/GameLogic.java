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
import io.battlefun.generated.Ship;
import io.battlefun.generated.ShipPlacement;
import io.battlefun.generated.Shot;
import io.battlefun.generated.ToGameFn.Turn;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

final class GameLogic {

  Either<GameUpdate, Failure> apply(GameUpdate current, Turn turn) {
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
    if (isPlayersTurn(current, player)) {
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
              .setFailureDescription("The shot was already made ")
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
    // note: that we need to placement of the other player.
    ShipPlacement opponentPlacement =
        (player == 0) ? current.getPlayer2Placement() : current.getPlayer1Placement();
    Map<String, Set<Integer>> remainingShips = reamingShips(opponentPlacement, shotHistory);
    if (remainingShips.isEmpty()) {
      setWinner(player, next);
      return Either.left(next.build());
    }
    return Either.left(next.build());
  }

  private void setWinner(int player, Builder updatedGame) {
    if (player == 0) {
      updatedGame.setStatus(GameStatus.PLAYER1_WIN);
    } else {
      updatedGame.setStatus(GameStatus.PLAYER2_WIN);
    }
  }

  private static Map<String, Set<Integer>> reamingShips(
      ShipPlacement placement, Set<Integer> shotHistory) {
    Map<String, Set<Integer>> remainingShips = new HashMap<>();
    for (Ship ship : placement.getShipsList()) {
      Set<Integer> remainingCells = new HashSet<>();
      for (long cell : ship.getCellsList()) {
        int cellId = (int) cell;
        if (shotHistory.contains(cellId)) {
          continue;
        }
        remainingCells.add(cellId);
      }
      if (!remainingCells.isEmpty()) {
        // only add non empty ships
        remainingShips.put(ship.getType(), remainingCells);
      }
    }
    return remainingShips;
  }

  private boolean isPlayersTurn(GameUpdate game, int player) {
    return player != playerFromStatus(game.getStatus());
  }

  private static boolean isGameOver(GameUpdate game) {
    return game.getStatus() == GameStatus.PLAYER1_WIN || game.getStatus() == GameStatus.PLAYER2_WIN;
  }

  private static Set<Integer> shotsTaken(List<Shot> shots) {
    if (shots == null) {
      return Collections.emptySet();
    }
    Set<Integer> set = new HashSet<>(shots.size());
    for (Shot shot : shots) {
      set.add((int) shot.getCellId());
    }
    return set;
  }

  private static int playerFromStatus(GameStatus status) {
    switch (status) {
      case UNKNOWN:
        throw new IllegalStateException("what a terrible failure");
      case PLAYER1_TURN:
        return 0;
      case PLAYER2_TURN:
        return 1;
      case PLAYER1_WIN:
      case PLAYER2_WIN:
      case UNRECOGNIZED:
      default:
        throw new IllegalStateException("Finished game");
    }
  }
}
