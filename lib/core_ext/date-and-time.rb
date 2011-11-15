class Time
  def z_to_date_str
    Evgn::Misc.format_date(self)
  end    
  
  def z_to_time_str
    Evgn::Misc.format_time(self)
  end
end

class DateTime  
  def z_to_time_str
    Evgn::Misc.format_time(self)
  end
end

class Date
  def z_to_date_str
    Evgn::Misc.format_date(self)
  end    
end
