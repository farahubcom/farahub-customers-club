const { Trigger } = require('@farahub/framework/foundation');


class ChargeUser extends Trigger {

    /**
     * Name of the task
     * 
     * @var string
     */
    name = "Charge user";

    /**
     * Identifier of the task
     * 
     * @var string
     */
    identifier = "charge-user";

    /**
     * Handle the task
     * 
     * @return bool
     */
    handle(params, data) {
        // 
    }
}

module.exports = ChargeUser;