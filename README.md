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
fetch.request(url, [hostsMap,] function (err, buff) {
  ...
});
```

```
fetch.request(option, [hostsMap,] function (err, buff) {
  ...
});
```

```
fetch.pipe(req, [hostsMap,] function (err, buff, nsres) {
  ...
});
```