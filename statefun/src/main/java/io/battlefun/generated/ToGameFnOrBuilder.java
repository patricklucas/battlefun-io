// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: battlefunio.proto

package io.battlefun.generated;

public interface ToGameFnOrBuilder
    extends
    // @@protoc_insertion_point(interface_extends:io.battlefun.ToGameFn)
    com.google.protobuf.MessageOrBuilder {

  /** <code>string game_id = 1;</code> */
  java.lang.String getGameId();
  /** <code>string game_id = 1;</code> */
  com.google.protobuf.ByteString getGameIdBytes();

  /** <code>.io.battlefun.ToGameFn.CreateGame create_game = 2;</code> */
  boolean hasCreateGame();
  /** <code>.io.battlefun.ToGameFn.CreateGame create_game = 2;</code> */
  io.battlefun.generated.ToGameFn.CreateGame getCreateGame();
  /** <code>.io.battlefun.ToGameFn.CreateGame create_game = 2;</code> */
  io.battlefun.generated.ToGameFn.CreateGameOrBuilder getCreateGameOrBuilder();

  /** <code>.io.battlefun.ToGameFn.GetGameStatus get_game_status = 3;</code> */
  boolean hasGetGameStatus();
  /** <code>.io.battlefun.ToGameFn.GetGameStatus get_game_status = 3;</code> */
  io.battlefun.generated.ToGameFn.GetGameStatus getGetGameStatus();
  /** <code>.io.battlefun.ToGameFn.GetGameStatus get_game_status = 3;</code> */
  io.battlefun.generated.ToGameFn.GetGameStatusOrBuilder getGetGameStatusOrBuilder();

  /** <code>.io.battlefun.ToGameFn.Turn turn = 4;</code> */
  boolean hasTurn();
  /** <code>.io.battlefun.ToGameFn.Turn turn = 4;</code> */
  io.battlefun.generated.ToGameFn.Turn getTurn();
  /** <code>.io.battlefun.ToGameFn.Turn turn = 4;</code> */
  io.battlefun.generated.ToGameFn.TurnOrBuilder getTurnOrBuilder();

  /** <code>.io.battlefun.ToGameFn.Resign resign = 5;</code> */
  boolean hasResign();
  /** <code>.io.battlefun.ToGameFn.Resign resign = 5;</code> */
  io.battlefun.generated.ToGameFn.Resign getResign();
  /** <code>.io.battlefun.ToGameFn.Resign resign = 5;</code> */
  io.battlefun.generated.ToGameFn.ResignOrBuilder getResignOrBuilder();

  public io.battlefun.generated.ToGameFn.MsgCase getMsgCase();
}
