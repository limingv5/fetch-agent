# fetch-agent
> Get Remote Resources

## Usage
```
npm install fetch-agent
```

## Invoke
```
var fetch = require("fetch-agent");
```

```
fetch.request(url, [hostsMap,] function (err, buff, nsres) {
  ...
});
```

```
fetch.request(option, [hostsMap,] function (err, buff, nsres) {
  ...
});
```

```
fetch.proxy(req, res, function onSuccess(err, buff, nsres) {
  ...
}, function onError(err, nsres) {
  ...
});
```