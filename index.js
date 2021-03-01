const http = require("http");
const { resolve } = require("path");

class Private {
    static checkUrl(Pi) {
        if (!(Pi.ipAddress != "" || Pi.urlOverride != "")) {
            throw "API url not provided";
        }
    }

    static parseUri (url) {
        let	o = {
            strictMode: false,
            key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
            q:   {
                name:   "queryKey",
                parser: /(?:^|&)([^&=]*)=?([^&]*)/g
            },
            parser: {
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
            }
        }

        let m = o.parser[o.strictMode ? "strict" : "loose"].exec(url);
        let uri = {};
        let i   = 14;
    
        while (i--) uri[o.key[i]] = m[i] || "";
    
        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = $2;
        });
    
        return uri;
    }

    static createRequestOptions(url, requestType) {
        let uri = this.parseUri(url);

        let options = {
            hostname: uri.host,
            port: Number(uri.port),
            path: uri.path,
            method: requestType
        }

        if(uri.port != "") {
            options.port = Number(uri.port)
        }

        return options;
    }

    static isJSON(text) {
        return (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
    }
}

/**
 * Adds easy functionality to help interface with PiAPI
 * https://github.com/Bolillo-Kremer/PiAPI
 * https://youtube.com/BolilloKremer
 */
class Pi {

    /**
     * Initiates connection to PiAPI
     * @param {string} address Either PiAPI IP address or full address to PiAPI
     * @param {Number} port The port that PiAPI is running on (Not needed if given full address)
     */
    constructor(address, port = -1) {
        if (Number(port) != -1) {
            this.ipAddress = address;
            this.port = Number(port); 
            this.urlOverride = "";
            this.rawUrl = `http://${this.ipAddress}:${this.port}`;
        }
        else {
            this.ipAddress = "";
            this.port = -1;
            this.urlOverride = address;
            this.rawUrl = this.urlOverride;
        }
    }

    /**
     * Returns the default port of PiAPI
     */
    static defaultPort() {
        return "5000";
    }

    /**
     * Initiates pin on the raspberry pi
     * @param {Number} pin The pin on the raspberry pi
     * @param {string} direction The direction of the pin
     * @param {string} edge (OPTIONAL) The edge of the pin
     * @param {Number} edgeTimeout (OPTIONAL) The edge timeout of the pin 
     */
    async initPin(pin, direction, edge=null, edgeTimeout=-1) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/InitPin";

        let pinSettings = {
            "pin": pin,
            "direction": direction
        };

        if (edge != null) {
            pinSettings["edge"] = edge;
        }

        if (edgeTimeout != -1) {
            pinSettings["edgeTimeout"] = edgeTimeout;
        }

        return await Utilities.post(url, JSON.stringify(pinSettings));
    }

    /**
     * Unexports a given pin on the raspberry pi
     * @param {Number} pin The pin to unexport
     */
    async unexportPin(pin) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/Unexport";
        return await Utilities.post(url, pin.toString());
    }

    /**
     * Unexports all pins on the raspberry pi
     */
    async cleanExit() {
        Private.checkUrl(this);
        let url = this.rawUrl + "/CleanExit";
        return await Utilities.get(url);
    }

    /**
     * Sets state of a given pin on the raspberry pi
     * @param {Number} pin The pin to change the state of
     * @param {Number} state The state to change to
     */
    async setState(pin, state) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/SetState";

        let pinSettings = {
            "pin": Number(pin),
            "state": Number(state)
        }

        return await Utilities.post(url, JSON.stringify(pinSettings));
    }

    /**
     * Sets state of all pins on the raspberry pi
     * @param {Number} state State to set all pins to 
     */
    async setAllStates(state) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/SetState"

        let pinSettings = {
            "pin": Helpers.Pin.all(),
            "state": Number(state)
        }

        return await Utilities.post(url, JSON.stringify(pinSettings));
    }

    /**
     * Gets the state of a given pin
     * @param {Number} pin The pin to get the state of
     */
    async getState(pin) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/GetState";
        return Number(await Utilities.post(url, pin.toString()));
    }

    /**
     * Gets a JSON of all the states of all active pins
     */
    async getAllStates() {
        Private.checkUrl(this);
        let url = this.rawUrl + "/GetState";
        return JSON.parse(await Utilities.post(url, Helpers.Pin.all()));
    }

    /**
     * Gets a JSON of all active pins
     */
    async activePins() {
        Private.checkUrl(this);
        let url = this.rawUrl + "/ActivePins";
        return JSON.parse(await Utilities.get(url));
    }

    /**
     * Executes a terminal command on the raspberry pi
     * @param {string} command The command to execute
     */
    async command(command) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/Command";
        return await Utilities.post(url, command);
    }

    /**
     * Reboots the raspberry pi
     */
    reboot() {
        this.command("sudo reboot");
    }

    /**
     * Shuts down the raspberry pi
     */
    shutdown() {
        this.command("sudo shutdown -h");
    }

    /**
     * Gets a PiAPI setting value
     * @param {string} settingName The name of the setting
     */
    async getAPISetting(settingName) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/GetSetting";
        let res = await Utilities.post(url, settingName);
        return (Private.isJSON(res)) ? JSON.parse(res) : res;
    }

    /**
     * Sets a PiAPI setting value
     * @param {string} settingName The name of the setting 
     * @param {*} settingValue The value of the setting
     */
    setAPISetting(settingName, settingValue) {
        Private.checkUrl(this);
        let url = this.rawUrl + "/SetSetting";
        let setting = {
            "setting": settingName,
            "val": settingValue
        }
        Utilities.post(url, JSON.stringify(setting));
    }

    /**
     * Gets the port that PiAPI is running on
     */
    async getAPIPort() {
        return await this.getAPISetting("port");
    }

    /**
     * Sets the port that PiAPI is running on
     * @param {Number} port The new port that PiAPI will run on
     */
    setAPIPort(port) {
        this.setAPISetting("port", Number(port));
    }
}

