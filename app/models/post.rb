class Post 
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :title, type: String
  field :permalink, type: String
  field :body, type: String
  
  index :title, unique: true
  index :permalink, unique: true
  
  validates :body, :presence => true
  
  before_save :before_saving_post
  
  def before_saving_post    
    self.permalink.strip!
    self.permalink = self.title.z_to_url if self.permalink.empty?    
    self.permalink = "/" + self.permalink if self.permalink[0] != "/"    
  end
  
  def self.by_permalink(permalink)
    permalink = "/" + permalink if permalink[0] != "/"  
    where(:permalink => permalink).first
  end
end
