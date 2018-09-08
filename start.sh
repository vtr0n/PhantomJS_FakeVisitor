#!/bin/bash

os_name=$(uname)
if [[ ${os_name} != "Linux" && ${os_name} != "Darwin" ]]
then
    echo "${os_name} is not support"
    exit
fi

echo "Enter target"
read target

echo "Enter referer"
read referer

echo "Enter count of visit"
read count_visit

echo "Enter count of thread"
read count_thread

echo "Enter deep"
read deep

echo "Enter the range in seconds. Example: (5-15)"
read sleep_range

count_visit=$(echo ${count_visit} / ${count_thread} | bc)

max_sleep=$(echo ${sleep_range} | cut -d'-' -f2)
timeout=$(echo "${max_sleep}*${count_visit}*${deep}" | bc)

for i in $(seq 1 ${count_thread})
do
    if [[ ${os_name} == "Darwin" ]]
    then
	    gtimeout ${timeout} ./thread.sh ${count_visit} ${target} ${referer} ${deep} ${sleep_range} ${i} &
	else
	    timeout ${timeout} ./thread.sh ${count_visit} ${target} ${referer} ${deep} ${sleep_range} ${i} &
	fi
done
exit 0