'use strict'

const Schema = use('Schema')

class UtaitesTableSchema extends Schema {

  up () {
    this.create('utaites', (table) => {
      table.increments()
      table.string('public_name', 80).notNullable()
      table.string('username', 80).notNullable().unique()
      table.string('channel_id', 45).notNullable().unique()
      table.string('description', 1000).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('utaites')
  }

}

module.exports = UtaitesTableSchema
