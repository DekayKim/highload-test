# 메이헴 서버 부하 테스트 툴
## 요약
- 메이헴의 유산 서버 부하 테스트를 위한 간이 툴

## 목표 설정값
- 동시접속자 대비 DAU: 최소 5%, 최대 10%
- 메이헴 혼잡 기준: 동시접속자 1000 user

## 기록
### 참고 명령어
- mpstat 1

### 최초 확인
50 user : 30s AVG 550 call / CPU 25~30% / Total 4699 call / elapsedTime 500~770ms
100 user : 30s AVG 700 call / CPU 30~35% / Total 9399 call / elapsedTime 2200~2580ms 

### 최초 분석
[동시접속자 50명]
- 총 요청수: 4700 
- CPU 사용량: 25~30%
- 요청 평균 지연: 500~700ms

[동시접속자 100명]
- 총 요청수: 9400 
- CPU 사용량: 30~35%
- 요청 평균 지연: 2200~2500ms

[테스트 결과 분석 및 개선사항]
- CPU 점유율의 대부분은 DB 처리
- 요청수가 증가하는 만큼 CPU 사용량이 늘지 않고 있음
- apache 성능 개선을 통해 한번에 처리 가능한 요청 수를 늘려야 함

### 최적화 후: mysql, httpd
50 user : 30s AVG 550 call / CPU 25~30% / Total 4699 call / elapsedTime 500~620ms
100 user : 30s AVG 700 call / CPU 30~35% / Total 9399 call / elapsedTime 1400~1570ms

### nginx 설정 후
50 user : 30s AVG 600 call / CPU 25~35% / Total 4699 call / elapsedTime 500~620ms
100 user : 30s AVG 800 call / CPU 30~55% / Total 9399 call / elapsedTime 1200~1410ms

### 쿼리 개선 후(dungeon_end)
50 user : 30s AVG 600 call / CPU AVG 30% / Total 4699 call / elapsedTime 360ms
100 user : 30s AVG 1000 call / CPU AVG 40%, peak 90% / Total 9399 call / elapsedTime 320~400ms

### rus (httpd)
50 user : Call in 30s AVG 530, Total 4699 / CPU AVG 43%, peak 67% / elapsedTime 143ms
100 user : Call in 30s AVG 1000 call, Total 9399 / CPU AVG 70%, peak 85% / elapsedTime 282ms
150 user : Call in 30s AVG 1000 call, Total 9399 / CPU AVG 83%, peak 86% / elapsedTime 282ms

### nginx 최적화
- [기반 설정 참고](https://www.burndogfather.com/190)
- [pm.xx 설정 참고](http://blog.naver.com/PostView.nhn?blogId=parkjy76&logNo=30129721591)
### mysqld 최적화
- [참고URL](https://m.blog.naver.com/PostView.nhn?blogId=jevida&logNo=221249096145&proxyReferer=https%3A%2F%2Fwww.google.com%2F)
- [core 수가 많아도 한계 존재](https://dba.stackexchange.com/questions/142416/mysql-to-use-all-cores-20-cores-i-have)
- 체크 SQL: `show status where variable_name in ( 'max_used_connections', 'aborted_clients', 'aborted_connects', 'threads_connected', 'connections' );`
- 이미 충분함. 추후 늘릴 가능성 있음: Max_connections = 151
### php-fpm 최적화
- 체크 명령어: tail -f /var/log/php-fpm/www-slow.log
- www-slow 옵션 위치: /etc/php-fpm.d/www.conf

### fpm 최적화
```
max_children = 2048
rlimit_files = 102400
```




```
# 메이헴 로그 비우기
truncate actor_data;
truncate bug_report;
truncate artifact_data;
truncate shop_data;
truncate clear_data;
truncate collection_data;
truncate log_data;
truncate post_data;
truncate pub_data;
truncate quest_data;
truncate team_data;
truncate user_data;
truncate user_ad_data;


# 메이헴 csv LOAD DATA 쿼리
LOAD DATA INFILE '/var/log/user_data.csv' INTO TABLE user_data
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(no, id, pass, lpw, name, email, gemail, gold, gem, diary, powder, honor, mileage, pvp_ticket, roulette, daily_ticket, daily_date, daily_reward, lang, team_no, pvp_team_no, pvp_score, pvp_level, infinite, infinite_level, level, nation_no, class, house_cap, arsenal_cap, food, food_cap, food_time, actor_summon_time, artifact_summon_time, food_buy_time, gold_buy_time, roulette_ad_time, cinematic, join_date, login_date, logout_date, boost, fast, auto_drop, fcm_token, push, env, type, uid, user_name, ban, shutdown, @vkicktime)
SET
gemail = null,
fcm_token = null,
type = null,
kicktime = null;

LOAD DATA INFILE '/var/log/team_data.csv' INTO TABLE team_data
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(no, user_no, name);

LOAD DATA INFILE '/var/log/log_data5.csv' INTO TABLE log_data
FIELDS OPTIONALLY ENCLOSED BY '"' TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(no, user_no, code, type, input, output, data, ip)
SET
log_date = CURRENT_TIMESTAMP;
```
