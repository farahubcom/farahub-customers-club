const Campaign = require("./Campaign");
const Loyalty = require("./Loyalty");
const Person = require("./Person");
const Message = require("./Message");
const Delivery = require("./Delivery");
const Winner = require("./Winner");
const Retarget = require("./Retarget");

const models = {
	Message,
	Campaign,
	Person,
	Loyalty,
	Delivery,
	Winner,
	Retarget,
};

module.exports = models;
