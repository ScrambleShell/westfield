"use strict";

//westfield client namespace
const wfs = {};


//TODO wire args are copied from westfield-client-core.js we might want to put them in a shared file...
wfs.Fixed = class Fixed {

    /**
     * Represent fixed as a signed 24-bit integer.
     *
     * @returns {number}
     */
    asInt() {
        return ((this._raw / 256.0) >> 0);
    }

    /**
     * Represent fixed as a signed 24-bit number with an 8-bit fractional part.
     *
     * @returns {number}
     */
    asDouble() {
        return this._raw / 256.0;
    }

    /**
     * use parseFixed instead
     * @private
     * @param raw
     */
    constructor(raw) {
        this._raw = raw;
    }
};

wfs.parseFixed = function (number) {
    return new wfs.Fixed((number * 256.0) >> 0);
};

/**
 *
 * @param {Number} arg
 * @returns {{value: *, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._uint = function (arg) {
    return {
        value: arg,
        type: "u",
        size: 4,
        optional: false,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = this.value;
            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @param {Number} arg
 * @returns {{value: *, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._uintOptional = function (arg) {
    return {
        value: arg,
        type: "u",
        size: 4,
        optional: true,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = (arg === null ? 0 : this.value);
            wireMsg.offset += this.size;
        }
    }
};

/**
 *
 * @param {Number} arg
 * @returns {{value: *, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._int = function (arg) {
    return {
        value: arg,
        type: "i",
        size: 4,
        optional: false,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Int32Array(wireMsg, wireMsg.offset, 1)[0] = this.value;
            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @param {Number} arg
 * @returns {{value: *, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._intOptional = function (arg) {
    return {
        value: arg,
        type: "i",
        size: 4,
        optional: true,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Int32Array(wireMsg, wireMsg.offset, 1)[0] = (arg === null ? 0 : this.value);
            wireMsg.offset += this.size;
        }
    }
};

/**
 *
 * @param {Fixed} arg
 * @returns {{value: Fixed, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 */
