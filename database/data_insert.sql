-- 插入产品数据

insert into product(`name`) values('音视频贺卡');
insert into product(`name`) values('钥匙扣');

SELECT * FROM product;

-- 插入音乐

insert into music(product_id,`name`,author,`path`,`order`) values(2, 'Default - 温馨', 'default', 'music\default-1.mp3', 1);
insert into music(product_id,`name`,author,`path`,`order`) values(2, 'Default - 浪漫', 'default', 'music\default-2.mp3', 2);

select * from music;

-- 插入背景图片

insert into bgimage(product_id,`name`,`path`,`order`) values(2, 'Default - 冉兰', 'bgimage\bush.png',1);
insert into bgimage(product_id,`name`,`path`,`order`) values(2, 'Default - 几何叶', 'bgimage\geometric-leaves.png',2);
insert into bgimage(product_id,`name`,`path`,`order`) values(2, 'Default - 素心', 'bgimage\pixel-heart.png',3);

SELECT * FROM bgimage;

-- 将之前的所有二维码设置product_id
-- --  update uploadfiles set product_id = 1;

select * from uploadfiles;

-- 插入文章模板
insert into article_template(`name`,`order`) values('默认模板-1',1); 