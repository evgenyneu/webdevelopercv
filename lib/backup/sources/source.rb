module Backup23
  class Source
    attr_accessor :task

    def self.create(task)
      source_type = task.options["source"]
      path_to_source_file = File.expand_path("../source_#{source_type}.rb",  __FILE__)
      Log.exit "No source file found #{path_to_source_file}" unless File.exists?(path_to_source_file)
      require path_to_source_file
      source_class_name = "Source#{source_type.capitalize}"
      Log.exit "Source class '#{source_class_name}' is undefined " unless Backup23.const_defined? source_class_name
      sourceObj = Backup23.const_get(source_class_name).new(task)
      Log.exit "Source class '#{source_class_name}' must inherit Source" unless sourceObj.is_a? Source
      sourceObj
    end

    def initialize(task)
      @task = task
    end
  end
end
