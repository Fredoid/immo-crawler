DROP TABLE IF EXISTS temp_offers;
CREATE TABLE temp_offers (
  offerid int,
  lastimportdate timestamp,
  firstimportdate timestamp
);

INSERT INTO temp_offers
SELECT offer_hits.offerid, MAX(offer_hits.importdate), MIN(offer_hits.importdate)
FROM offer_hits
GROUP BY offer_hits.offerid;

INSERT OVERWRITE TABLE offers 
SELECT 
  offer_hits.offerid,
  offer_hits.title,
  offer_hits.city,
  offer_hits.dept,
  offer_hits.area,
  offer_hits.content,
  unix_timestamp(offer_hits.importdate)*1000 as lastimportdate,
  unix_timestamp(temp_offers.firstimportdate)*1000 as firstimportdate,
  datediff(offer_hits.importdate, temp_offers.firstimportdate) as duration,
  offer_hits.price,
  offer_hits.search,
  offer_hits.type,
  offer_hits.url
FROM offer_hits
JOIN temp_offers ON offer_hits.offerid = temp_offers.offerid AND offer_hits.importdate = temp_offers.lastimportdate;

DROP TABLE IF EXISTS temp_offers;
