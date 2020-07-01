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
import io.battlefun.generated.GameStatus;
import io.battlefun.generated.Ship;
import io.battlefun.generated.ShipPlacement;
import io.battlefun.generated.ShipPlacement.Builder;
import io.battlefun.generated.ToGameFn.CreateGame;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;

public class GameLogicTest {

  @Test
  public void createGame() {
    CreateGame create =
        CreateGame.newBuilder()
            .setGameId("game-1")
            .setPlayer1Id("player-1")
            .setPlayer2Id("player-2")
            .setPlayer1Placement(from("1 2 3", "5 6 7", "8 9 10 11"))
            .setPlayer2Placement(from("1 2 3", "5 6 7", "8 9 10 11"))
            .build();

    GameUpdate created = GameLogic.create(create);

    assertThat(created.getStatus(), is(GameStatus.PLAYER1_TURN));
    assertThat(created.getGameId(), is("game-1"));
    assertThat(created.getPlayer1Id(), is("player-1"));
    assertThat(created.getPlayer2Id(), is("player-2"));
  }

  private static ShipPlacement from(String pos1, String pos2, String pos3) {
    Builder builder = ShipPlacement.newBuilder();
    addPositions(builder.addShipsBuilder(), "a", pos1);
    addPositions(builder.addShipsBuilder(), "b", pos2);
    addPositions(builder.addShipsBuilder(), "c", pos3);
    return builder.build();
  }

  private static void addPositions(Ship.Builder ship, String type, String pos) {
    ship.setType(type);
    for (String p : pos.split("\\s+")) {
      ship.addCells(Long.parseLong(p));
    }
  }
}
