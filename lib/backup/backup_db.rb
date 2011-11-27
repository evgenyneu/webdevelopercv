require File.expand_path('../backup.rb',  __FILE__)
module Backup23  
  class BackupDb < Backup23::Backup
    def backup
      log Separator
      log "DB backup started"
      
      mongo_db_name='wdcv_development'
      tmp_db_dump_path = File.join(tmp_path, "mongo_dump")
      remove_tmp_dump_folder tmp_db_dump_path
      
      log_or_exit_on_shell_error("dumping MongoDB database '#{mongo_db_name}' to #{tmp_db_dump_path} ...") {
        `mongodump -d #{mongo_db_name} -o "#{tmp_db_dump_path}"`
      }
      log "Error dumping monogoDB", true unless Dir.exists? tmp_db_dump_path
      
      this_backup_path = File.join(backup_path, "db")
      FileUtils.mkpath this_backup_path unless File.directory?(this_backup_path)

      path_to_archive_no_extension = File.join(this_backup_path, "db-#{to_filename(backup_filename)}")
      path_to_archive = compress_files(path_to_archive_no_extension, tmp_db_dump_path, "*")

      remove_tmp_dump_folder tmp_db_dump_path

      encrypted_file_path = encrypt_file(path_to_archive,this_backup_path)
      #upload_file_to_amazon_s3 encrypted_file_path
      log "Finished successfully" 
    rescue => e 
      log e.message
      log "\nTrace:\n#{e.backtrace.join("\n")}", true
    end

    def remove_tmp_dump_folder(tmp_db_dump_path)
        log_or_exit_on_error("removing temporary dump folder #{tmp_db_dump_path}") { 
          FileUtils.remove_dir(tmp_db_dump_path)
        } if Dir.exists? tmp_db_dump_path
    end
  end
end
