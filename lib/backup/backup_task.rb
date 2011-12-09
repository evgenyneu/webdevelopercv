require File.expand_path('../sources/source.rb',  __FILE__)
require File.expand_path('../task_error.rb',  __FILE__)

module Backup23
  class BackupTask
    attr_accessor :source, :options, :backup, :name
    attr_writer :tmp_dir 

    def initialize(options, backup)
      @options = options
      @backup = backup
      @name = options["name"] || "backup23"
      @source = Source.create(self)
    end

    def tmp_dir
      if @tmp_dir.nil?
        unless options["tmp_dir"].nil?
          @tmp_dir = File.join(File.expand_path(options["tmp_dir"]),"backup23_#{Time.now.to_i}_#{rand(1000000)}")
          FileUtils.mkpath(@tmp_dir)
        end
        @tmp_dir = Dir.mktmpdir("backup23_") if @tmp_dir.nil?
      end
      @tmp_dir  
    end

    def cleanup
      #FileUtils.remove_entry_secure(@tmp_dir) unless @tmp_dir.nil?
      @tmp_dir = nil
    end

    def run
      Log.fyi "Starting backup task '#{name}'"
      @source.get
    rescue TaskError => e
      Log.wtf "Error in '#{name}' task: #{e.message}"
    rescue Exception => e
      Log.wtf "Unknown error in '#{name}' task", e
    ensure
      cleanup
    end
  end
end
