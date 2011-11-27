module Backup23
  class Log
    Separator = "******************"
    class << self
      attr_accessor :log_file_path, :backup

      def log(message, exception = nil)
        msg = "#{time_stamp}: #{message}" 
        msg << ": #{exception.to_s}\n#{exception.backtrace.join("\n")}" unless exception.nil?
        puts msg
        File.open(log_file_path, 'a') {|file| file.puts(msg) }
      end  

      def exit(message, exception = nil)
        log("!!!Terminating!!! " +  message, exception)
        backup.exit
      end

      def time_stamp
        Time.now.strftime("%Y-%m-%d %H:%M:%S")
      end

      def log_or_exit_on_error(message)
        log message.capitalize
        exit_on_error("Error: #{message}"){
          yield
        }
      end

      def exit_on_error(error_message)
        yield
      rescue Exception => e
        self.exit error_message, e
      end

      def log_or_exit_on_shell_error(message)
        log_or_exit_on_error(message){
          yield
        }
        self.exit "Error: #{message}" if $?.exitstatus != 0
      end
    end
  end
end

