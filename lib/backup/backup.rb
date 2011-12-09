require 'fileutils'
#require 'aws/s3'
require 'yaml'
require 'erb'
require 'tmpdir'
require File.expand_path('../log.rb',  __FILE__)
require File.expand_path('../options.rb',  __FILE__)
require File.expand_path('../options_loader.rb',  __FILE__)
require File.expand_path('../backup_task.rb',  __FILE__)
include FileUtils

module Backup23
  class Backup
    include OptionsLoader
    attr_accessor :app_path, :tasks
    
    def initialize
      @app_path = File.expand_path('../../../', __FILE__)
      Log.verbose = true
      Log.log_file_path = File.join(app_path,"log","backup23.log")
      Log.backup = self
      load_options
      @tasks = @task_options.map {|task_options| BackupTask.new(task_options, self)}
      run_all_tasks
    end

    def exit
      cleanup
      Kernel.exit
    end

    def cleanup
      unless tasks.nil?
        tasks.each{|task| task.cleanup}
      end
    end

    def run_all_tasks
      tasks.each{|task|
        task.run
      }
    ensure
      cleanup
    end
    
    def backup_filename
      return "month #{"%02d" % Time.now.month}" if Time.now.day == 1
      return "week #{(Time.now.day-1) / 7 + 1} sun" if Time.now.wday == 0 # sunday
      return "day #{Time.now.wday+1} #{Time.now.strftime("%a").downcase}"  
    end

    def to_filename(str)
      str.gsub(/[^ a-zA-Z0-9.]/,'-').strip.gsub(/ /,'-')
    end

    def compress_files(archive_file_path, source_folder, what_to_archive, 
                       tar_options='czf', archive_extension=".tar.gz")
      archive_file_path += archive_extension
      if File.exists?(archive_file_path) 
        Log.log_or_exit_on_error("deleting archive #{archive_file_path}"){
          File.delete(archive_file_path) 
        }
      end
      
      Log.log_or_exit_on_error("chdir to #{source_folder}"){
        cd(source_folder)
      }

      Log.log_or_exit_on_shell_error("Archiving #{File.join(source_folder,what_to_archive)} to #{archive_file_path}"){
        `tar #{tar_options} '#{archive_file_path}' #{what_to_archive}`
      }
      return archive_file_path
    end

    def encrypt_file(file_path, dest_folder)
      encryption_passphrase = get_config_setting(EncryptionPassphraseConfigName)
      encrypted_file_path = "#{file_path}.gpg"

      Log.log_or_exit_on_error("deleting old enrypted file #{encrypted_file_path}"){
        File.delete(encrypted_file_path) 
      } if File.exists?(encrypted_file_path) 

      Log.log_or_exit_on_error("chdir to #{dest_folder}"){
        cd(dest_folder)
      }

      Log.log_or_exit_on_shell_error("encrypting backup to #{encrypted_file_path}") {
        `echo "#{encryption_passphrase}" | gpg -q -c --batch --cipher-algo=aes256 --passphrase-fd=0 "#{file_path}"`
      }

      Log.log_or_exit_on_error("encrypted, Deleting source file #{file_path}"){
        File.delete file_path
      }
      return encrypted_file_path
    end

    def upload_file_to_amazon_s3(path_to_file, file_name = nil)
      s3_settings = get_config_setting AWS_S3_ConfigName 
      amazon_s3_bucket = get_config_setting AWS_S3_BucketConfigName, s3_settings 
      access_key_id = get_config_setting AWS_S3_AccessKeyIDConfigName, s3_settings
      secret_key = get_config_setting AWS_S3_SecretKeyIDConfigName, s3_settings

      Log.exit "File #{path_to_file} does not exist" unless File.file?(path_to_file) 

      file_name = File.basename(path_to_file) if file_name.nil?
      Log.log "Uploading '#{file_name}' to Amazon S3 '#{amazon_s3_bucket}'..."

      AWS::S3::Base.establish_connection!(
        :access_key_id => access_key_id,
        :secret_access_key => secret_key);

      AWS::S3::S3Object.store(file_name, open(path_to_file), amazon_s3_bucket)
    end
  end
end
