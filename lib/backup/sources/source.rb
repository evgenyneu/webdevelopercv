module Backup23
  class Source
    attr_accessor :task, :options, :type

    def self.create(task)
      @type = task.options["source"]
      path_to_source_file = File.expand_path("../source_#{@type}.rb",  __FILE__)
      unless File.exists?(path_to_source_file)
        types = Dir.glob(File.join(File.dirname(__FILE__),"source_*.rb")).map{|file|
          File.basename(file)[/^source_(.*).rb$/,1]
        }.join(", ")
        Log.omg "Unknown source type '#{@type}'. Installed source types: #{types}"
      end
      require path_to_source_file
      source_class_name = "Source#{@type.capitalize}"
      Log.omg "Source class '#{source_class_name}' is undefined" unless Backup23.const_defined? source_class_name
      sourceObj = Backup23.const_get(source_class_name).new(@type, task)
      Log.omg "Source class '#{source_class_name}' must inherit Source" unless sourceObj.is_a? Source
      sourceObj
    end

    def initialize(type, task)
      @type = type
      @task = task
      @options = @task.options.get_deep_new @type
    end
  end
end
