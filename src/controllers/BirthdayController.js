const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace } = require('@farahub/framework/facades');
const BirthdayUpdateOptionsValidator = require('../validators/BirthdayUpdateOptionsValidator');
const pick = require('lodash/pick');


class BirthdayController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Birthday';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/birthday';

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
     * Get birthday message configurations
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
            Injection.register(this.module, 'birthday.getOptions'),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const Message = req.wsConnection.model('Message');

                    const recieveBirthdayMessageId = req.workspace.getOption("customers-club:receive_birthday_message");
                    const recieveBirthdayMessage = recieveBirthdayMessageId ? await Message.findById(recieveBirthdayMessageId) : null;

                    const birthdayMessageId = req.workspace.getOption("customers-club:birthday_message");
                    const birthdayMessage = birthdayMessageId ? await Message.findById(birthdayMessageId) : null;

                    const data = {
                        receive_birthday_message: recieveBirthdayMessage ? {
                            ...pick(recieveBirthdayMessage, ['id', 'content']),
                            ...(recieveBirthdayMessage.latestStatus ? {
                                status: recieveBirthdayMessage.latestStatus.status,
                                status_description: recieveBirthdayMessage.latestStatus.description,
                            } : {})
                        } : null,
                        receive_birthday_active: req.workspace.getOption("customers-club:receive_birthday_message_active", false),
                        receive_birthday_delay: req.workspace.getOption("customers-club:receive_birthday_message_delay", 1),

                        birthday_message: birthdayMessage ? {
                            ...pick(birthdayMessage, ['id', 'content']),
                            ...(birthdayMessage.latestStatus ? {
                                status: birthdayMessage.latestStatus.status,
                                status_description: birthdayMessage.latestStatus.description,
                            } : {})
                        } : null,
                        birthday_active: req.workspace.getOption("customers-club:birthday_message_active", false),
                        birthday_delay: req.workspace.getOption("customers-club:birthday_message_delay", 1),
                    }

                    return res.json({ ok: true, data });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Update birthday message configurations
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
            Injection.register(this.module, 'birthday.updateOptions'),
            Validator.validate(new BirthdayUpdateOptionsValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const data = req.body;

                    const Message = req.wsConnection.model('Message');

                    await Promise.all(
                        [{
                            type: "receive_birthday",
                            key: "customers-club:receive_birthday_message",
                            contentDataKey: "receive_birthday_content",
                            activeDataKey: "receive_birthday_active",
                            delayDataKey: "receive_birthday_delay"
                        }, {
                            type: "birthday",
                            key: "customers-club:birthday_message",
                            contentDataKey: "birthday_content",
                            activeDataKey: "birthday_active",
                            delayDataKey: "birthday_delay"
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

module.exports = BirthdayController;