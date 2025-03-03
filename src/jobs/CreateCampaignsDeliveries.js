const { Job } = require('@farahub/framework/foundation');
const { getDeliverySendTime } = require("../utils");

class CreateCampaignsDeliveries extends Job {

    /**
     * The job identifier
     * 
     * @var string
     */
    identifier = "create-campaigns-deliveries";

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
        console.log('Job "create-campaigns-deliveries" Start...');

        const Campaign = this.connection.model('Campaign');
        const campaigns = await Campaign.find({
            shouldRunAt: { $ne: null },
            finishedAt: null
        });

        if(campaigns.length) {
            const Delivery = this.connection.model('Delivery');

            await Promise.all(
                campaigns.map(
                    async campaign => {
                        const targets = await campaign.resolvePeople();

                        let totalSent = 0;

                        for (const person of targets) {
                            const delivery = new Delivery({
                                to: person._id,
                                message: campaign.message._id,
                                shouldSentAt: getDeliverySendTime()
                            });
                
                            await delivery.save();

                            totalSent++;

                            console.log('delivery sent');
                        }

                        campaign.totalSent = totalSent;
                        campaign.finishedAt = new Date();
                        await campaign.save();
                    }
                )
            )
        }
        
        console.log('Job "create-campaigns-deliveries" Done.');
    }
}

module.exports = CreateCampaignsDeliveries;