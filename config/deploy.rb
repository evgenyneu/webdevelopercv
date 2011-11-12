set :use_sudo, false
default_run_options[:pty] = true
set :keep_releases, 5

set :user, "www"
set :application, "wdcv"
set :domain, 'morekot.ru'

ssh_options[:forward_agent] = true

set :scm, 'git'
set :repository,  "ssh://www@morekot.ru/~/git/wdcv.git"
set :branch, "master"
set :git_shallow_clone, 1

# deploy config
set :deploy_to, "/home/www/webdevelopercv.com"

role :web, domain                          # Your HTTP server, Apache/etc
role :app, domain                         # This may be the same as your `Web` server
role :db,  domain, :primary => true # This is where Rails migrations will run
role :db,  domain

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "touch #{File.join(current_path,'tmp','restart.txt')}"
  end

  desc "Create symlinks"
  task :generate_symlinks do
    run %Q{mkdir -p #{release_path}/public/assets && ln -s #{shared_path}/assets #{release_path}/public/assets}
  end
end

namespace :rake do  
  desc "Run a task on a remote server."  
  # run like: cap rake:invoke task=a_certain_task  
  task :invoke do  
    run("cd #{deploy_to}/current; /usr/bin/env rake #{ENV['task']} RAILS_ENV=production")  
  end  
end

after "deploy:update", "deploy:cleanup"
after 'deploy:symlink', 'deploy:generate_symlinks'
