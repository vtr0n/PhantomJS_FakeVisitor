#!/bin/bash
count_visit=$1
target=$2
referer=$3
deep=$4
sleep_range=$5

for i in $(seq 1 ${count_visit})
do
    if [[ $(uname) == "Darwin"  ]]
    then
        proxy=$(gshuf -n 1 files/proxy.txt)
        ua=$(gshuf -n 1 files/user-agent.txt | base64)
        resolution=$(gshuf -n 1 files/resolution.txt)
        cookie=$(ls files/cookies | gshuf -n 1)
    else
        proxy=$(shuf -n 1 files/proxy.txt)
        ua=$(shuf -n 1 files/user-agent.txt | base64 -w 0)
        resolution=$(shuf -n 1 files/resolution.txt)
        cookie=$(ls files/cookies | shuf -n 1)
    fi
	#--proxy=$proxy --cookies-path=$cookie
	phantomjs --ignore-ssl-errors=true --web-security=false --proxy=$proxy --cookies-file=files/cookies/$cookie \
	new_visitor.js $target $referer $ua $deep $resolution $sleep_range
done
exit 0