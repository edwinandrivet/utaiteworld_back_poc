'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

Route.group('version1', () => {
  // Registering users routes
  Route.route('/users', 'POST', 'UsersController.create')
  Route.route('/users', 'GET', 'UsersController.getAll')
  Route.route('/users', 'PUT', 'UsersController.update')
  Route.route('/users', 'DELETE', 'UsersController.remove')

  Route.route('/users/login', 'POST', 'UsersController.login')
  Route.route('/users/logout', 'GET', 'UsersController.logout')

  Route.route('/utaites', 'POST', 'UtaitesController.create')
  Route.route('/utaites', 'GET', 'UtaitesController.getAll')
  Route.route('/utaites', 'PUT', 'UtaitesController.update')
  Route.route('/utaites', 'DELETE', 'UtaitesController.remove')

  Route.route('/covers/latest', 'GET', 'CoversController.get')
}).prefix('/api/v1')

// Adonis checks in order the routes so we put this last so that api calls work
Route.any('*', function * (request, response) {
  yield response.sendView('home')
})
