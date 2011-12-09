module Backup23
  # 3 log levels:
  # fyi - log if verbose?
  # wtf - log always
  # omg - log and exit
  class Log
    Separator = "******************"
    class << self
      attr_accessor :log_file_path, :backup, :verbose

      def fyi(message)
        log message if verbose?
      end

      def wtf(message, exception = nil)
        log("WARNING: " + message, exception)
      end  

      def omg(message, exception = nil)
        log("FATAL ERROR: " +  message, exception)
        backup.exit
      end

      def verbose?
        verbose
      end

      def log_or_exit_on_error(message)
        fyi message.capitalize
        exit_on_error("Error: #{message}"){
          yield
        }
      end

      def exit_on_error(error_message)
        yield
      rescue Exception => e
        self.omg error_message, e
      end

      def log_or_exit_on_shell_error(message)
        log_or_exit_on_error(message){
          yield
        }
        self.omg "Error: #{message}" if $?.exitstatus != 0
      end

private
      def time_stamp
        Time.now.strftime("%Y-%m-%d %H:%M:%S")
      end

      def log(message, exception = nil)
        msg = "#{time_stamp}: #{message}" 
        msg << ": #{exception.to_s}\n#{exception.backtrace.join("\n")}" unless exception.nil?
        puts msg
        File.open(log_file_path, 'a') {|file| file.puts(msg) }
      end
    end
  end
end

