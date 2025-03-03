const { Job } = require('@farahub/framework/foundation');
const { Doc } = require('@farahub/framework/facades');
const every = require("lodash/every");
const trim = require("lodash/trim");
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const { getDeliverySendTime } = require("../utils");

class CreateBirthdayDeliveries extends Job {

    /**
     * The job identifier
     * 
     * @var string
     */
    identifier = "create-birthday-deliveries";

    /**
     * Job interval
     * 
     * @return string|number
     */
    interval() {
        return '1 minute';
    }

    /**
     * Determine if message should send
     * 
     * @param Workspace workspace
     * @var boolean
     */
    async shouldSend() {
        const messageId = this.workspace.getOption('customers-club:birthday_message', '');
        const isActive = this.workspace.getOption("customers-club:birthday_message_active", false);

        // Not send if no message set of not active
        if(!messageId || !isActive) return false;

        const Message = this.connection.model('Message');
        const message = await Doc.resolve(messageId, Message);

        return every([

            // message and message content exist
            message && trim(message?.content),

            // Check if is confirmed
            message?.latestStatus?.status == "confirmed",
        ], Boolean);
    }

    /**
     * handle the request
     */
    async handle(job) {
        const Person = this.connection.model('Person');
        const targets = await Person.find({
            bornAt: {
                $gte: startOfDay(new Date()),
                $lt: endOfDay(new Date())
            }
        });

        if (await this.shouldSend()) {

            const messageId = this.workspace.getOption('customers-club:birthday_message');
            const Message = this.connection.model('Message');
            const message = await Doc.resolve(messageId, Message);

            const Delivery = this.connection.model('Delivery');

            for (const person of targets) {
                const delivery = new Delivery({
                    to: person.id,
                    message: message.id,
                    shouldSentAt: getDeliverySendTime(this.workspace.getOption('customers-club:birthday_message_delay', 1))
                });
    
                await delivery.save();
            }

            // // This lines below should be implemented in SendDeliveries job
            // const notify = Notification.register(this.app, this.workspace, this.connection);
            // for (const person of targets) {
            //     notify(new BirthdayMessage(this.workspace)).to(person);
            // }
        }
    }
}

module.exports = CreateBirthdayDeliveries;