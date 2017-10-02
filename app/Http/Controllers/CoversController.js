/**
 * Created by eandrivet on 4/27/17.
 */

const https = require('https')
const API_KEY = process.env.API_KEY
const Utaite = use('App/Model/Utaite')
//  ?part=snippet&forUsername={username}&key={YOUR_API_KEY}
// https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId={channel id here}&maxResults=25&key={YOUR_API_KEY}
class CoversController {
  * getAllUtaites () {
    let utaites = yield Utaite.all()
    return utaites.toJSON()
  }

  * get (request, response) {
    const utaites = yield this.getAllUtaites()
    const channelIds = []
    for (const utaite of utaites) {
      channelIds.push(utaite.channel_id)
    }
    const maxResults = request.input('maxResults', 6)
    const videos = yield this.getVideos(channelIds)
    const videoList = []
    for (const video of videos) {
      video.items.forEach(video => {
        videoList.push(video)
      })
    }
    videoList.sort((a, b) => (new Date(a.snippet['publishedAt']).getTime() - new Date(b.snippet['publishedAt']).getTime()) * -1)
    videoList.splice(maxResults)
    response.send(JSON.stringify(videoList))
  }

  getVideos (channelIds) {
    const channelPromises = []
    for (const channelId of channelIds) {
      channelPromises.push(new Promise(function (resolve, reject) {
        https.get(`https://www.googleapis.com/youtube/v3/search?part=snippet` +
          `&channelId=${channelId}&maxResults=50&order=date&key=${API_KEY}`, res => {
          const {statusCode} = res
          const contentType = res.headers['content-type']

          let error
          if (statusCode !== 200) {
            error = new Error(`Request Failed.
        Status Code: ${statusCode}`)
          } else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type.
        Expected application/json but received ${contentType}`)
          }
          if (error) {
            console.error(error.message)
            // consume response data to free up memory
            res.resume()
            return
          }

          res.setEncoding('utf8')
          let rawData = ''
          res.on('data', chunk => { rawData += chunk })
          res.on('end', () => {
            try {
              const json = JSON.parse(rawData)
              resolve(json)
            } catch (e) {
              console.error(e.message)
              reject(e.message)
            }
          })
        }).on('error', e => console.error(`Got error: ${e.message}`))
      }))
    }
    return Promise.all(channelPromises)
  }

/*    const videoList = []
    const channelId = request.get().channel_id
    https.get(`https://www.googleapis.com/youtube/v3/search?part=snippet` +
      `&channelId=${channelId}&maxResults=6&order=date&key=${API_KEY}`, res => {
      const { statusCode } = res
      const contentType = res.headers['content-type']

      let error
      if (statusCode !== 200) {
        error = new Error(`Request Failed.
        Status Code: ${statusCode}`)
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.
        Expected application/json but received ${contentType}`)
      }
      if (error) {
        console.error(error.message)
        // consume response data to free up memory
        res.resume()
        return
      }

      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', chunk => { rawData += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(rawData)
          json.items.forEach(video => {
            videoList.push(video)
          })
          videoList.sort((a, b) => (new Date(a.snippet['publishedAt']).getTime() - new Date(b.snippet['publishedAt']).getTime()) * -1)
//          console.log(videoList)
          response.send(JSON.stringify(videoList))
        } catch (e) {
          console.error(e.message)
        }
      })
    }).on('error', e => console.error(`Got error: ${e.message}`)) */
}

module.exports = CoversController
