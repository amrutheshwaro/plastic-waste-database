//jshint esversion:6

require('dotenv').config;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const qr = require('qrcode');
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect(process.env.DB_ADDRESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const polymerSchema = {
    polymerName: String,
    polymerGrade: String,
    unitWeight: Number,
    recyclability: Number,
};

const Polymer = mongoose.model('polymer', polymerSchema);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.route('/')
    .get(function (req, res) {
        res.render('home')
    })
    .post(function (req, res) {
        const polymerName = _.lowerCase(req.body.polymerName).split(' ').join('');
        const polymerGrade = _.lowerCase(req.body.polymerGrade).split(' ').join('');
        const unitWeight = _.toNumber(req.body.unitWeight);
        const recyclability = _.toInteger(req.body.recyclability);
        Polymer.findOne({
            'polymerName': polymerName,
            'polymerGrade': polymerGrade,
            'unitWeight': unitWeight
        }, function (err, document) {
            if (document == null) {
                const polymer = new Polymer({
                    polymerName: polymerName,
                    polymerGrade: polymerGrade,
                    unitWeight: unitWeight,
                    recyclability: recyclability,
                });
                polymer.save(function (err, document) {
                    qr.toDataURL(document.id, function (err, src) {
                        if (!err) {
                            const id = document.id;
                            res.render('generator', { src, id })
                        }
                    })
                });
            } else {
                qr.toDataURL(document.id, function (err, src) {
                    if (!err) {
                        const id = document.id;
                        res.render('generator', { src, id });
                    }
                });
            }
        })
    });

app.listen(port, function () {
    console.log("Server has started succesfully")
})