#!/bin/sh

#
# function mylog
# 
# $1 log text
# $2 exit status
#
mylog()
{
	echo "$(date) ${1:-missing}" 

	# exit with given status code
	if [ $# -ge "2" ]; then
		exit $2
	fi
}

remove_local_assets()
{
	rmpath="$assets_path/*"
	mylog "removing local assets in ${rmpath}"
	if ! rm -f $rmpath ; then mylog "cannot remove ${rmpath}" 0 ; fi
}
app_folder="webdevelopercv.com"
app_path_root="/home/www/${app_folder}"
mylog "app path is ${app_path_root}"

assets_path="$app_path_root/public/assets"
mylog "assets path is ${assets_path}"

if ! cd $app_path_root ; then mylog "cannot cd to ${app_path_root}" 0 ; fi

remove_local_assets

mylog "removing old assets on web server..."
ssh www@webdevelopercv.com 'bash -s' < script/remove_old_assets.sh
if [ "$?" -ne "0" ]; then
  mylog "Error removing old remote assets" 0
fi

mylog "precompiling local assets..."
rake assets:precompile:primary RAILS_ENV=production RAILS_GROUPS=assets
if [ "$?" -ne "0" ]; then
  mylog "Error precompiling assets" 0
fi

if ! cd $assets_path ; then mylog "cannot cd to ${assets_path}" 0 ; fi

mylog "copying local assets to remote web site"
sftp -b ../../script/upload_assets.sftp www@webdevelopercv.com:"${app_folder}/shared/assets"
if [ "$?" -ne "0" ]; then
  mylog "Error copying local assets to web server" 0
fi

mylog "restarting web site..."
cap deploy:restart

remove_local_assets

mylog "Assets deployed successfully"
