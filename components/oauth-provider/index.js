/**
 * hive.js
 * Copyright (C) 2013-2015 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var path = require('path')
  , parseBody = require('koa-body')
  , querystring = require('querystring')

module.exports = setup
module.exports.consumes = ["ui","auth","authToken", "http"]

function setup(plugin, imports, register) {
  var auth = imports.auth
    , authToken = imports.authToken
    , http = imports.http
    , ui = imports.ui

  var oauth = {
    authenticator: function*(){return true}
    /**
     * @param authenticator {Generator} A function taking the following arguments:
     *  (client_id, client_secret, redirect_uri), where client_secret may be null if we get a response_type=code
     *  The Function should respond with a Boolean, indicating a successfull/failed authentication of the client
     */
  , registerClientAuthenticator: function(authenticator) {
      this.authenticator = authenticator
    }
  , authenticateClient: function*(client_id, client_secret, redirect_uri) {
      return yield this.authenticator(client_id, client_secret, redirect_uri)
    }
  }

  /**
   * The authorization process utilizes two authorization server endpoints
   * (HTTP resources):
   *
   * o  Authorization endpoint - used by the client to obtain
   *    authorization from the resource owner via user-agent redirection.
   *
   * o  Token endpoint - used by the client to exchange an authorization
   *    grant for an access token, typically with client authentication.
   *
   * (from the oauth spec: https://tools.ietf.org/html/rfc6749#section-3)
   */

  http.router.get('/authorize', function*(next) {
    if(!this.query.redirect_uri) {
      this.body = 'Error: No redirect_uri specified!\r\nThis is very unfortunate. Apparently the developer that created the application that directed you here made a mistake. Press "back" and tell the person who runs the application about this.\r\nThank you!'
      return
    }
    // Only allow implicit grant type for now
    if(this.query.response_type !== 'token') {
      this.redirect(responseURI(this.query.redirect_uri, {error: 'unsupported_response_type', error_description: 'Only "token" grant_type is allowed'}))
      return
    }
    if(!(yield oauth.authenticateClient(this.query.client_id, null, this.query.redirect_uri))) {
      this.body = 'Error: Unauthenticated client\r\nThe app that redirected you here is not registered. Press "back" and report this to the person who runs the app about this.\r\nThank you!'
      return
    }
    yield next
  }, ui.bootstrapMiddleware())


  /**
   * According to the spec, the token endpoint SHOULD support the following `grant_type`s:
   * * `authorization_code`({code, redirect_uri}) the authorization code grant type
   * * `password`({username, password}) the resource owner password credentials grant type (needs client authentication)
   * * `client_credentials`(requestBody.credentials or requestBody:{client_id,client_secret,...}) the client credentials grant, will not cause an oauth.authenticateClient run, register an authentication provider for `client_credentials` and return a user that corresponds to that client
   *
   * however, since the grant types can be extended, we do exactly that, although a little unorthodox
   * hive.js allow you to use the identifier of any registered authentication provider as `grant_type`
   * along with credentials for that method set as `credentials` or some other field name (the auth provider will get the whole params object as `credentails` in that case)
   */
  http.router.post('/token', parseBody(), function*(next) {
    var grant_type = this.request.body.grant_type
      , client_credentials_required = (grant_type === 'authorization_code') || (grant_type === 'password')
    if(client_credentials_required && !(yield oauth.authenticateClient(this.query.client_id, this.query.client_secret))) {
      this.status = 400
      this.body = {error: 'invalid_client'}
      return
    }

    var user
    console.log(this.request.body)
    if(!(user = yield auth.authenticate(this.request.body.grant_type, this.request.body.credentials || this.request.body))) {
      this.status = 400
      this.body = {error: 'invalid_grant'}
      return
    }

    if(!(yield auth.authorize(user, 'authorize', {scope: this.request.body.scope}))) {
      this.status = 400
      this.body = {error: 'invalid_scope'}
      return
    }

    var resp = {}
    resp.token_type = 'bearer'
    resp.user = user.id
    resp.access_token = yield authToken.sign({
      user: user.id
    , scope: this.request.body.scope || user.scope
    })
    this.body = resp
  })

  register(null, {oauth: oauth})
}

function responseURI(redirect_uri, params) {
  return redirect_uri+(~redirect_uri.indexOf('#')? '': '#')+querystring.stringify(params)
}
