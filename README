== Installing WDCV

1. Install WKHTMLTOPDF for PDF export on resume page

https://github.com/pdfkit/pdfkit/wiki/Installing-WKHTMLTOPDF

wget http://wkhtmltopdf.googlecode.com/files/wkhtmltopdf-0.9.9-static-i386.tar.bz2 
tar xvjf wkhtmltopdf-0.9.9-static-i386.tar.bz2
mv wkhtmltopdf-i386 /usr/local/bin/wkhtmltopdf
chmod +x /usr/local/bin/wkhtmltopdf

2. Add backup tasks to crontab

53 14 * * *  /home/www/webdevelopercv.com/current/script/cron-wrapper siba b backup/wdcv/wdcv-db.yml
51 14 * * *  /home/www/webdevelopercv.com/current/script/cron-wrapper siba b backup/wdcv/wdcv-web.yml

