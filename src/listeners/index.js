const PersonVisitStored = require("../events/PersonVisitStored");
const SendLoyaltyMessage = require("./SendLoyaltyMessage");
const SendRevisitMessage = require("./SendRevisitMessage");
const SendWelcomeMessage = require("./SendWelcomeMessage");


module.exports = new Map([
    [
        PersonVisitStored, [
            SendWelcomeMessage,
            SendRevisitMessage,
            SendLoyaltyMessage,
        ],
    ],

    // 
]);