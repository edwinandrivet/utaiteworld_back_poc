/**
 * Created by eandrivet on 5/7/17.
 */

'use strict'

const Lucid = use('Lucid')

class Utaite extends Lucid {
  static boot () {
    super.boot()

    /**
     * Hashing password before storing to the
     * database.
     */
    this.addHook('beforeCreate', function * (next) {
      this.description = 'This is a default value for the description.'
      yield next
    })
  }

}

module.exports = Utaite