/**
 * Extra utilities that might help improve your PiAPI expirience
 */
class Utilities {
    /**
     * Makes an HTTP POST request
     * @param {string} url The URL to post to
     * @param {string} data The data to post to the url
     * @returns Promise with response value
     */
    static post(url, data) {
        return new Promise((resolve, reject) => {
            let options = Private.createRequestOptions(url, "POST");
            //options.body = data;
            options.headers = {
                'Content-Type': 'application/json'
            }
            
            let req = http.request(options, res => {
              res.on('data', d => {
                resolve(d.toString("ascii"));
              });
            });
            
            req.on('error', error => {
                reject((Private.isJSON(error.toString())) ? JSON.parse(error.toString()) : error);
            });
            
            req.write(data)
            req.end()
        });
    }

    /**
     * Makes an HTTP GET request
     * @param {string} url The url to get from
     * @returns Promise with response value
     */
    static get(url) {
        return new Promise((resolve, reject) => {
            let options = Private.createRequestOptions(url, "GET");
          
            let req = http.request(options, res => {             
                res.on('data', d => {
                    resolve(d.toString("ascii"));
                }) 
            })
            
            req.on('error', error => {
                reject((Private.isJSON(error.toString())) ? JSON.parse(error.toString()) : error);
            })
            
            req.end()
        });
    }

    /**
     * A Promise that waits a given amount of miliseconds before resolving
     * @param {Number} miliseconds How many miliseconds to wait
     */
    static wait(miliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, miliseconds);
        });
    }
}

/**
 * Raspberry Pi value helpers
 */
class Helpers {

    /**
     * Pin value helpers
     */
    static Pin = {
        /**
         * @returns Pin in value
         */
        in: () => {return "in"},
        /**
         * @returns Pin out value
         */
        out: () => {return "out"},
        /**
         * @returns All pins value
         */
        all: () => {return "*"},
        /**
         * @returns High state value
         */
        high: () => {return 1},
        /**
         * @returns Low state value
         */
        low: () => {return 0},
        /**
         * @returns Toggle state value
         */
        toggle: () => {return -1}
    }

    /**
     * Edge value helpers
     */
    static Edge = {
        /**
         * @returns Rising edge value
         */
        rising: () => {return "rising"},
        /**
         * @returns Falling edge value
         */
        falling: () => {return "falling"},
        /**
         * @returns Both edge value
         */
        both: () => {return "both"}
    }

    /**
     * Pull value helpers
     */
    static Pull = {
        /**
         * @returns Pull up value
         */
        up: () => {return "up"},
        /**
         * @returns Pull down value
         */
        down: () => {return "down"}
    }

    /**
     * Pin Mode value helpers
     */
    static Mode = {
        /**
         * @returns BCM pin mode value
         */
        BCM: () => {return "bcm"},
        /**
         * @returns Board pin mode value
         */
        board: () => {return "board"}
    }
}

module.exports.Pi = Pi;
module.exports.Utilities = Utilities;
module.exports.Helpers = Helpers;