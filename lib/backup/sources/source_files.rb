module Backup23
  class SourceFiles < Source
    attr_accessor :exclude_files

    def initialize(task)
      super
      @exclude_files = task.options["exclude_files"]
      unless @exclude_files.nil?
        Raise TaskError, "'exclude_files' options should be Array" unless @exclude_files.is_a? Array

        @exclude_files.delete_if {|item| item.strip == ""}
        if @exclude_files.empty?
          @exclude_files = nil
        end

        unless @exclude_files.nil?
          @exclude_files.map! do |exclude|
            exclude.strip!
            exclude[0] = '' if exclude[0] == "/"
            exclude = "**/" + exclude
            exclude[-1] = '*' if exclude[-1] == '/'
            exclude
          end
        end
      end
    end

    def get
      Log.fyi "Copying source files to temporary folder #{task.tmp_dir}"
      files = task.options["files"]
      raise TaskError, "'files' option is not defined" if files.nil?
      raise TaskError, "'files' option should contain array" unless files.is_a? Array
      raise TaskError, "'files' option is empty" if files.empty?

      files.each do |file|
        file = File.expand_path file
        if File.file? file
          copy_file file, task.tmp_dir, true
        elsif File.directory? file
          copy_dir file, task.tmp_dir, true
        elsif
          Log.wtf "Source file not found #{file}"
        end
      end
    end

    def included?(file, is_dir = false)
      return true if exclude_files.nil?
      include_file = true 
      exclude_files.each do |exclude|
        if exclude.casecmp(File.basename(file)) == 0 || File.fnmatch(exclude, file, File::FNM_CASEFOLD)
          include_file = false
          break
        end 
      end

      Log.fyi "Ignoring #{is_dir ? "directory":"file"} #{file}" unless include_file
      include_file 
    end

    def copy_file(file, dest_dir, log)
      Log.fyi "Copying file #{file} to #{dest_dir}" if log
      FileUtils.cp(file, dest_dir) if included?(file) 
    end

    def copy_dir(dir, dest_dir, top_dir)
      return unless included? dir, true
      Log.fyi "Copying directory #{dir} to #{dest_dir}" if top_dir
      dest_dir = File.join(dest_dir, File.basename(dir))
      Dir.mkdir(dest_dir) unless Dir.exist?(dest_dir)
      Dir.foreach(dir) do |entry|
        next if entry == '.' or entry == '..'
        entry = File.join dir, entry
        if File.file? entry
           copy_file entry, dest_dir, false 
        elsif File.directory? entry
           copy_dir entry, dest_dir, false
        end
      end 
    end
  end
end
