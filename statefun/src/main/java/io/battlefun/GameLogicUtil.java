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

import io.battlefun.generated.FromGameFn.GameUpdate;
import io.battlefun.generated.FromGameFn.GameUpdate.Builder;
import io.battlefun.generated.GameStatus;
import io.battlefun.generated.Ship;
import io.battlefun.generated.ShipPlacement;
import io.battlefun.generated.Shot;

import java.util.BitSet;
import java.util.List;

final class GameLogicUtil {
  private GameLogicUtil() {}
  
  public static final int BOARD_SIZE = 100;

  static void setWinner(int player, Builder updatedGame) {
    if (player == 0) {
      updatedGame.setStatus(GameStatus.PLAYER1_WIN);
    } else {
      updatedGame.setStatus(GameStatus.PLAYER2_WIN);
    }
  }

  static boolean hasReamingShips(ShipPlacement placement, BitSet shotHistory) {
    for (Ship ship : placement.getShipsList()) {
      for (long cell : ship.getCellsList()) {
        int cellId = (int) cell;
        if (!shotHistory.get(cellId)) {
          return true;
        }
      }
    }
    return false;
  }

  static boolean isPlayersTurn(GameUpdate game, int player) {
    switch (game.getStatus()) {
      case PLAYER1_TURN:
        return player == 0;
      case PLAYER2_TURN:
        return player == 1;
      case PLAYER1_WIN:
      case PLAYER2_WIN:
        throw new IllegalStateException("Finished game");
      case UNKNOWN:
      case UNRECOGNIZED:
      default:
        throw new IllegalStateException("Unexpected enum value");
    }
  }

  static boolean isGameOver(GameUpdate game) {
    return game.getStatus() == GameStatus.PLAYER1_WIN || game.getStatus() == GameStatus.PLAYER2_WIN;
  }

  static BitSet shotsTaken(List<Shot> shots) {
    BitSet set = new BitSet(BOARD_SIZE + 1);
    if (shots == null) {
      return set;
    }
    for (Shot shot : shots) {
      set.set((int) shot.getCellId());
    }
    return set;
  }
}
