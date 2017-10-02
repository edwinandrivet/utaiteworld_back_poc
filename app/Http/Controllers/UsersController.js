'use strict'

const R = require('ramda')

const User = use('App/Model/User')

class UsersController {
    * get (request, response) {
        const requests = request.all()

        const user = yield User.findBy('username', requests.username)
        if (R.isNil(user)) {
            response.status(404).send(`User ${requests.username} not found.`)
        } else {
            response.send(user.toJSON())
        }
        return
    }

    * getAll (request, response) {
        const users = yield User.all()
        response.send(users.toJSON())
        return
    }

  * create (request, response) {
    const user = new User()
    const requests = request.all()

    user.admin = (requests.admin === 'true')
    user.email = requests.email
    user.password = requests.password
    user.username = requests.username

    try {
      yield user.save()
      response.redirect('/', 301)
    } catch (e) {
      if (e.message.indexOf('SQLITE_CONSTRAINT: NOT NULL constraint failed:') !== -1) {
        response.status(400).send(`Wrong or missing parameter(s).`)
      } else if (e.message.indexOf('SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email') !== -1) {
        response.status(409).send(`Email ${requests.email} already in use.`)
      } else if (e.message.indexOf('SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username') !== -1) {
        response.status(409).send(`Username ${requests.username} already in use.`)
      } else {
        response.status(400).send(`Couldn't create user ${requests.username}!`)
      }
    }
    return
  }

  * update (request, response) {
      const requests = request.all()
      const user = yield User.findBy("email", requests.email)
      if (R.isNul(user)) {
          response.send(`User ${requests.username} doesn't exist.`)
          return
      }
      user.admin = R.isNul(requests.admin)
          ? user.admin
          : requests.admin
      user.email = R.isNul(requests.email)
          ? user.email
          : requests.email
      user.password = R.isNul(requests.password)
          ? user.password
          : requests.password
      user.username = R.isNul(requests.username)
          ? user.username
          : requests.username
      try {
          yield user.save()
          response.send(`User entry ${requests.username} was successfully updated!`)
      } catch (e) {
          response.status(400).send(`Couldn't update user entry ${requests.username}!`)
      }
      return
  }

  * remove (request, response) {
    const requests = request.all()

    if (R.isEmpty(requests)) {
      response.send('No parameters were sent!')
      return
    }

    const user = yield User.findBy('username', requests.username)
    if (R.isNil(user)) {
      response.send(`User ${requests.username} doesn't exist.`)
      return
    }

    yield user.delete()
    response.send(`User ${requests.username} deleted.`)
    return
  }

  * login (request, response) {
    const authToken = request.cookie('access_token', null)
    if (authToken !== null) {
      request.request.headers['authorization'] = `Bearer ${authToken}`
      const isLoggedIn = yield request.auth.check()
      if (!isLoggedIn) {
        response.unauthorized({error: 'You must be logged in to access this resource.'})
        return
      }
      response.send(200)
      return
    }

    const password = request.input('password', null)
    const email = request.input('email', null)

    if (!password || !email) {
      response.unauthorized({ error: 'Invalid credentials.' })
      return
    }

    const token = yield request.auth.attempt(email, password)

    if (token) {
      response.cookie('access_token', token, {
        httpOnly: true,
        path: '/',
      })
      response.send(200)
      return
    }

    response.unauthorized({ error: 'Invalid credentials.' })
    return
  }

  * logout (request, response) {
    response.cookie('access_token', 'deleted', {
      expires: new Date(0),
      httpOnly: true,
      path: '/',
    })
    response.send(200)
    return
  }
}

module.exports = UsersController
