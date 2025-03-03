const { Job } = require('@farahub/framework/foundation');

class CreateRetargetDeliveries extends Job {

    /**
     * The job identifier
     * 
     * @var string
     */
    identifier = "create-retarget-deliveries";

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
        //
    }
}

module.exports = CreateRetargetDeliveries;