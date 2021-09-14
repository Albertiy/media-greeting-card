SELECT * FROM heka.uploadfiles;
-- select UUID();
-- insert into uploadfiles(uuid) values (uuid()),(uuid());

select * from heka.generaterecords;

insert into uploadfiles(uuid, record_id) values (?, ?);

delete from heka.uploadfiles where id>0;

delete from heka.generaterecords where id>0;

ALTER TABLE `heka`.`uploadfiles` 
DROP FOREIGN KEY `FK_uploadfiles_record_id_idx`;