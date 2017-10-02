'use strict'

const Command = use('Command')
const Database = use('Database')
const User = use('App/Model/User')

class Admin extends Command {

  get signature () {
    return "admin:create"
  }

  get description () {
    return "Creates the default admin user."
  }

  * handle (args, options) {
    this.info("Creating admin.")

    const admin = new User()
    admin.admin = true
    admin.email = "admin@admin.com"
    admin.password = "admin"
    admin.username = "admin"

    try {
      yield admin.save()
    } catch (e) {
      // We simply warn if the admin was potentially already created
      this.failed("create", "Couldn't create admin account. Does it already exist?")
      Database.close()
      return
    }
    this.completed("create", "Created admin account.")

    // https://github.com/adonisjs/adonis-framework/issues/227
    Database.close()
    return
  }
}

module.exports = Admin
