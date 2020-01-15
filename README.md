# Fiume in piena

This platform's aim is to give a different perspective of what is-being-done by leading people for the planet.

## Data Structure
### Event
The event should include the following informations:
- _topic_ (i.e. "Climate Emergency and Environmental Declaration")
- _area_ (i.e. "Milan")
- _actors_ involved (i.e. "comune-di-milano" it has to be consistent with real actor folder's name)

### Network
A `network` is used to display a graph of events in a defined timeline:
- *nodes* following an horizontal line are events of the same `topic`
- *links* of the same color that connect *nodes* are events of the same `actor`


### Timeline
A `timeline` is used to highlight all the events for a specific `topic`/`actor`


## Development
```
$ npm run develop
```

## Build
```
$ npm run build
```