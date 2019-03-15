#!/bin/bash

#set -x
export PATH=/bin:/usr/bin


tgl=`date "+%Y-%m-%d %T"`
echo "----------------------"
echo "Start sync directory - ( ${tgl} )"

rsync -avz --remove-source-files mysql@192.168.171.18:/data/database/data_export/febrian/sitadev_iot/backup_data apps@192.168.172.19:Backend_Sita_Dev/storage/backup_data

echo "----------------------"
echo "SELESAI"
echo "----------------------"
