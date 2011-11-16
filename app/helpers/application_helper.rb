module ApplicationHelper  
  def posted_on_message(date)
    "Published on #{date.strftime("%B #{date.day.ordinalize}, %Y")}".html_safe
  end

  def return_url(default_url)
    params[:return_url] || default_url
  end
end
