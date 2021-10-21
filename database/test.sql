SELECT * FROM heka.uploadfiles;
-- select UUID();
-- insert into uploadfiles(uuid) values (uuid()),(uuid());

select * from heka.generaterecords;

insert into uploadfiles(uuid, record_id) values (?, ?);

delete from heka.uploadfiles where id>0;

delete from heka.generaterecords where id>0;

ALTER TABLE `heka`.`uploadfiles` 
DROP FOREIGN KEY `FK_uploadfiles_record_id_idx`;

select distinct * from heka.generaterecords where id = 4;

select * from heka.generaterecords where create_time between '2021-09-14 13:11:11' and '2021-09-14 13:50:11';

select date_add(now(),interval 31 day);

select date_add(now(), interval 20 hour); -- add 1 hour

select date_add(now(), interval 20 hour); -- add 1 hour

update heka.uploadfiles set isLocked = true where id = 1087;

SELECT * FROM heka.generaterecords where create_time > '2021-09-01' and create_time < '2021-09-30';

SELECT * FROM heka.uploadfiles where uuid = '6ee23255-151f-11ec-9fd8-7fbca34d1aa1';

update heka.`uploadfiles` set text_from='王中王', text_to='我最强' where uuid = '6ee23255-151f-11ec-9fd8-7fbca34d1aa12';

update heka.`uploadfiles` set videoPath='D:\video\temp\1', audioPath='D:\audio\temp\1' where uuid = '6ee23255-151f-11ec-9fd8-7fbca34d1aa12';

select * from heka.uploadfiles where audioPath is not null;

select * from heka.uploadfiles where videoPath is not null;

set @a = JSON_array();
select @a;

set @b = '[]';
select @b;

select JSON_ARRAY_APPENDproduct_item(convert('[]',json), '$', convert('{"type":"image", id: 1}',json));

set @c = convert('[{"type":"image", "id":1}]',json);
select @c;
select JSON_ARRAY(@c);

select * from music where product_id = ? order by `order` is null, `order`asc;
select * from bgimage;
select * from product;

update uploadfiles set modify_pwd = '123456' where `uuid` = '9f0d5b10-2b0b-11ec-afb0-c15c0e4ce4e6';
select * from uploadfiles where `uuid` = '9f0d5b10-2b0b-11ec-afb0-c15c0e4ce4e6';