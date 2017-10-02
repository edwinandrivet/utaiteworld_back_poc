/**
 * Created by eandrivet on 5/7/17.
 */

'use strict'

const https = require('https')
const API_KEY = process.env.API_KEY
const R = require('ramda')

const Utaite = use('App/Model/Utaite')

class UtaitesController {
  getChannelId (requests, utaite) {
    return new Promise((resolve, reject) => {
      https.get('https://www.googleapis.com/youtube/v3/channels?part=id' +
        `&forUsername=${requests.username}&key=${API_KEY}`, res => {
        const { statusCode } = res
        const contentType = res.headers['content-type']

        const error = new Error()
        if (statusCode !== 200) {
          error.message = `Request Failed. Status Code: ${statusCode}`
        } else if (!/^application\/json/.test(contentType)) {
          error.message = `Invalid content-type.
        Expected application/json but received ${contentType}`
        }
        if (error.message) {
          console.error(error.message)
          // from doc: consume response data to free up memory
          res.resume()
          return
        }
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', chunk => { rawData += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(rawData)
            utaite.channel_id = json.items[0].id
            resolve(utaite.channel_id)
          } catch (e) {
            console.error(e.message)
            reject(e.message)
          }
        })
      }).on('error', e => console.error(`Got error: ${e.message}`))
    })
  }

  * get (request, response) {
    const requests = request.all()

    if (R.isNil(requests.username)) {
      response.status(404).send("Can't find a null username")
      return
    }

    const utaite = yield Utaite.findBy('username', requests.username)
    if (R.isNil(utaite)) {
      response.status(404).send(`Utaite entry ${requests.username} not found.`)
    } else {
      response.send(utaite.toJSON())
    }
  }

  * getAll (request, response) {
    const utaites = yield Utaite.all()
    response.send(utaites.toJSON())
  }

  * create (request, response) {
    const utaite = new Utaite()
    const requests = request.all()

    utaite.description = requests.description
    utaite.public_name = requests.public_name
    utaite.username = requests.username

    yield this.getChannelId(requests, utaite)
    try {
      yield utaite.save()
      response.send(`Utaite entry ${requests.username} created.`)
    } catch (e) {
      if (e.message.indexOf('SQLITE_CONSTRAINT: NOT NULL constraint failed:') !== -1) {
        response.status(400).send('Wrong or missing parameter(s).')
      } else if (e.message.indexOf('SQLITE_CONSTRAINT: UNIQUE constraint failed: utaites.channel_id') !== -1) {
        response.status(409).send(`Channel ID of ${requests.username} already in use.`)
      } else if (e.message.indexOf('SQLITE_CONSTRAINT: UNIQUE constraint failed: utaites.username') !== -1) {
        response.status(409).send(`Username ${requests.username} already in use.`)
      } else {
        response.status(400).send(`Couldn't create utaite entry ${requests.username}!`)
      }
    }
  }

  * update (request, response) {
    const requests = request.all()
    const utaite = yield Utaite.findBy('username', requests.username)
    if (R.isNil(utaite)) {
      response.send(`Utaite ${requests.channel_id} doesn't exist.`)
      return
    }
    utaite.description = R.isNil(requests.description)
        ? utaite.description
        : requests.description
    utaite.public_name = R.isNil(requests.public_name)
        ? utaite.public_name
        : requests.public_name
    utaite.username = R.isNil(requests.username)
        ? utaite.username
        : requests.username
    if (!R.isNil(requests.username)) {
      yield this.getChannelId(requests, utaite)
    }
    try {
      yield utaite.save()
      response.send(`Utaite entry ${requests.username} was successfully updated!`)
    } catch (e) {
      response.status(400).send(`Couldn't update utaite entry ${requests.username}!`)
    }
  }

  * remove (request, response) {
    const requests = request.all()

    // channelIds are sent as an array
    const channelIds = requests.channelIds.split(',')
    for (const channelId of channelIds) {
      const utaite = yield Utaite.findBy('channel_id', channelId)
      if (R.isNil(utaite)) {
        response.send(`Utaite ${channelId} doesn't exist.`)
        return
      }
      yield utaite.delete()
    }
    response.send(`Utaite ${requests.channel_id} deleted.`)
  }
}

module.exports = UtaitesController
