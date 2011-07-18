class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :make_random_str

  protected 
  def make_random_str
    @random_str = "rnd-#{rand(10000000)}-#{rand(10000000)}";    
  end
end
