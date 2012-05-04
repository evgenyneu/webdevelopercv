class Post
  include Mongoid::Document
  include Mongoid::Timestamps

  field :title, type: String
  field :sub_title, type: String
  field :permalink, type: String
  field :body, type: String

  index :title, unique: true
  index :permalink, unique: true

  attr_writer :date

  def body_for_html(page_id)
    if body_for_html_data.nil?
      body_for_html_data = self.body.gsub('***this-page-id***',page_id) unless self.body.nil?
      body_for_html_data ||= ""
    end
    body_for_html_data
  end

  validates :body, :presence => true

  before_save :before_saving_post

  def before_saving_post
    return false unless parse_created_at
    self.permalink.strip!
    self.permalink = self.title.z_to_url if self.permalink.empty?
    self.permalink = "/" + self.permalink if self.permalink[0] != "/"
  end

  def self.by_permalink(permalink)
    permalink = "/" + permalink if permalink[0] != "/"
    where(:permalink => permalink).first
  end

  def self.sort_posts
    order_by([[ :created_at, :desc ]])
  end

  def date
    self.created_at.z_to_date_str unless self.created_at.nil?
  end

  private

  attr_accessor :body_for_html_data

  def parse_created_at
    begin
      date_parsed = @date.z_parse_date
    rescue
      self.errors.add :date, "please provide a valid date"
      return false
    end

    self.created_at = DateTime.new date_parsed.year, date_parsed.month, date_parsed.day, 0, 0 
    return true
  end
end
