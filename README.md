<p align="center">
    <img src="public/logo.png"/>
</p>

# graggy

Graph generation tool, which allows to visually design a graph dataset for testing knowledge embedding models and graph algorithms, and then automatically augment it.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Possible problems and solutions

Use the following command

```
sudo sysctl -w fs.inotify.max_user_watches=100000
```

To eliminate the error `System limit for number of file watchers reached`
