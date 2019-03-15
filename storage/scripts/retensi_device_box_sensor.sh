#!/bin/bash

#set -x
export PATH=/bin:/usr/bin

# modify the following to suit your environment
# !Vascomm Dev
export DB_HOST="192.168.171.18"
export DB_USER="febrian"
export DB_PASS="DEVp4ssDBf3I3rlAn"
export DB_NAME="sitadev_iot"
# !Local Dev
# export DB_HOST="localhost"
# export DB_USER="root"
# export DB_PASS=""
# export DB_NAME="sitadev_iot"


# usage()
# {
#   echo -e "Usage: ./sitadev_iot.sh [-d] [-t]"
#   echo -e "-h   HELP        Display this help and exit"
#   echo -e "-d   DAY  		Execution Day yyyymmdd"
#   echo -e "-t   TIME  		Execution Time HHii"
# }
# 
# while getopts "d:t:h" option
# do
#  case "${option}"
#  in
#  d) execution_day=${OPTARG};;
#  t) execution_time=${OPTARG};;
#  h)
#     usage;
#     exit 0
#     ;;
#  :) echo -e "Missing option argument for -$OPTARG"
#     exit 1;;
#  *) echo -e "Unimplemented option: -$OPTARG"
#     exit 1;;
#  esac
# done

execution_day=`date "+%Y%m%d"`
execution_time=`date "+%H%M"`
deleted_time=`date "+%Y-%m-%d %H:%M"`

file_name="device_box_sensor_${execution_day}${execution_time}.csv"
# Vascomm Dev
path_file="/home/apps/Backend_Sita_Dev/storage/backup_data/${execution_day}"
# Local Dev
# path_file="/mnt/d/Projects/sitamoto_core/storage/backup_data/${execution_day}"


tgl=`date "+%Y-%m-%d %T"`
echo "----------------------"
echo " 1. Start Export ( ${execution_day} )"
		
		
if [ ! -d ${path_file} ] 
then
	mkdir -p ${path_file}
fi


target_data=$(mysql -h $DB_HOST -u $DB_USER --password=$DB_PASS --skip-column-names -e "SELECT COUNT(id) FROM sitadev_iot.device_box_sensor WHERE DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') < \"${deleted_time}\";")

if [ ${target_data} -gt 0 ]
then
		
	mysql -h $DB_HOST -u $DB_USER --password=$DB_PASS -e "SELECT * INTO OUTFILE \"${path_file}/${file_name}\"
	FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"'
	LINES TERMINATED BY '\n'
	FROM sitadev_iot.device_box_sensor;"
	
	
	total_insert=`wc -l ${path_file}/${file_name} | awk '{print $1+0}'` 
total_insert=`wc -l ${path_file}/${file_name} | awk '{print $1+0}'` 
	total_insert=`wc -l ${path_file}/${file_name} | awk '{print $1+0}'` 
total_insert=`wc -l ${path_file}/${file_name} | awk '{print $1+0}'` 
	total_insert=`wc -l ${path_file}/${file_name} | awk '{print $1+0}'` 
	echo -e "\t----------------------"
	echo -e "\tTotal Record = ${total_insert}"
	echo -e "\t----------------------"
		
		
	tgl=`date "+%Y-%m-%d %T"`
	echo "----------------------"
	echo " 2. Proses delete table device_box_sensor ( ${deleted_time} )"
			
	mysql -h $DB_HOST -u $DB_USER --password=$DB_PASS -e "DELETE FROM sitadev_iot.device_box_sensor WHERE DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') < \"${deleted_time}\";"
			
	echo -e "\t----------------------"
	echo -e "\t * Export File : ${file_name} - Selesai"

fi

echo "----------------------"
echo "SELESAI"
echo "----------------------"
