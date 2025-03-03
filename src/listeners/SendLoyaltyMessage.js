const { Listener } = require('@farahub/framework/foundation');
const trim = require("lodash/trim");
const every = require("lodash/every");
const { getDeliverySendTime } = require("../utils");


class SendLoyaltyMessage extends Listener {

    /**
     * Determine if sms should send welcome message
     * 
     * @param {Loyalty} loyalty loyalty
     * @param {PersonVisitStored} event event
     * @var boolean
     */
    async shouldSend(loyalty, event) {

        if(!loyalty || !loyalty.active) return false;

        return every([

            // message and message content exist
            loyalty.message && trim(loyalty.message?.content),

            // Check if is confirmed
            message?.latestStatus?.status == "confirmed",
        ], Boolean);
    }

    /**
     * handle the event
     * 
     * @param {PersonVisitStored} event event
     */
    async handle(event) {

        const Loyalty = event.connection.model('Loyalty');
        const loyalty = Loyalty.findOne({ consecutiveVisitNumber: event.person.references.length }).populate('message');

        if (await this.shouldSend(loyalty, event)) {

            const Delivery = event.connection.model('Delivery');
            const delivery = new Delivery({
                to: event.person.id,
                message: loyalty.message.id,
                shouldSentAt: getDeliverySendTime()
            });

            await delivery.save();
        }
    }
}


module.exports = SendLoyaltyMessage;