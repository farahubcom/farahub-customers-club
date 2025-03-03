const filter = require("lodash/filter");

class RevisitMessage {

    /**
     * The workspace instance
     * 
     * @var Workspace
     */
    workspace;

    /**
     * The message to send
     * 
     * @var Message
     */
    message;

    /**
     * Create notification instance
     * 
     * @param {Workspace} workspace
     * @constructor
     */
    constructor(workspace, message) {
        this.workspace = workspace
        this.message = message
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
            content: this.message.content,
        };
    }

    /**
     * handle mail message
     */
    toMail(notifiable) {
        //
    }
}

module.exports = RevisitMessage;