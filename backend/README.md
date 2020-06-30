battlefun.io
============

Demo
----

```
$ curl -s -H 'Content-type: application/json' -d '{}' localhost:8000/register | jq .
{
  "player_id": "4e7da011-9ff6-429b-93d3-a726d4385c32",
  "name": "Anonymous_coward#934",
  "token": "e2271271-3132-4fdb-9973-23b93f773fca"
}
```

Connect to WebSocket at `ws://localhost:8000/ws/4e7da011-9ff6-429b-93d3-a726d4385c32`.

Send WebSocket message:

```
{
  "type": "authentication",
  "token": "e2271271-3132-4fdb-9973-23b93f773fca"
}
```

Publish a message:

```
$ curl -s -H 'Content-type: application/json' localhost:8000/publish -d'
{
  "message": "Hello, world!"
}
'
```


Matchmaking and taking a turn
-----------------------------

```
# Register two players
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ curl -s -H 'Content-type: application/json' -X POST -d '{}' localhost:8000/api/register | jq .
{
  "player_id": "ebf0f95a-d90d-4841-a59f-ccb251547eb8",
  "name": "Anonymous_coward#55565",
  "token": "fc8a0d40-c956-49ae-80a2-cc45c160a03d"
}
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ curl -s -H 'Content-type: application/json' -X POST -d '{}' localhost:8000/api/register | jq .
{
  "player_id": "fa665f7e-96fd-4d85-91ee-78fa28577f3f",
  "name": "Anonymous_coward#38653",
  "token": "397e160d-dae7-424c-b2db-b0a499f48cc6"
}

# Add both to matchmaking
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ TOKEN=fc8a0d40-c956-49ae-80a2-cc45c160a03d
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ curl -s -H "Authorization: Bearer $TOKEN" -H 'Content-type: application/json' -X POST -d '{"ships": {"foo": [3, 4, 5]}}' localhost:8000/api/game | jq .
{
  "success": true
}
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ TOKEN=397e160d-dae7-424c-b2db-b0a499f48cc6
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ curl -s -H "Authorization: Bearer $TOKEN" -H 'Content-type: application/json' -X POST -d '{"ships": {"foo": [3, 4, 5]}}' localhost:8000/api/game | jq .
{
  "success": true
}

# See created game in log:
# > Start game 90e69db8-347c-4770-bedd-4b153deab8fe with ebf0f95a-d90d-4841-a59f-ccb251547eb8 ({"foo": [3, 4, 5]}) and fa665f7e-96fd-4d85-91ee-78fa28577f3f ({"foo": [3, 4, 5]})

# Take a shot as player 1
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ curl -s -H "Authorization: Bearer $TOKEN" -H 'Content-type: application/json' -X POST -d '{"cell": 2}' localhost:8000/api/game/90e69db8-347c-4770-bedd-4b153deab8fe | jq .
{
  "success": true
}

# See shot in log:
# > Game 90e69db8-347c-4770-bedd-4b153deab8fe: player fa665f7e-96fd-4d85-91ee-78fa28577f3f took a shot @ 2

# Take a shot with a bad game ID:
plucas@antares-ubuntu:~/dev/projects/battlefun-io/backend$ curl -s -H "Authorization: Bearer $TOKEN" -H 'Content-type: application/json' -X POST -d '{"cell": 2}' localhost:8000/api/game/90e69db8-347c-4770-bedd-4b153deab8fd | jq .
{
  "message": "unknown game: 90e69db8-347c-4770-bedd-4b153deab8fd"
}
```
