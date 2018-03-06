module.exports = {
     index: "book_offers",
     type: "book_offer",
     keys: ["offerid", "source"],
     mapping: {
         content: { type: "string" },
         duration: { type: "float" },
         firstimportdate: { type: "date", format: "strict_date_optional_time||epoch_millis" },
         lastimportdate: { type: "date", format: "strict_date_optional_time||epoch_millis" },
         offerid: { type: "string" },
         price: { type: "float" },
         search : { type: "string", index: "not_analyzed" },
         title : { type: "string", index: "not_analyzed" },
         type: { type: "string", index: "not_analyzed" }
     },
     connection : {
         host: '127.0.0.1:9200'
     }
 }