#!/bin/bash
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
max_timeout=$(echo "${max_sleep}*${count_thread}+3" | bc)

for i in $(seq 1 ${count_thread})
do
    if [[ $(uname) -eq "Darwin" ]]
    then
	    gtimeout ${max_timeout} ./thread.sh ${count_visit} ${target} ${referer} ${deep} ${sleep_range} &
	else
	    timeout ${max_timeout} ./thread.sh ${count_visit} ${target} ${referer} ${deep} ${sleep_range} &
	fi
done
exit 0