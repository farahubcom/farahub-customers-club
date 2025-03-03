const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace } = require('@farahub/framework/facades');
const WelcomeUpdateOptionsValidator = require('../validators/WelcomeUpdateOptionsValidator');
const pick = require('lodash/pick');


class WelcomeController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Welcome';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/welcome';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/options',
            handler: 'getOptions',
        },
        {
            type: 'api',
            method: 'post',
            path: '/options',
            handler: 'updateOptions',
        },
    ]

    /**
     * Get welcome message configurations
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    getOptions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app, true),
            Injection.register(this.module, 'welcome.getOptions'),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const Message = req.wsConnection.model('Message');

                    const welcomeMessageId = req.workspace.getOption("customers-club:welcome_message");
                    const welcomeMessage = welcomeMessageId  ? await Message.findById(welcomeMessageId) : null;

                    const revisitMessageId = req.workspace.getOption("customers-club:revisit_message");
                    const revisitMessage = revisitMessageId  ? await Message.findById(revisitMessageId) : null;

                    const data = {
                        welcome_message: welcomeMessage ? {
                            ...pick(welcomeMessage, ['id', 'content']),
                            ...(welcomeMessage.latestStatus ? {
                                status: welcomeMessage.latestStatus.status,
                                status_description: welcomeMessage.latestStatus.description,
                            } : {})
                        } : null,
                        welcome_active: req.workspace.getOption("customers-club:welcome_message_active", true),
                        welcome_delay: req.workspace.getOption("customers-club:welcome_message_delay", 1),

                        revisit_message: revisitMessage ? {
                            ...pick(revisitMessage, ['id', 'content']),
                            ...(revisitMessage.latestStatus ? {
                                status: revisitMessage.latestStatus.status,
                                status_description: revisitMessage.latestStatus.description,
                            } : {})
                        } : null,
                        revisit_active: req.workspace.getOption("customers-club:revisit_message_active", true),
                        revisit_delay: req.workspace.getOption("customers-club:revisit_message_delay", 1),
                    }

                    return res.json({ ok: true, data });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Update welcome message configurations
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    updateOptions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app, true),
            Injection.register(this.module, 'welcome.updateOptions'),
            Validator.validate(new WelcomeUpdateOptionsValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const data = req.body;

                    const Message = req.wsConnection.model('Message');

                    await Promise.all(
                        [{
                            type: "welcome",
                            key: "customers-club:welcome_message",
                            contentDataKey: "welcome_content",
                            activeDataKey: "welcome_active",
                            delayDataKey: "welcome_delay"
                        }, {
                            type: "revisit",
                            key: "customers-club:revisit_message",
                            contentDataKey: "revisit_content",
                            activeDataKey: "revisit_active",
                            delayDataKey: "revisit_delay"
                        }].filter(option => data.hasOwnProperty(option.contentDataKey)).map(async (option) => {
    
                            const messageId = req.workspace.getOption(option.key);
                            
                            const message = messageId ? await Message.findById(messageId) : new Message({ type: option.type });
                                
                            message.content = data[option.contentDataKey];
        
                            await message.save();
        
                            await req.workspace.setOptions({
                                [option.key]: message._id,
                                [`${option.key}_active`]: Boolean(data[option.activeDataKey]),
                                [`${option.key}_delay`]: data[option.delayDataKey]
                            });
                        })
                    )

                    return res.json({ ok: true });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = WelcomeController;