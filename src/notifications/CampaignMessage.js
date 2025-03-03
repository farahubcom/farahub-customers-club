const filter = require("lodash/filter");

class CampaignMessage {

    /**
     * The workspace instance
     * 
     * @var Workspace
     */
    workspace;

    /**
     * The campaign instance
     * 
     * @var Campaign
     */
    campaign;

    /**
     * Create notification instance
     * 
     * @param {Workspace} workspace
     * @param {Campaign} campaign
     * @constructor
     */
    constructor(workspace, campaign) {
        this.workspace = workspace;
        this.campaign = campaign;
    }

    /**
     * return list of channels that you want to send notification to
     * 
     * @returns {string[]}
     */
    via() {
        return ['sms'];
    }

    /**
     *  handle sms message
     */
    toSms(notifiable) {
        return {
            content: this.campaign.content,
        };
    }

    /**
     * handle mail message
     */
    toMail(notifiable) {
        //
    }
}

module.exports = CampaignMessage;