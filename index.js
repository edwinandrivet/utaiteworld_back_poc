'use strict'

const crypto = require("crypto")

//http://codahale.com/a-lesson-in-timing-attacks/
const constantTimeCompare = (val1 = null, val2 = null) => {
    if (val1 === null && val2 !== null) {
        return false
    } else if (val2 === null && val1 !== null) {
        return false
    } else if (val1 === null && val2 === null) {
        return true
    }

    if (val1.length !== val2.length) {
        return false
    }

    let matches = 1;
    for (let i = 0; i < val1.length; ++i){
        matches &= (val1.charAt(i) === val2.charAt(i) ? 1 : 0) //Don't short circuit
    }

    return matches === 1
}

class Keygrip {
    constructor(keys = null, algorithm = "sha256", encoding = "base64") {
        if (!keys || !(0 in keys)) {
            throw new Error("Keys must be provided.")
	}
	this.keys = keys
	this.algorithm = algorithm
	this.encoding = encoding
    }

    index(data, digest) {
        for (const [index, key] of this.keys.entries()) {
            if (constantTimeCompare(digest, this._sign(data, key))) {
                return index
	    }
	}
        return -1
    }

    _sign(data, key) {
        return crypto.createHmac(this.algorithm, key)
	    .update(data).digest(this.encoding)
	    .replace(/\/|\+|=/g, x => ({ "/": "_", "+": "-", "=": "" })[x])
    }

    sign(data) {
        return this._sign(data, this.keys[0])
    }

    verify(data, digest) {
        return this.index(data, digest) > -1
    }
}
  
//Keygrip.sign = Keygrip.verify = Keygrip.index = () => { throw new Error("Usage: require('keygrip')(<array-of-keys>)") }


module.exports = Keygrip
