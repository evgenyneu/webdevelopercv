class String
  def z_to_url
    self.strip.downcase.gsub(/[^ a-z0-9]/,' ').gsub(/ {1,}/,'-')    
  end
end