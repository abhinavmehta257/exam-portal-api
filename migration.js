/**
 * Migrate Promo Code from Competition model to Promo Model.
 * Will be Used One time.
 * 
 */
require('dotenv').config()
const CompetitionSchema = require("./Models/Competition");
const PromoSchema = require("./Models/PromoCodeModel");
const mongo = require('mongoose');
let url = 'mongodb://localhost:27017/superc';

if (process.env.DB_URL) {
    url = process.env.DB_URL;
}
else if (process.env.DB_USER) {
    url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:27017/${process.env.DB_NAME}`;
}

mongo.connect(url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        if (!err) {
            console.log('MongoDB connection succeeded.');
            CompetitionSchema.find({
                promoCodeAmount: { $gt: 0 }
            }, {
                promoCode: 1,
                promoCodeAmount: 1
            }).exec().then((res => {
                const toBeInserted = res.map(x => ({
                    code: x.promoCode,
                    competitionId: x._id,
                    value: x.promoCodeAmount,
                    isPercentage: false
                }));
                PromoSchema.insertMany(toBeInserted, { ordered: false })
                    .then(() => console.log("inserted"))
                    .catch(e => console.log(e));
                console.log()
            })).catch(err => {
                console.log(err);
            })
        }
        else {
            console.error('Error in DB connection : ');
            console.error(err);
        }
    });
