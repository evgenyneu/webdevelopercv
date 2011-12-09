module Backup23
  module OptionsLoader
    attr_accessor :task_options, :default_options

    def load_options
      options_file_name = "backup23.yml"
      options_file_path = File.expand_path("../#{options_file_name}", __FILE__)
      Log.omg "Can not find #{options_file_name} file" unless File.exists?(options_file_path)
      options_hash = {}
      Log.exit_on_error("Error parsing options file #{options_file_path}"){
        options_hash = YAML.load(ERB.new(File.read(options_file_path)).result)
      }
      if options_hash.nil? || !options_hash.is_a?(Hash) || options_hash.keys.empty?
        Log.omg "Options file is empty #{options_file_path}"
      end
     
      load_default_options options_hash
      load_task_options options_hash
    end

private

    def load_default_options(options_hash)
      defaults_hash = options_hash["default_options"]
      if defaults_hash.nil? || !defaults_hash.is_a?(Hash) || defaults_hash.empty?
        Log.omg "Missing 'default_options' configuration section"
      end
      @default_options = Options.new(defaults_hash)
    end

    def load_task_options(options_hash)
      tasks_array = options_hash["tasks"] 
      if tasks_array.nil? || !tasks_array.is_a?(Array) || tasks_array.empty?
        Log.omg "There are no backup tasks in configuration file" 
      end
      @task_options = [] 
      tasks_array.each{|task_data|
        @task_options << Options.new(task_data, @default_options)
      }
    end
  end
end
