# PiAPI Java Library
##### [Bolillo Kremer](https://youtube.com/BolilloKremer?https://www.youtube.com/BolilloKremer?sub_confirmation=1)

## Overview
This user friendly library allows you to easily interface with multiple raspberry pi's at once using [PiAPI](https://github.com/Bolillo-Kremer/PiAPI). The simplicity of this library makes it easy for anybody to use. Most functionality is based off of [onoff](https://www.npmjs.com/package/onoff), which is running on [PiAPI](https://github.com/Bolillo-Kremer/PiAPI).

For updates on this project and other other entertainging coding projects, please subscribe to my YouTube channel, [Bolillo Kremer](https://youtube.com/BolilloKremer?https://www.youtube.com/BolilloKremer?sub_confirmation=1). 

## How to use

### Requirements
This library requires that [PiAPI](https://github.com/Bolillo-Kremer/PiAPI) is running on your raspberry pi. You can install it on your pi with just one command! To see instructions, [click here](https://github.com/Bolillo-Kremer/PiAPI/blob/master/README.md).

### Initializing
You can download the PiAPI's NPM package with the following command...
```
npm install piapi --save
```

```js
const {Pi} = require("piapi");
```
```js
//Initialize Pi object with IP address and port of pi
var myPi = new Pi("192.168.1.100", Pi.defaultPort());

//You need to specify which pins will be set as input or output
myPi.initPin(2, "in");
myPi.initPin(3, "out");

//Unexports all pins on the Pi
myPi.cleanExit();
```

If you would rather provide a specific url than using an IP address and a port, you can do so like this.
```js
var myPi = new Pi("http://192.168.1.100:5000");
```


### Interfacing

You can get the state (0 or 1) of a given pin using this function
```js
//Returns the state of pin 2 as a string
myPi.getState(2);
```

You can also get a JSON object of all the pin states using this function.

```js
//Returns a Newtonsoft.Json.Linq.JObject
myPi.getStates();
```
If you want to set the state (0 or 1) of a pin, use this function
```js
//Sets pin 2 to state 0
myPi.setState(2, 0);
```
Alternatively, you can use "toggle" to toggle the pins state
```js
//Sets pin 2 to state 0
myPi.setState(2, "toggle");
```

If you wish to set the state of all initiated pins, you can do so with the setAllStates() function.

#### Customize PiAPI

If you add any GET or POST methods to PiAPI on your Pi, you can access them with the Get and Post functions in PiAPI.Utilities.
Additionaliy, you can access the raw url of PiAPI by calling Utilities.RawUrl.

##### Example
```js
const {Pi, Utilities} = require("piapi");
```
```js
//Posts "Some Content" to PiAPI
var POSTResponse = await Utilities.post(myPi.rawUrl + "/SomePost", "Some content");

//Gets Response from PiAPI
var GETResponse = await Utilities.get(myPi.rawUrl + "/SomeGet");
```

### API Settings

This library also allwos you to interface with the PiAPI settings.

The settings will take place on server reboot.

#### Example
```js
//Changes port to 6000
myPi.setAPIPort(6000);
```

### Helpers
Memorizing all the terminology such as "in", "out", "up", "down" can be confusing for some. That's where PiAPI.Helpers come in. These are just simple constant variables that can help you use PiAPI more easily.

#### Example

```js
const {Pi, Utilities, Helpers} = require("piapi");
```
```js
var myPi = new Pi("192.168.1.100", Pi.defaultPort());

myPi.initPin(2, Helpers.Pin.in(), Helpers.Edge.rising());
myPi.getState(2);

myPi.cleanExit();
```


### Other Functions
In Utilities there is a function called wait that can be used to wait a given amount of miliseconds before moving on to the next line of execution. It can be implemented like this...

```js
const {Pi, Utilities, Helpers} = require("piapi");
```
```js
var myPi = new Pi("192.168.1.100", Pi.defaultPort());

myPi.initPin(2, "out");
myPi.setState(2, 1);

//Waits 1 second before moving on
await wait(1000)

myPi.setState(2, 0);

myPi.cleanExit();
```

For updates on this project and other other entertainging coding projects, please subscribe to my YouTube channel, [Bolillo Kremer](https://youtube.com/BolilloKremer?https://www.youtube.com/BolilloKremer?sub_confirmation=1). 
