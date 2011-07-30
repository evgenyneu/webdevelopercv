module ApplicationHelper  
  def posted_on_message(date)
     "Published on #{date.strftime("%B #{date.day.ordinalize}, %Y")}".html_safe
  end
end
