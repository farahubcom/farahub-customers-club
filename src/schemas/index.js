const Loyalty = require("./Loyalty");
const Campaign = require("./Campaign");
const Person = require("./Person");
const Message = require("./Message");
const Delivery = require("./Delivery");
const Winner = require("./Winner");
const Retarget = require("./Retarget");

const schemas = {
	Message,
	Delivery,
	Campaign,
	Loyalty,
	Winner,
	Retarget,
	injects: {
		People: {
			Person,
		},
	},
};

module.exports = schemas;
