const { Job } = require('@farahub/framework/foundation');
const sub = require('date-fns/sub');
const add = require('date-fns/add');
const WelcomeMessage = require("../notifications/WelcomeMessage");
const { Notification } = require("@farahub/notifications/facades");
const RevisitMessage = require("../notifications/RevisitMessage");
const BirthdayMessage = require("../notifications/BirthdayMessage");

class SendDeliveries extends Job {

    /**
     * The job identifier
     * 
     * @var string
     */
    identifier = "send-deliveries";

    /**
     * Job interval
     * 
     * @return string|number
     */
    interval() {
        return '1 minute';
    }

    /**
     * handle the request
     */
    async handle(job) {
        console.log('Job "send-deliveries" Start...');

        const Delivery = this.connection.model('Delivery');
        const toSend = await Delivery.find({
            sentAt: null,
            shouldSentAt: {
                $gte: sub(new Date, { minutes: 1 }),
                $lte: add(new Date, { minutes: 1 })
            }
        }).populate('message').populate('to');

        const notify = Notification.register(this.app, this.workspace, this.connection);

        for (const delivery of toSend) {

            let notification;
            switch (delivery.message.type) {
                case "welcome":
                    notification = new WelcomeMessage(this.workspace, delivery.message);
                    break;
                case "revisit":
                    notification = new RevisitMessage(this.workspace, delivery.message);
                    break;
                case "birthday":
                    notification = new BirthdayMessage(this.workspace, delivery.message);
                    break;
            }

            notify(notification).to(delivery.to);

            delivery.sentAt = new Date();

            await delivery.save();

            console.log('delivery sent');
        }

        console.log('Job "send-deliveries" Done.');
    }
}

module.exports = SendDeliveries;