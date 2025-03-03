const filter = require("lodash/filter");

class BirthdayMessage {

    /**
     * The workspace instance
     * 
     * @var Workspace
     */
    workspace;

    /**
     * Create notification instance
     * 
     * @param {Workspace} workspace
     * @constructor
     */
    constructor(workspace) {
        this.workspace = workspace
    }

    /**
     * return list of channels that you want to send notification to
     * 
     * @returns {string[]}
     */
    via() {
        return filter([
            this.workspace.hasCurrentModule('sms') && 'sms',
            this.workspace.hasCurrentModule('mail') && 'mail'
        ], Boolean);
    }

    /**
     *  handle sms message
     */
    toSms(notifiable) {
        return {
            content: this.workspace.getOption('customers-club:birthday_message'),
        };
    }

    /**
     * handle mail message
     */
    toMail(notifiable) {
        //
    }
}

module.exports = BirthdayMessage;