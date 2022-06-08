const { Account } = require('@tonclient/appkit')
const { TonClient, signerKeys, signerNone } = require('@tonclient/core')

const core = require('everscale-did-sdk-radiance')
const { randomInt } = require('crypto')

const possible = "abcdfe0123456789"


module.exports = {

    auth: (did) => {
        return new Promise(async (resolve, reject) => {
            try {
                if(await checkDID(did) == true) {
                    var didDocument = await core.resolveDIDDocument(did)
                    if(didDocument == undefined) {
                        reject({
                            status: false,
                            value: "Error: There is no didDocument under such a did!"
                        })
                    }
                    var value = ""
                    for(i = 0; i< 20; i++) {
                        value += possible.charAt(randomInt(possible.length - 1))
                    }
                    resolve({
                        status: true,
                        value: value
                    })
                } else {
                    reject({
                        status: false,
                        value: "Error: Сheck the did!"
                    })
                }
            } catch {
                reject({
                    status: false,
                    value: "Error: Сheck the did!"
                })
            }
        })
    },


    login: (did, value, signature) => {
        return new Promise(async (resolve, reject) => {
            try {
                var didDocument = await core.resolveDIDDocument(did)
                var check = await core.verifyMessage(value, signature, didDocument.didDocument.verificationMethod.publicKeyMultibase)
                
                resolve(check)
            } catch(er) {
                reject(er)
            }
        })
    }


}


function checkDID(did) {
    return new Promise(async (resolve, reject) => {
        if(typeof did == "string") {
            if(did.length == 78) {
                did = did.split(":")
                if(did[0] == "did") {
                    if(did[1] == "everscale") {
                        resolve(true)
                    } else {
                        reject({
                            status: false,
                            code: 1
                        })
                    }
                } else {
                    reject({
                        status: false,
                        code: 1
                    })
                }
            } else {
                reject({
                    status: false,
                    code: 1
                })
            }
        } else {
            reject({
                status: false,
                code: 1
            })
        }
    })
}