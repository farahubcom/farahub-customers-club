const MainController = require("./MainController");
const VisitController = require("./VisitController");
const WelcomeController = require("./WelcomeController");
const CampaignsController = require("./CampaignsController");
const BirthdayController = require("./BirthdayController");
const LoyaltiesController = require("./LoyaltiesController");
const RewardsController = require("./RewardsController");
const WinnerController = require("./WinnerController");
const RetargetsController = require("./RetargetsController");
const DeliveriesController = require("./DeliveriesController");

const controllers = [
	MainController,
	VisitController,
	WelcomeController,
	CampaignsController,
	BirthdayController,
	LoyaltiesController,
	RewardsController,
	WinnerController,
	RetargetsController,
	DeliveriesController,
];

module.exports = controllers;
