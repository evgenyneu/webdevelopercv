#!/usr/bin/env ruby
backup_db_script = File.expand_path('../backup_db.rb', __FILE__)
backup_photos_script = File.expand_path('../backup_photos.rb', __FILE__)
require backup_db_script
require backup_photos_script
