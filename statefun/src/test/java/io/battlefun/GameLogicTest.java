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
import io.battlefun.generated.GameStatus;
import io.battlefun.generated.Ship;
import io.battlefun.generated.ShipPlacement;
import io.battlefun.generated.ShipPlacement.Builder;
import io.battlefun.generated.Shot;
import io.battlefun.generated.ToGameFn.CreateGame;
import io.battlefun.generated.ToGameFn.Turn;
import org.hamcrest.CoreMatchers;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.hasItem;
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
            .setPlayer1Placement(ships("1 2 3", "5 6 7", "8 9 10 11"))
            .setPlayer2Placement(ships("1 2 3", "5 6 7", "8 9 10 11"))
            .build();

    GameUpdate created = GameLogic.create(create);

    assertThat(created.getStatus(), is(GameStatus.PLAYER1_TURN));
    assertThat(created.getGameId(), is("game-1"));
    assertThat(created.getPlayer1Id(), is("player-1"));
    assertThat(created.getPlayer2Id(), is("player-2"));
    assertThat(created.getPlayer1Placement(), CoreMatchers.notNullValue());
    assertThat(created.getPlayer2Placement(), CoreMatchers.notNullValue());
  }

  @Test
  public void firstTurnGoesToPlayer1() {
    GameUpdate game =
        game(ships("1 2 3", "5 6 7", "8 9 10 11"), ships("1 2 3", "5 6 7", "8 9 10 11"));

    assertThat(game.getStatus(), is(GameStatus.PLAYER1_TURN));
  }

  @Test
  public void alternateTurns() {
    GameUpdate game =
        game(ships("1 2 3", "5 6 7", "8 9 10 11"), ships("1 2 3", "5 6 7", "8 9 10 11"));

    for (int i = 0; i < 10; i++) {
      game = applyTurn(game, "player-1", 13 + i);
      assertThat(game.getStatus(), is(GameStatus.PLAYER2_TURN));
      game = applyTurn(game, "player-2", 13 + i);
      assertThat(game.getStatus(), is(GameStatus.PLAYER1_TURN));
    }
  }

  @Test
  public void guessIsKeptInHistory() {
    GameUpdate game =
        game(ships("1 2 3", "5 6 7", "8 9 10 11"), ships("1 2 3", "5 6 7", "8 9 10 11"));

    game = applyTurn(game, "player-1", 50);

    assertThat(game.getPlayer1ShotsList(), hasItem(shot(50)));
  }

  @Test
  public void player1Wins() {
    GameUpdate game =
        game(ships("1 2 3", "4 5 6 7", "8 9 10 11"), ships("1 2 3", "4 5 6 7", "8 9 10 11"));

    //
    // 1. destroy all the cells of player-2 except cell #11
    //
    for (int i = 1; i <= 10; i++) {
      game = applyTurn(game, "player-1", i); // hits
      game = applyTurn(game, "player-2", 13 + i); // misses
    }
    //
    // 2. kill player's 2 last remaining cell
    //
    game = applyTurn(game, "player-1", 11);

    assertThat(game.getStatus(), is(GameStatus.PLAYER1_WIN));
  }

  @Test
  public void player2Wins() {
    GameUpdate game =
        game(ships("1 2 3", "4 5 6 7", "8 9 10 11"), ships("1 2 3", "4 5 6 7", "8 9 10 11"));

    //
    // 1. destroy all the cells of player-2 except cell #11
    //
    for (int i = 1; i <= 10; i++) {
      game = applyTurn(game, "player-1", 1_000_00 + i); // misses
      game = applyTurn(game, "player-2", i); // hits
    }
    //
    // 2. since it is player's 1 turn, make another dummy miss.
    //
    game = applyTurn(game, "player-1", 5_000_00); // misses
    //
    // 3. kill player's 1 last remaining cell
    //
    game = applyTurn(game, "player-2", 11);

    assertThat(game.getStatus(), is(GameStatus.PLAYER2_WIN));
  }

  private static Shot shot(int cell) {
    return Shot.newBuilder().setCellId(cell).build();
  }

  private static GameUpdate applyTurn(GameUpdate game, String playerId, int guess) {
    Turn turn = Turn.newBuilder().setGameId("game-1").setPlayerId(playerId).setShot(guess).build();
    Either<GameUpdate, Failure> next = GameLogic.apply(game, turn);
    assertThat(next.isLeft(), is(true));
    game = next.left;
    return game;
  }

  private static GameUpdate game(ShipPlacement p1, ShipPlacement p2) {
    CreateGame create =
        CreateGame.newBuilder()
            .setGameId("game-1")
            .setPlayer1Id("player-1")
            .setPlayer2Id("player-2")
            .setPlayer1Placement(p1)
            .setPlayer2Placement(p2)
            .build();

    return GameLogic.create(create);
  }

  private static ShipPlacement ships(String pos1, String pos2, String pos3) {
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
