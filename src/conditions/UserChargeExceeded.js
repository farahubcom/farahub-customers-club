const { Condition } = require('@farahub/framework/foundation');
const { Doc } = require('@farahub/framework');


class UserChargeExceeded extends Condition {

    /**
     * Name of the condition
     * 
     * @var string
     */
    name = 'User charge exceeded';

    /**
     * Identifier of the condition
     * 
     * @var string
     */
    identifier = 'user-charge-exceeded';

    /**
     * Handle the condition
     * 
     * @param object data
     * @return bool
     */
    async handle(params, data) {
        if (!data.personId || !data.amount) return false;

        const Person = this.connection.model('Person');
        const person = await Doc.resolve(data.personId, Person);

        return person.customerClubCharge >= data.amount;
    }
}

module.exports = UserChargeExceeded;