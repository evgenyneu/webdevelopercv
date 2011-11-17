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

app_path_root="/home/www/webdevelopercv.com"
assets_path="$app_path_root/shared/assets"

if ! cd $assets_path ; then mylog "cannot cd to ${assets_path}" 0 ; fi

mylog "removing old assets from ${assets_path}"

find . -mtime +60 -type f -exec rm {} \;
if [ "$?" -ne "0" ]; then
  mylog "Error removing old assets" 0
fi

mylog "old assets removed successfully"
