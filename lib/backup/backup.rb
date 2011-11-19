require 'fileutils'
require 'aws/s3'
require 'yaml'
require 'erb'
include FileUtils

module Dozmo    
  class Backup
    attr_reader :app_path, :public_path, :shared_path, :backup_path, :log_file_path
    attr_accessor :config

    EncryptionPassphraseConfigName = 'encryption_passphrase'
    AWS_S3_ConfigName = "aws_s3"
    AWS_S3_BucketConfigName = "bucket"
    AWS_S3_AccessKeyIDConfigName = "access_key_id"
    AWS_S3_SecretKeyIDConfigName = "secret_access_key"

    Separator = "******************"
    
    def initialize
      @app_path = File.expand_path('../../../', __FILE__)
      @log_file_path = File.join(@app_path, "log", "backup.log")      
      @public_path = File.join(app_path, "public")
      @shared_path = File.join(app_path, 'shared')
      @backup_path = File.join(shared_path, "backup")
      @tmp_path = File.join(app_path, "tmp")

      config_file_name = "23backups.yml"
      config_file_path = File.expand_path("../#{config_file_name}", __FILE__)
      config_file_path = File.join(@app_path, "config", config_file_name) unless File.exists?(config_file_path)
      log "Can not find #{config_file_name} file", true unless File.exists?(config_file_path)
      exit_on_error("Error parsing config file #{config_file_path}"){
        self.config = YAML.load(ERB.new(File.read(config_file_path)).result)
      }
      log "Error loading config file #{config_file_path}", true if config.nil?
    end
    
    def time_stamp
      Time.now.strftime("%Y-%m-%d %H:%M:%S")
    end

    def backup_filename
      return "month #{"%02d" % Time.now.month}" if Time.now.day == 1
      return "week #{(Time.now.day-1) / 7 + 1} sun" if Time.now.wday == 0 # sunday
      return "day #{Time.now.wday+1} #{Time.now.strftime("%a").downcase}"  
    end

    def to_filename(str)
      str.gsub(/[^ a-zA-Z0-9.]/,'-').strip.gsub(/ /,'-')
    end

    def get_config_setting(setting_name, settings = config)
      log "Missing #{setting_name} configuration setting", true if settings[setting_name].nil? 
      settings[setting_name]
    end

    def log(message, exit_script = false)   
      msg = "#{time_stamp}: #{message}" + (exit_script ? " !!!Terminating!!!" : "")
      puts msg
      File.open(log_file_path, 'a') {|file| file.puts(msg) }
      exit if exit_script
    end  

    def compress_files(archive_file_path, source_folder, what_to_archive, 
                       tar_options='czf', archive_extension=".tar.gz")
      archive_file_path += archive_extension
      if File.exists?(archive_file_path) 
        log_or_exit_on_error("deleting archive #{archive_file_path}"){
          File.delete(archive_file_path) 
        }
      end
      
      log_or_exit_on_error("chdir to #{source_folder}"){
        cd(source_folder)
      }

      log_or_exit_on_shell_error("Archiving #{File.join(source_folder,what_to_archive)} to #{archive_file_path}"){
        `tar #{tar_options} '#{archive_file_path}' #{what_to_archive}`
      }
      return archive_file_path
    end

    def log_or_exit_on_error(message)
      log message.capitalize
      exit_on_error("Error: #{message}"){
        yield
      }
    end

    def exit_on_error(error_message)
      yield
    rescue
      log error_message, true 
    end

    def log_or_exit_on_shell_error(message)
      log_or_exit_on_error(message){
        yield
      }
      log "Error: #{message}", true if $?.exitstatus != 0
    end

    def encrypt_file(file_path, dest_folder)
      encryption_passphrase = get_config_setting(EncryptionPassphraseConfigName)
      encrypted_file_path = "#{file_path}.gpg"

      log_or_exit_on_error("deleting old enrypted file #{encrypted_file_path}"){
        File.delete(encrypted_file_path) 
      } if File.exists?(encrypted_file_path) 

      log_or_exit_on_error("chdir to #{dest_folder}"){
        cd(dest_folder)
      }

      log_or_exit_on_shell_error("encrypting backup to #{encrypted_file_path}") {
        `echo "#{encryption_passphrase}" | gpg -q -c --batch --cipher-algo=aes256 --passphrase-fd=0 "#{file_path}"`
      }

      log_or_exit_on_error("encrypted, Deleting source file #{file_path}"){
        File.delete file_path
      }
      return encrypted_file_path
    end

    def upload_file_to_amazon_s3(path_to_file, file_name = nil)
      s3_settings = get_config_setting AWS_S3_ConfigName 
      amazon_s3_bucket = get_config_setting AWS_S3_BucketConfigName, s3_settings 
      access_key_id = get_config_setting AWS_S3_AccessKeyIDConfigName, s3_settings
      secret_key = get_config_setting AWS_S3_SecretKeyIDConfigName, s3_settings

      log "File #{path_to_file} does not exist", true unless File.file?(path_to_file) 

      file_name = File.basename(path_to_file) if file_name.nil?
      log "Uploading '#{file_name}' to Amazon S3 '#{amazon_s3_bucket}'..."

      AWS::S3::Base.establish_connection!(
        :access_key_id => access_key_id,
        :secret_access_key => secret_key);

      AWS::S3::S3Object.store(file_name, open(path_to_file), amazon_s3_bucket)
    end
  end
end
