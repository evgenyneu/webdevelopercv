# To change this template, choose Tools | Templates
# and open the template in the editor.

class AuthorisedController < ApplicationController
  load_and_authorize_resource
end
