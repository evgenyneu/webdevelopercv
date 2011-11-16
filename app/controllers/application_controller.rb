class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :make_random_str
  
  rescue_from CanCan::AccessDenied do |exception|
    redirect_to root_url, :alert => exception.message
  end    

  def return_url(default_url)
    params[:return_url] || default_url
  end

  protected 

  def make_random_str
    @random_str = "rnd-#{rand(10000000)}-#{rand(10000000)}";    
  end
  
  def not_found
    raise ActionController::RoutingError.new('Not Found')
  end
end
