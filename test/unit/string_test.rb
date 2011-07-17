require 'test_helper'

class StringTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "to_url_should_do_right_things" do
    assert_equal "a-b-123-c", ' A  b_*#@ 123 c '.z_to_url
  end
end
