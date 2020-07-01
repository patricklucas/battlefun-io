#!/bin/bash

player1="$(
  curl -s \
    -H 'Content-type: application/json' \
    -d '{}' \
    localhost:8000/api/register
)"

echo "$player1" | jq .

player2="$(
  curl -s \
    -H 'Content-type: application/json' \
    -d '{}' \
    localhost:8000/api/register
)"

echo "$player2" | jq .

player1_token="$(echo "$player1" | jq -Mr .token)"
curl -s \
  -H "Authorization: Bearer $player1_token" \
  -H 'Content-type: application/json' \
  -d '{"ships": {"foo": [3, 4, 5]}}' \
  localhost:8000/api/game | jq .

player2_token="$(echo "$player2" | jq -Mr .token)"
curl -s \
  -H "Authorization: Bearer $player2_token" \
  -H 'Content-type: application/json' \
  -d '{"ships": {"foo": [3, 4, 5]}}' \
  localhost:8000/api/game | jq .
