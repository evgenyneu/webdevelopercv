class Post 
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :title, type: String
  field :permalink, type: String
  field :body, type: String
  
  index :title, unique: true
  index :permalink, unique: true
  
  validates :title, :presence => true, :uniqueness => true
  validates :body, :presence => true
  
  before_save :before_saving_post
  
  def before_saving_post    
    self.permalink = self.title.z_to_url if self.permalink.empty?
  end
  
  def self.by_permalink(permalink)
    where(:permalink => permalink).first
  end
end
