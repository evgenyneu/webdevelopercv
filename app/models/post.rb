class Post < ActiveRecord::Base
  validates :title, :presence => true, :uniqueness => true
  validates :body, :presence => true
  
  before_save :before_saving_post
  
  def before_saving_post    
    self.permalink = self.title.z_to_url if self.permalink.empty?
  end
end
