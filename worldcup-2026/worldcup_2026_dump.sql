PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_code TEXT NOT NULL,           -- 比赛编号 如 "005"
    home_team TEXT NOT NULL,             -- 主队
    away_team TEXT NOT NULL,             -- 客队
    group_name TEXT,                     -- 小组 B组/C组等
    match_time TEXT,                     -- 比赛时间
    venue TEXT,                          -- 比赛场地
    -- 市场概率数据
    home_win_prob REAL,                  -- 主胜概率
    draw_prob REAL,                      -- 平局概率
    away_win_prob REAL,                  -- 客胜概率
    total_goals_line REAL,               -- 大小球盘口
    -- 基本面
    home_rank INTEGER,                   -- 主队FIFA排名
    away_rank INTEGER,                   -- 客队FIFA排名
    home_value_million_eur REAL,         -- 主队身价(百万欧)
    away_value_million_eur REAL,         -- 客队身价(百万欧)
    -- 我的预测
    my_prediction_home INTEGER,          -- 我预测主队进球
    my_prediction_away INTEGER,          -- 我预测客队进球
    confidence INTEGER,                  -- 信心 1-5星
    notes TEXT,                          -- 备注
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO matches VALUES(5,'A01','墨西哥','南非','A组','2026-06-12 03:00','墨西哥城',71.999999999999999998,17.999999999999999999,10.0,2.5,15,59,350.0,45.0,2,0,4,'已踢 2-0','2026-06-13 08:34:14');
INSERT INTO matches VALUES(6,'A02','韩国','捷克','A组','2026-06-12 22:00','瓜达拉哈拉',51.999999999999999998,24.0,24.0,2.5,23,36,279.99999999999999999,220.0,2,1,3,'已踢 2-1','2026-06-13 08:34:14');
INSERT INTO matches VALUES(7,'A03','墨西哥','捷克','A组','2026-06-17 02:00','墨西哥城',NULL,NULL,NULL,2.5,15,36,350.0,220.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(8,'A04','韩国','南非','A组','2026-06-17 06:00','瓜达拉哈拉',NULL,NULL,NULL,2.5,23,59,279.99999999999999999,45.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(9,'A05','南非','捷克','A组','2026-06-21 04:00','墨西哥城',NULL,NULL,NULL,2.5,59,36,45.0,220.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(10,'A06','墨西哥','韩国','A组','2026-06-21 04:00','瓜达拉哈拉',NULL,NULL,NULL,2.5,15,23,350.0,279.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(11,'B01','加拿大','波黑','B组','2026-06-13 03:00','多伦多',NULL,NULL,NULL,2.5,24,74,179.99999999999999999,129.99999999999999999,NULL,NULL,NULL,'已踢 1-1','2026-06-13 08:34:14');
INSERT INTO matches VALUES(12,'B02','卡塔尔','瑞士','B组','2026-06-14 03:00','旧金山',6.2999999999999998223,14.30000000000000071,80.0,2.5,56,19,20.0,3299.9999999999999999,0,2,4,'瑞士碾压','2026-06-13 08:34:14');
INSERT INTO matches VALUES(13,'B03','加拿大','卡塔尔','B组','2026-06-18 20:00','多伦多',NULL,NULL,NULL,2.5,24,56,179.99999999999999999,20.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(14,'B04','瑞士','波黑','B组','2026-06-18 23:00','旧金山',NULL,NULL,NULL,2.5,19,74,3299.9999999999999999,129.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(15,'B05','波黑','卡塔尔','B组','2026-06-23 04:00','多伦多',NULL,NULL,NULL,2.5,74,56,129.99999999999999999,20.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(16,'B06','瑞士','加拿大','B组','2026-06-23 04:00','旧金山',NULL,NULL,NULL,2.5,19,24,3299.9999999999999999,179.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(17,'C01','巴西','摩洛哥','C组','2026-06-14 06:00','纽约新泽西',58.799999999999997156,25.600000000000001421,16.699999999999999289,2.5,6,7,1000.0,4980.0,2,1,3,'巴西优势','2026-06-13 08:34:14');
INSERT INTO matches VALUES(18,'C02','海地','苏格兰','C组','2026-06-14 09:00','波士顿',16.699999999999999289,22.699999999999999288,61.700000000000002841,2.5,83,42,60.0,2000.0,0,2,4,'苏格兰稳','2026-06-13 08:34:14');
INSERT INTO matches VALUES(19,'C03','巴西','海地','C组','2026-06-19 01:30','纽约新泽西',NULL,NULL,NULL,2.5,6,83,1000.0,60.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(20,'C04','苏格兰','摩洛哥','C组','2026-06-19 23:00','波士顿',NULL,NULL,NULL,2.5,42,7,2000.0,4980.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(21,'C05','摩洛哥','海地','C组','2026-06-23 23:00','纽约新泽西',NULL,NULL,NULL,2.5,7,83,4980.0,60.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(22,'C06','苏格兰','巴西','C组','2026-06-23 23:00','波士顿',NULL,NULL,NULL,2.5,42,6,2000.0,1000.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(23,'D01','美国','巴拉圭','D组','2026-06-13 09:00','洛杉矶',NULL,NULL,NULL,2.5,14,55,600.0,90.0,NULL,NULL,NULL,'已踢 4-1','2026-06-13 08:34:14');
INSERT INTO matches VALUES(24,'D02','澳大利亚','土耳其','D组','2026-06-14 12:00','温哥华',18.199999999999999289,25.600000000000001421,57.100000000000001422,2.5,27,22,736.99999999999999998,4750.0,0,1,3,'土耳其中场强','2026-06-13 08:34:14');
INSERT INTO matches VALUES(25,'D03','美国','澳大利亚','D组','2026-06-19 20:00','洛杉矶',NULL,NULL,NULL,2.5,14,27,600.0,736.99999999999999998,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(26,'D04','土耳其','巴拉圭','D组','2026-06-19 04:00','温哥华',NULL,NULL,NULL,2.5,22,55,4750.0,90.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(27,'D05','巴拉圭','澳大利亚','D组','2026-06-25 03:00','洛杉矶',NULL,NULL,NULL,2.5,55,27,90.0,736.99999999999999998,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(28,'D06','土耳其','美国','D组','2026-06-25 03:00','温哥华',NULL,NULL,NULL,2.5,22,14,4750.0,600.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(29,'E01','德国','库拉索','E组','2026-06-15 18:00','休斯顿',NULL,NULL,NULL,2.5,9,89,950.0,8.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(30,'E02','科特迪瓦','厄瓜多尔','E组','2026-06-15 00:00','费城',NULL,NULL,NULL,2.5,37,30,350.0,279.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(31,'E03','德国','厄瓜多尔','E组','2026-06-19 21:00','休斯顿',NULL,NULL,NULL,2.5,9,30,950.0,279.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(32,'E04','库拉索','科特迪瓦','E组','2026-06-20 21:00','费城',NULL,NULL,NULL,2.5,89,37,8.0,350.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(33,'E05','厄瓜多尔','库拉索','E组','2026-06-24 01:00','休斯顿',NULL,NULL,NULL,2.5,30,89,279.99999999999999999,8.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(34,'E06','德国','科特迪瓦','E组','2026-06-24 01:00','费城',NULL,NULL,NULL,2.5,9,37,950.0,350.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(35,'F01','荷兰','日本','F组','2026-06-15 21:00','达拉斯',NULL,NULL,NULL,2.5,7,18,800.0,320.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(36,'F02','瑞典','突尼斯','F组','2026-06-16 03:00','蒙特雷',NULL,NULL,NULL,2.5,28,41,300.0,120.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(37,'F03','荷兰','突尼斯','F组','2026-06-21 02:00','达拉斯',NULL,NULL,NULL,2.5,7,41,800.0,120.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(38,'F04','日本','瑞典','F组','2026-06-21 05:00','蒙特雷',NULL,NULL,NULL,2.5,18,28,320.0,300.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(39,'F05','突尼斯','日本','F组','2026-06-25 00:00','达拉斯',NULL,NULL,NULL,2.5,41,18,120.0,320.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(40,'F06','荷兰','瑞典','F组','2026-06-25 00:00','蒙特雷',NULL,NULL,NULL,2.5,7,28,800.0,300.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(41,'G01','比利时','埃及','G组','2026-06-16 02:00','西雅图',NULL,NULL,NULL,2.5,8,36,500.0,110.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(42,'G02','伊朗','新西兰','G组','2026-06-15 23:00','洛杉矶',NULL,NULL,NULL,2.5,20,101,100.0,25.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(43,'G03','比利时','新西兰','G组','2026-06-20 04:00','西雅图',NULL,NULL,NULL,2.5,8,101,500.0,25.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(44,'G04','埃及','伊朗','G组','2026-06-20 04:00','洛杉矶',NULL,NULL,NULL,2.5,36,20,110.0,100.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(45,'G05','新西兰','埃及','G组','2026-06-25 02:00','西雅图',NULL,NULL,NULL,2.5,101,36,25.0,110.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(46,'G06','比利时','伊朗','G组','2026-06-25 02:00','洛杉矶',NULL,NULL,NULL,2.5,8,20,500.0,100.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(47,'H01','西班牙','佛得角','H组','2026-06-16 00:00','亚特兰大',NULL,NULL,NULL,2.5,1,66,1500.0,30.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(48,'H02','沙特','乌拉圭','H组','2026-06-15 06:00','迈阿密',NULL,NULL,NULL,2.5,53,11,80.0,480.00000000000000001,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(49,'H03','西班牙','乌拉圭','H组','2026-06-21 01:00','亚特兰大',NULL,NULL,NULL,2.5,1,11,1500.0,480.00000000000000001,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(50,'H04','佛得角','沙特','H组','2026-06-21 01:00','迈阿密',NULL,NULL,NULL,2.5,66,53,30.0,80.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(51,'H05','乌拉圭','佛得角','H组','2026-06-25 23:00','亚特兰大',NULL,NULL,NULL,2.5,11,66,480.00000000000000001,30.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(52,'H06','西班牙','沙特','H组','2026-06-25 23:00','迈阿密',NULL,NULL,NULL,2.5,1,53,1500.0,80.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(53,'I01','法国','塞内加尔','I组','2026-06-17 03:00','纽约新泽西',NULL,NULL,NULL,2.5,3,14,1200.0,379.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(54,'I02','伊拉克','挪威','I组','2026-06-16 06:00','波士顿',NULL,NULL,NULL,2.5,58,31,35.0,350.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(55,'I03','法国','挪威','I组','2026-06-21 03:00','纽约新泽西',NULL,NULL,NULL,2.5,3,31,1200.0,350.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(56,'I04','塞内加尔','伊拉克','I组','2026-06-21 20:00','波士顿',NULL,NULL,NULL,2.5,14,58,379.99999999999999999,35.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(57,'I05','挪威','塞内加尔','I组','2026-06-26 03:00','纽约新泽西',NULL,NULL,NULL,2.5,31,14,350.0,379.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(58,'I06','法国','伊拉克','I组','2026-06-26 03:00','波士顿',NULL,NULL,NULL,2.5,3,58,1200.0,35.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(59,'J01','阿根廷','阿尔及利亚','J组','2026-06-17 09:00','堪萨斯城',NULL,NULL,NULL,2.5,2,43,900.0,100.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(60,'J02','奥地利','约旦','J组','2026-06-17 12:00','旧金山',NULL,NULL,NULL,2.5,25,68,279.99999999999999999,15.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(61,'J03','阿根廷','奥地利','J组','2026-06-22 02:00','堪萨斯城',NULL,NULL,NULL,2.5,2,25,900.0,279.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(62,'J04','阿尔及利亚','约旦','J组','2026-06-22 04:00','旧金山',NULL,NULL,NULL,2.5,43,68,100.0,15.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(63,'J05','约旦','阿根廷','J组','2026-06-27 01:00','堪萨斯城',NULL,NULL,NULL,2.5,68,2,15.0,900.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(64,'J06','阿尔及利亚','奥地利','J组','2026-06-27 01:00','旧金山',NULL,NULL,NULL,2.5,43,25,100.0,279.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(65,'K01','葡萄牙','刚果(金)','K组','2026-06-18 01:00','休斯顿',NULL,NULL,NULL,2.5,6,62,850.0,20.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(66,'K02','乌兹别克斯坦','哥伦比亚','K组','2026-06-18 03:00','休斯顿',NULL,NULL,NULL,2.5,64,13,25.0,379.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(67,'K03','葡萄牙','乌兹别克斯坦','K组','2026-06-23 02:00','休斯顿',NULL,NULL,NULL,2.5,6,64,850.0,25.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(68,'K04','刚果(金)','哥伦比亚','K组','2026-06-23 03:00','休斯顿',NULL,NULL,NULL,2.5,62,13,20.0,379.99999999999999999,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(69,'K05','哥伦比亚','葡萄牙','K组','2026-06-28 00:30','休斯顿',NULL,NULL,NULL,2.5,13,6,379.99999999999999999,850.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(70,'K06','刚果(金)','乌兹别克斯坦','K组','2026-06-28 00:30','休斯顿',NULL,NULL,NULL,2.5,62,64,20.0,25.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(71,'L01','英格兰','克罗地亚','L组','2026-06-18 02:00','堪萨斯城',NULL,NULL,NULL,2.5,4,11,1100.0,320.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(72,'L02','加纳','巴拿马','L组','2026-06-18 00:00','堪萨斯城',NULL,NULL,NULL,2.5,60,45,120.0,30.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(73,'L03','英格兰','加纳','L组','2026-06-23 03:00','堪萨斯城',NULL,NULL,NULL,2.5,4,60,1100.0,120.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(74,'L04','克罗地亚','巴拿马','L组','2026-06-23 00:00','堪萨斯城',NULL,NULL,NULL,2.5,11,45,320.0,30.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(75,'L05','巴拿马','英格兰','L组','2026-06-28 02:00','堪萨斯城',NULL,NULL,NULL,2.5,45,4,30.0,1100.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
INSERT INTO matches VALUES(76,'L06','克罗地亚','加纳','L组','2026-06-28 02:00','堪萨斯城',NULL,NULL,NULL,2.5,11,60,320.0,120.0,NULL,NULL,NULL,'','2026-06-13 08:34:14');
CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT UNIQUE NOT NULL,
    fifa_rank INTEGER,
    value_million_eur REAL,
    group_name TEXT,
    coach TEXT,
    star_player TEXT,
    recent_form TEXT,
    notes TEXT
);
INSERT INTO teams VALUES(9,'墨西哥',15,350.0,'A组','阿吉雷','奥乔亚/希门尼斯','东道主，首轮2-0胜南非','中北美传统强队');
INSERT INTO teams VALUES(10,'韩国',23,279.99999999999999999,'A组','克林斯曼(前任)','孙兴慜/金玟哉/李刚仁','首轮2-1胜捷克','亚洲纸面最强');
INSERT INTO teams VALUES(11,'南非',59,45.0,'A组','未知','福斯特','首轮0-2负墨西哥','非洲新军');
INSERT INTO teams VALUES(12,'捷克',36,220.0,'A组','未知','希克','首轮1-2负韩国','黄金一代尾声');
INSERT INTO teams VALUES(13,'加拿大',24,179.99999999999999999,'B组','马什','阿方索·戴维斯','东道主，首轮1-1平波黑','36年来首次世界杯');
INSERT INTO teams VALUES(14,'波黑',74,129.99999999999999999,'B组','未知','哲科(末代)','首轮1-1平加拿大','身体强悍东欧');
INSERT INTO teams VALUES(15,'卡塔尔',56,20.0,'B组','洛佩特吉','阿菲夫','首轮待踢','亚洲冠军，本土联赛');
INSERT INTO teams VALUES(16,'瑞士',19,3299.9999999999999999,'B组','雅金','扎卡/阿坎吉/恩博洛','首轮待踢','连续6届世界杯');
INSERT INTO teams VALUES(17,'巴西',6,1000.0,'C组','安切洛蒂','维尼修斯/拉菲尼亚','首轮待踢','夺冠热门，3连胜');
INSERT INTO teams VALUES(18,'摩洛哥',7,4980.0,'C组','雷格拉吉','阿姆拉巴特/阿什拉夫','首轮待踢','上届四强，伤兵满营');
INSERT INTO teams VALUES(19,'海地',83,60.0,'C组','未知','无明星','首轮待踢','52年来首次世界杯');
INSERT INTO teams VALUES(20,'苏格兰',42,2000.0,'C组','克拉克','罗伯逊/麦克托米奈','首轮待踢','1998年来首次');
INSERT INTO teams VALUES(21,'美国',14,600.0,'D组','波切蒂诺','普利西奇','东道主，首轮4-1胜巴拉圭','主场优势');
INSERT INTO teams VALUES(22,'巴拉圭',55,90.0,'D组','未知','阿尔米隆','首轮1-4负美国','防守韧性');
INSERT INTO teams VALUES(23,'澳大利亚',27,736.99999999999999998,'D组','波波维奇','苏塔/赫鲁斯蒂奇','首轮待踢','连续4届首战全败');
INSERT INTO teams VALUES(24,'土耳其',22,4750.0,'D组','蒙特拉','居莱尔/恰尔汗奥卢','首轮待踢','24年来首次，4胜1平');
INSERT INTO teams VALUES(25,'德国',9,950.0,'E组','纳格尔斯曼','穆西亚拉/维尔茨/哈弗茨','首轮待踢','新老交替完成');
INSERT INTO teams VALUES(26,'库拉索',89,8.0,'E组','未知','无','首轮待踢','人口15.6万最小参赛国');
INSERT INTO teams VALUES(27,'科特迪瓦',37,350.0,'E组','未知','无','首轮待踢','非洲老牌');
INSERT INTO teams VALUES(28,'厄瓜多尔',30,279.99999999999999999,'E组','未知','凯塞多/瓦伦西亚','首轮待踢','南美预选赛惊艳');
INSERT INTO teams VALUES(29,'荷兰',7,800.0,'F组','科曼','德佩/加克波','首轮待踢','全攻全守');
INSERT INTO teams VALUES(30,'日本',18,320.0,'F组','森保一','久保建英/三笘薰','首轮待踢','连续8届，旅欧军团');
INSERT INTO teams VALUES(31,'瑞典',28,300.0,'F组','未知','伊萨克','首轮待踢','欧洲力量型');
INSERT INTO teams VALUES(32,'突尼斯',41,120.0,'F组','未知','无','首轮待踢','非洲防守型');
INSERT INTO teams VALUES(33,'比利时',8,500.0,'G组','特德斯科','德布劳内/多库','首轮待踢','黄金一代末章');
INSERT INTO teams VALUES(34,'埃及',36,110.0,'G组','未知','萨拉赫','首轮待踢','非洲法老');
INSERT INTO teams VALUES(35,'伊朗',20,100.0,'G组','未知','塔雷米/阿兹蒙','首轮待踢','亚洲防守韧性');
INSERT INTO teams VALUES(36,'新西兰',101,25.0,'G组','未知','无','首轮待踢','大洋洲独苗');
INSERT INTO teams VALUES(37,'西班牙',1,1500.0,'H组','德拉富恩特','亚马尔/奥尔莫/梅里诺','首轮待踢','欧洲杯冠军，头号种子');
INSERT INTO teams VALUES(38,'佛得角',66,30.0,'H组','未知','无','首轮待踢','人口50万岛国，历史性首次');
INSERT INTO teams VALUES(39,'沙特',53,80.0,'H组','未知','无','首轮待踢','金元联赛提升');
INSERT INTO teams VALUES(40,'乌拉圭',11,480.00000000000000001,'H组','贝尔萨','巴尔韦德/努涅斯','首轮待踢','攻守均衡');
INSERT INTO teams VALUES(41,'法国',3,1200.0,'I组','德尚','姆巴佩/格列兹曼','首轮待踢','上届亚军，冲冠');
INSERT INTO teams VALUES(42,'塞内加尔',14,379.99999999999999999,'I组','未知','马内','首轮待踢','非洲冠军');
INSERT INTO teams VALUES(43,'挪威',31,350.0,'I组','索尔巴肯','哈兰德/厄德高','首轮待踢','28年来首次');
INSERT INTO teams VALUES(44,'伊拉克',58,35.0,'I组','未知','无','首轮待踢','40年来首次');
INSERT INTO teams VALUES(45,'阿根廷',2,900.0,'J组','斯卡洛尼','梅西/阿尔瓦雷斯/恩佐','首轮待踢','卫冕冠军，梅西最后');
INSERT INTO teams VALUES(46,'阿尔及利亚',43,100.0,'J组','未知','马赫雷斯','首轮待踢','非洲劲旅');
INSERT INTO teams VALUES(47,'奥地利',25,279.99999999999999999,'J组','朗尼克','萨比策','首轮待踢','中场创造力');
INSERT INTO teams VALUES(48,'约旦',68,15.0,'J组','未知','无','首轮待踢','首次参赛新军');
INSERT INTO teams VALUES(49,'葡萄牙',6,850.0,'K组','马丁内斯','C罗/莱奥/贝尔纳多','首轮待踢','C罗最后冲刺');
INSERT INTO teams VALUES(50,'哥伦比亚',13,379.99999999999999999,'K组','未知','路易斯·迪亚斯','首轮待踢','边路冲击力');
INSERT INTO teams VALUES(51,'刚果(金)',62,20.0,'K组','未知','无','首轮待踢','非洲新军');
INSERT INTO teams VALUES(52,'乌兹别克斯坦',64,25.0,'K组','未知','肖穆罗多夫','首轮待踢','首次参赛');
INSERT INTO teams VALUES(53,'英格兰',4,1100.0,'L组','图赫尔','凯恩/贝林厄姆/萨卡','首轮待踢','夺冠热门');
INSERT INTO teams VALUES(54,'克罗地亚',11,320.0,'L组','达利奇','莫德里奇(末届)','首轮待踢','18年亚军，老将最后的');
INSERT INTO teams VALUES(55,'巴拿马',45,30.0,'L组','未知','无','首轮待踢','中北美新军');
INSERT INTO teams VALUES(56,'加纳',60,120.0,'L组','未知','无','首轮待踢','非洲老牌');
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER REFERENCES matches(id),
    prediction_type TEXT,                -- 类型: 胜负/大小球/比分
    prediction_value TEXT,               -- 预测内容
    actual_result TEXT,                  -- 实际结果（赛后填写）
    is_correct INTEGER,                  -- 是否正确 0/1
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('matches',76);
INSERT INTO sqlite_sequence VALUES('teams',56);
COMMIT;
