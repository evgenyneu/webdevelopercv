module Evgn
  class Misc 
    class << self
      def format_price(num)
        return nil if num.nil?
        number_of_decimals = 2
        if number_of_decimals_in_number(num) > 2
          number_of_decimals = 3 
        end
        str = "%.#{number_of_decimals}f" % num
        if num.abs < 1
          str = str[1..-1]
        end
        str
      end      

      def number_to_currency(num)
        number_of_decimals = 2
        if number_of_decimals_in_number(num) > 2
          number_of_decimals = 3 
        end
        ActionController::Base.helpers.number_to_currency num, :precision => number_of_decimals
      end
      
      def format_time(time)
        time.strftime("%l:%M %p").strip
      end
      
      def format_date(date)
        "#{date.month}/#{date.day}/#{date.year}"
      end

      def make_utc_time_local time
        Time.at(time.to_i - time.utc_offset)
      end

      def number_of_decimals_in_number num
        split_number = num.to_s.split(".")
        if split_number.size == 1
          return 0
        else
          return split_number[1].length
        end
      end
    end
  end
end