wfs._fixed = function (arg) {
    return {
        value: arg,
        type: "f",
        size: 4,
        optional: false,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Int32Array(wireMsg, wireMsg.offset, 1)[0] = this.value._raw;
            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @param {Fixed} arg
 * @returns {{value: Fixed, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 */
wfs._fixedOptional = function (arg) {
    return {
        value: arg,
        type: "f",
        size: 4,
        optional: true,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Int32Array(wireMsg, wireMsg.offset, 1)[0] = (arg === null ? 0 : this.value._raw);
            wireMsg.offset += this.size;
        }
    }
};

/**
 *
 * @param {WObject} arg
 * @returns {{value: *, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._object = function (arg) {
    return {
        value: arg,
        type: "o",
        size: 4,
        optional: false,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = this.value._id;
            wireMsg.offset += this.size;
        }
    };
};


/**
 *
 * @param {WObject} arg
 * @returns {{value: *, type: string, size: number, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._objectOptional = function (arg) {
    return {
        value: arg,
        type: "o",
        size: 4,
        optional: true,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = (arg === null ? 0 : this.value._id);
            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @returns {{value: *, type: string, size: *, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._newObject = function () {
    return {
        value: null, //filled in by _marshallConstructor
        type: "n",
        size: 4,
        optional: false,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = this.value._id;
            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @param {String} arg
 * @returns {{value: *, type: string, size: *, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._string = function (arg) {
    return {
        value: arg,
        type: "s",
        size: 4 + (function () {
            //fancy logic to calculate size with padding to a multiple of 4 bytes (int).
            return (arg.length + 3) & ~3;
        })(),
        optional: false,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = this.value.length;

            const strLen = this.value.length;
            const buf8 = new Uint8Array(wireMsg, wireMsg.offset + 4, strLen);
            for (let i = 0; i < strLen; i++) {
                buf8[i] = this.value[i].codePointAt(0);
            }
            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @param {String} arg
 * @returns {{value: *, type: string, size: *, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._stringOptional = function (arg) {
    return {
        value: arg,
        type: "s",
        size: 4 + (function () {
            if (arg === null) {
                return 0;
            } else {
                //fancy logic to calculate size with padding to a multiple of 4 bytes (int).
                return (arg.length + 3) & ~3;
            }
        })(),
        optional: true,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            if (this.value === null) {
                new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = 0;
            } else {
                new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = this.value.length;

                const strLen = this.value.length;
                const buf8 = new Uint8Array(wireMsg, wireMsg.offset + 4, strLen);
                for (let i = 0; i < strLen; i++) {
                    buf8[i] = this.value[i].codePointAt(0);
                }
            }
            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @param {TypedArray} arg
 * @returns {{value: *, type: string, size: *, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._array = function (arg) {
    return {
        value: arg,
        type: "a",
        size: 4 + (function () {
            //fancy logic to calculate size with padding to a multiple of 4 bytes (int).
            return (arg.byteLength + 3) & ~3;
        })(),
        optional: false,
        /**
         *
         * @param {ArrayBuffer} wireMsg
         * @private
         */
        _marshallArg: function (wireMsg) {
            new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = this.value.byteLength;

            const byteLength = this.value.byteLength;
            new Uint8Array(wireMsg, wireMsg.offset + 4, byteLength).set(new Uint8Array(this.value.buffer, 0, byteLength));

            wireMsg.offset += this.size;
        }
    };
};

/**
 *
 * @param {Array} arg
 * @returns {{value: *, type: string, size: *, optional: boolean, _marshallArg: _marshallArg}}
 *
 */
wfs._arrayOptional = function (arg) {
    return {
        value: arg,
        type: "a",
        size: 4 + (function () {
            if (arg === null) {
                return 0;
            } else {
                //fancy logic to calculate size with padding to a multiple of 4 bytes (int).
                return (arg.byteLength + 3) & ~3;
            }
        })(),
        optional: true,
        _marshallArg: function (wireMsg) {
            if (this.value === null) {
                new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = 0;
            } else {
                new Uint32Array(wireMsg, wireMsg.offset, 1)[0] = this.value.byteLength;

                const byteLength = this.value.byteLength;
                new Uint8Array(wireMsg, wireMsg.offset + 4, byteLength).set(new Uint8Array(this.value.buffer, 0, byteLength));
            }
            wireMsg.offset += this.size;
        }
    };
};

//TODO unit tests

wfs.Global = class Global {

    /**
     *
     * @param {String} interfaceName
     * @param {Number} version
     */
    constructor(interfaceName, version) {
        this.interfaceName = interfaceName;
        this.version = version;
    }

    /**
     *
     * Invoked when a client binds to this global. Subclasses implement this method so they can instantiate a
     * corresponding wfs.Resource subtype.
     *
     * @param {wfs.Client} client
     * @param {Number} id
     * @param {Number} version
     */
    bindClient(client, id, version) {
    }
};

wfs.Resource = class Resource {

    constructor(client, version, id, implementation) {
        this.client = client;
        this.version = version;
        this.id = id;
        this.implementation = implementation;

        client._registerObject(this);
    }

    destroy() {
        client._unregisterObject(this);
    }
};

wfs.RegistryResource = class RegistryResource extends wfs.Resource {

    constructor(client, id, implementation) {
        super(client, 1, id, implementation);
    }

    /**
     * @param {Number} name
     * @param {Number} interface_
     * @param {Number} version
     */
    global(name, interface_, version) {
        this.client._marshall(this.id, 1, [wfs._uint(name), wfs._uint(interface_), wfs._uint(version)])
    }

    /**
     * Notify the client that the global with the given name id is removed.
     * @param {Number} name
     */
    globalRemove(name) {
        this.client._marshall(this.id, 2, [wfs._uint(name)]);
    }

    /**
     * opcode 1 -> bind
     *
     * @param {ArrayBuffer} message
     * @param {Client} client
     */
    [1](message) {
        this.implementation.bind(this, this.client["u"](message), this.client["u"](message), this.client["u"](message))
    }
};

wfs.Registry = class Registry {

    constructor() {
        this._registryResources = [];
        this._globals = new Map();
        this._nextGlobalName = 0;
    }

    /**
     * Bind an object to the connection.
     *
     * Binds a new, client-created object to the server using the specified name as the identifier.
     *
     * @param {wfs.RegistryResource} resource registry resource mapping a specific client
     * @param {Number} name unique numeric name of the object
     * @param {Number} id object id of the new object
     * @param {number} version The version used and supported by the client
     * @return {*} a new bounded object
     */
    bind(resource, name, id, version) {
        this.globals.get(name).bindClient(resource.client, id, version);
    }

    /**
     *
     * @param {wfs.Global} global
     */
    register(global) {
        if (global._name === null) {
            global._name = ++this._nextGlobalName;
        }
        this._globals.put(global._name, global);
        this._registryResources.forEach(registryResource => registryResource.global(global._name, global.interfaceName, global.version));
    }

    /**
     *
     * @param {wfs.Global} global
     */
    unregister(global) {
        if (this._globals.remove(global._name) !== false) {
            this._registryResources.forEach(registryResource => registryResource.globalRemove(global._name));
        }
    }

    /**
     *
     * @param {wfs.RegistryResource} registryResource
     * @private
     */
    _publishGlobals(registryResource) {
        this._globals.forEach((name, global) => registryResource.global(name, global.interfaceName, global.version));
    }

    /**
     *
     * @param {Client} client
     * @private
     */
    _createResource(client) {
        const registryResource = new wfs.RegistryResource(client, 1, this);
        this._registryResources.push(registryResource);
        return registryResource;
    }
};


//TODO implement websocket server connection hooks
/**
 * Represents a client websocket connection.
 *
 * @param {String} socketUrl
 * @constructor
 */
wfs.Client = class {

    /**
     *
     * @param {DataView} wireMsg
     * @returns {Number}
     */
    ["u"](wireMsg) {//unsigned integer {Number}
        const arg = new Uint32Array(wireMsg, wireMsg.offset, 1)[0];
        wireMsg.offset += 4;
        return arg;
    }

    /**
     *
     * @param {DataView} wireMsg
     * @returns {Number}
     */
    ["i"](wireMsg) {//integer {Number}
        const arg = new Int32Array(wireMsg, wireMsg.offset, 1)[0];
        wireMsg.offset += 4;
        return arg;
    }

    /**
     *
     * @param {DataView} wireMsg
     * @returns {Number}
     */
    ["f"](wireMsg) {//float {Number}
        const arg = new Int32Array(wireMsg, wireMsg.offset, 1)[0];
        wireMsg.offset += 4;
        return new wfs.Fixed(arg >> 0);
    }

    /**
     *
     * @param {DataView} wireMsg
     * @param {Boolean} optional
     * @returns {WObject}
     */
    ["o"](wireMsg, optional) {
        const arg = new Uint32Array(wireMsg, wireMsg.offset, 1)[0];
        wireMsg.offset += 4;
        if (optional && arg === 0) {
            return null;
        } else {
            return this._objects.get(arg);
        }
    }

    /**
     *
     * @param {DataView} wireMsg
     * @returns {function}
     */
    ["n"](wireMsg) {
        const arg = new Uint32Array(wireMsg, wireMsg.offset, 1)[0];
        wireMsg.offset += 4;
        const connection = this;
        return function (type) {
            const newObject = new wfs[type](this);
            newObject._id = arg;
            connection._objects.set(newObject._id, newObject);
            return newObject;
        }
    }

    /**
     *
     * @param {DataView} wireMsg
     * @param {Boolean} optional
     * @returns {String}
     */
    ["s"](wireMsg, optional) {//{String}
        const stringSize = new Uint32Array(wireMsg, wireMsg.offset, 1)[0];
        wireMsg.offset += 4;
        if (optional && stringSize === 0) {
            return null;
        }
        else {
            const byteArray = new Uint8Array(wireMsg, wireMsg.offset, stringSize);
            wireMsg.offset += (stringSize + (4 - (stringSize % 4)));
            return String.fromCharCode.apply(null, byteArray);
        }
    }

    /**
     *
     * @param {DataView} wireMsg
     * @param {Boolean} optional
     * @returns {ArrayBuffer}
     */
    ["a"](wireMsg, optional) {
        const arraySize = new Uint32Array(wireMsg, wireMsg.offset, 1)[0];
        wireMsg.offset += 4;
        if (optional && arraySize === 0) {
            return null;
        } else {
            const arg = wireMsg.slice(wireMsg.offset, wireMsg.offset + arraySize);
            wireMsg.offset += (arraySize + (4 - (arraySize % 4)));
            return arg;
        }
    }

    /**
     *
     * @param {ArrayBuffer} message
     * @param {string} argsSignature
     * @returns {Array}
     * @private
     */
    _unmarshallArgs(message, argsSignature) {
        const argsSigLength = argsSignature.length;
        const args = [];
        let optional = false;
        for (let i = 0; i < argsSigLength; i++) {
            let signature = argsSignature[i];
            optional = signature === "?";

            if (optional) {
                signature = argsSignature[++i];
            }

            args.push(this[signature](message, optional));
        }
        return args;
    }


    /**
     *
     * @param {ArrayBuffer} message
     * @private
     */
    _unmarshall(message) {
        const buffer = message.data;
        const bufu32 = new Uint32Array(buffer);
        const bufu16 = new Uint16Array(buffer);

        const id = bufu32[0];
        //const size = bufu16[2];//not used.
        const opcode = bufu16[3];
        buffer.offset = 8;

        const obj = this._objects.get(id);
        obj[opcode](buffer);
    }

    /**
     * Sends the given wireMessage to the client over a websocket connection
     *
     * @param {ArrayBuffer} wireMsg
     */
    doSend(wireMsg) {
    }

    /**
     * Handle a received message from a client websocket connection
     * @param {ArrayBuffer} event
     */
    onReceive(event) {
        this._unmarshall(event);
    }

    __marshallMsg(id, opcode, size, argsArray) {
        const wireMsg = new ArrayBuffer(size);

        //write actual wire message
        const bufu32 = new Uint32Array(wireMsg);
        const bufu16 = new Uint16Array(wireMsg);
        bufu32[0] = id;
        bufu16[2] = size;
        bufu16[3] = opcode;
        wireMsg.offset = 8;

        argsArray.forEach(function (arg) {
            arg._marshallArg(wireMsg); //write actual argument value to buffer
        });

        this.doSend(wireMsg);
    }

    /**
     *
     * @param {Number} id
     * @param {Number} opcode
     * @param {Array} argsArray
     * @private
     */
    _marshall(id, opcode, argsArray) {
        //determine required wire message length
        let size = 4 + 2 + 2;  //id+size+opcode
        argsArray.forEach(function (arg) {
            size += arg.size; //add size of the actual argument values
        });

        this.__marshallMsg(id, opcode, size, argsArray);
    };
};

//make this module available in both nodejs & browser
(function () {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
        module.exports = wfs;
    else
        window.wfc = wfs;
})();