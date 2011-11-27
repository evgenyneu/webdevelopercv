module Backup23
  class SourceDir < Source
    def get
      Log.log "Temp dir for #{self.class} is #{task.tmp_dir}"
    end
  end
end
