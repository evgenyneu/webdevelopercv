module ApplicationHelper
  def permalink(post)
    "/" + post.permalink
  end
end
