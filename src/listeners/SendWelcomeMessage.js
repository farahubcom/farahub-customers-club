const { Listener } = require('@farahub/framework/foundation');
const { Doc } = require('@farahub/framework/facades');
const trim = require("lodash/trim");
const every = require("lodash/every");
const { getDeliverySendTime } = require("../utils");

class SendWelcomeMessage extends Listener {

    /**
     * Determine if sms should send welcome message
     * 
     * @param {PersonVisitStored} event event
     * @var boolean
     */
    async shouldSend(event) {

        // Not send if customer visited not for the first time
        if(event.person.references.length > 1) return false;

        const messageId = event.workspace.getOption('customers-club:welcome_message', '');
        const isActive = event.workspace.getOption("customers-club:welcome_message_active", false);

        // Not send if no message set of not active
        if(!messageId || !isActive) return false;

        const Message = event.connection.model('Message');
        const message = await Doc.resolve(messageId, Message);

        return every([

            // message and message content exist
            message && trim(message?.content),

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
        if (await this.shouldSend(event)) {
            const messageId = event.workspace.getOption('customers-club:welcome_message');
            const Message = event.connection.model('Message');
            const message = await Doc.resolve(messageId, Message);

            const Delivery = event.connection.model('Delivery');
            const delivery = new Delivery({
                to: event.person.id,
                message: message.id,
                shouldSentAt: getDeliverySendTime(event.workspace.getOption('customers-club:welcome_message_delay', 1))
            });

            await delivery.save();
        }
    }
}


module.exports = SendWelcomeMessage;