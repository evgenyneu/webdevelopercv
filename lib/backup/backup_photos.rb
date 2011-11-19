#!/usr/bin/env ruby
require File.expand_path('../backup.rb',  __FILE__)
module Dozmo  
  class BackupPhotos < Dozmo::Backup
    def backup
      log Separator
      log "Photos backup started"
      
      photos_path = File.join(public_path, "photos")     
      backup_photos_path = File.join(backup_path, "photos")

      unless File.directory?(photos_path)
        log "Photos source folder does not exist #{photos_path}", true
      end

      FileUtils.mkpath backup_photos_path unless File.directory?(backup_photos_path)
      zip_file_path = File.join(backup_photos_path, "dozmo-photos-#{to_filename(backup_filename)}.zip")  
      compress_files(photos_path, "*", zip_file_path, "0")
      encrypted_file_path = encrypt_file(zip_file_path)
      upload_file_to_amazon_s3 encrypted_file_path
      log "Finished successfully" 
    rescue => e 
      log e.message
      log "\nTrace:\n#{e.backtrace.join("\n")}", true
    end
  end
end

Dozmo::BackupPhotos.new.backup
