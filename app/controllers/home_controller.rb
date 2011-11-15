class HomeController < ApplicationController
  def index
    @post = Post.by_permalink("/")
    
    respond_to do |format|
      format.html 
      format.xml  { render :xml => @post }
    end
  end
  
  def projects
    @posts = Post.where(permalink: /^\/projects\//i).sort_posts
    respond_to do |format|
      format.html 
      format.xml  { render :xml => @posts }
    end
  end
end
