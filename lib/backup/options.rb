module Backup23
  class Options
    attr_accessor :data, :default_options

    def initialize(option_data, default_options = nil)
      @data = option_data 
      @default_options = default_options
    end

    def get_deep_new(key)
      Options.new(self[key], @default_options.nil? ? nil : @default_options[key])
    end

    def [](keys)
      value = Options.hash_deep_get(@data, keys)
      value = @default_options[keys] if value.nil? && !@default_options.nil? 
      value
    end

    def self.hash_deep_get(hash, keys)
      return nil unless hash.is_a? Hash
      value = hash
      keys.split('.').each{|key|
        return nil unless value.is_a?(Hash) || value.is_a?(Array)
        if value.is_a?(Array)
          value = value.find{|item| item.is_a?(Hash) && !item[key].nil? }
          return nil unless value.is_a?(Hash)
        end
        value = value[key]
      }
      value
    end
  end
end
