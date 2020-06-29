battlefun.io
============

Demo
----

```
$ curl -s -H 'Content-type: application/json' -d '{}' localhost:8000/register | jq .
{
  "player_id": "4e7da011-9ff6-429b-93d3-a726d4385c32",
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
