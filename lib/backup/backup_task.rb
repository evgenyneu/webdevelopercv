require File.expand_path('../sources/source.rb',  __FILE__)

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
        @tmp_dir = options["tmp_dir"] 
        @tmp_dir = File.join(File.expand_path(@tmp_dir),"backup23_#{Time.now.to_i}_#{rand(1000000)}") unless @tmp_dir.nil?
        FileUtils.mkpath(@tmp_dir)
      end
      @tmp_dir = Dir.mktmpdir("backup23_") if @tmp_dir.nil?
      @tmp_dir  
    end

    def cleanup
      FileUtils.remove_entry_secure(@tmp_dir) unless @tmp_dir.nil?
      @tmp_dir = nil
    end

    def run
      @source.get
    rescue Exception => e
      Log.log "Error in '#{name}' task", e
    ensure
      cleanup
    end
  end
end
