import { GameState } from "../game/Game";
export const fakeGameState: GameState = {
  game_id: "some-other-guid",
  opponent_id: "some-guid",
  current_state: "IN_PROGRESS",
  your_turn: false, // only if IN_PROGRESS
  your_shots: [
    { cell: 13, hit: false },
    { cell: 35, hit: false },
    { cell: 50, hit: false },
    { cell: 67, hit: true },
    { cell: 77, hit: true },
    { cell: 87, hit: true },
    { cell: 88, hit: false },
  ],
  opponent_shots: [12, 13, 34, 55, 62, 65, 88], // ^ same as above
  destroyed_opponent_ships: ["destroyer"],
  your_ships: {
    carrier: [95, 96, 97, 98, 99],
    battleship: [18, 28, 38, 48],
    destroyer: [1, 11, 21],
    submarine: [25, 35, 45],
    patrol_boat: [29, 39],
  },
};
