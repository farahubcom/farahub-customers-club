const CreateCampaignsDeliveries = require("./CreateCampaignsDeliveries");
const CreateBirthdayDeliveries = require("./CreateBirthdayDeliveries");
const SendDeliveries = require("./SendDeliveries");

const jobs = [
    CreateBirthdayDeliveries,
    CreateCampaignsDeliveries,
    SendDeliveries,
];

module.exports = jobs;