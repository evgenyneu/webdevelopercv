class String
  def z_parse_date
    DateTime.strptime(self, "%m/%d/%Y")
  end
  
  def z_to_url
    self.strip.downcase.gsub(/[^ a-z0-9]/,' ').gsub(/ {1,}/,'-')    
  end
end
