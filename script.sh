#!/bin/bash
# echo "Date Namelookup Redirect Connect_Total Start_Transfer Total_Time Response_Code" >> by-dns.out
# echo "Date Namelookup Redirect Connect_Total Start_Transfer Total_Time Response_Code" >> by-ip.out
for i in {1..100000}; do
  echo `date +%s && echo " " && curl -4 -L -o /dev/null -s -w "%{time_namelookup} %{time_redirect} %{time_connect} %{time_starttransfer} %{time_total} %{http_code}" http://www.meraki.com/ --no-keepalive --no-sessionid` >> by-dns.out
  echo `date +%s && echo " " && curl -4 -H'Host: www.meraki.com' -L -o /dev/null -s -w "%{time_namelookup} %{time_redirect} %{time_connect} %{time_starttransfer} %{time_total} %{http_code}" 64.156.192.181 --no-keepalive --no-sessionid` >> by-ip.out
  sleep 5
done
