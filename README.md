# fetch-agent
> Get Remote Resources

## Usage
```
npm install fetch-agent
```

## Invoke
```
var fetch = require("fetch-agent");

var option = fetch.request.buildOption(url);
fetch.request(option, function (err, buff) {
  ...
});
```