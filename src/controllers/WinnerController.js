const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace } = require('@farahub/framework/facades');
const pick = require('lodash/pick');
const WinnerUpdateOptionsValidator = require('../validators/WinnerUpdateOptionsValidator');


class WinnerController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Winner';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/winner';

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
            handler: 'setOptions',
        },
        {
            type: 'api',
            method: 'get',
            path: '/report',
            handler: 'report',
        },
    ]

    /**
     * Get workspace winner options
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    getOptions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'winner.getOptions'),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const Message = req.wsConnection.model('Message');

                    const messageId = req.workspace.getOption("customers-club:winner_message");
                    const message = messageId  ? await Message.findById(messageId) : null;

                    const data = {
                        message: message ? {
                            ...pick(message, ['id', 'content']),
                            ...(message.latestStatus ? {
                                status: message.latestStatus.status,
                                status_description: message.latestStatus.description,
                            } : {})
                        } : null,
                        count: req.workspace.getOption("customers-club:winner_count", 1),
                        active: req.workspace.getOption("customers-club:winner_active", false),
                        interval: req.workspace.getOption("customers-club:winner_interval", "daily"),
                    }

                    return res.json({ ok: true, data });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Set workspace winner options
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    setOptions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'winner.setOptions'),
            Validator.validate(new WinnerUpdateOptionsValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const data = req.body;

                    const Message = req.wsConnection.model('Message');
    
                    const messageId = req.workspace.getOption("customers-club:winner_message");
                    
                    const message = messageId ? await Message.findById(messageId) : new Message({ type: "winner" });
                        
                    message.content = data.message;

                    await message.save();
        
                    await req.workspace.setOptions({
                        "customers-club:winner_message": message.id,
                        "customers-club:winner_count": data.count,
                        "customers-club:winner_active": data.active,
                        "customers-club:winner_interval": data.interval
                    });

                    return res.json({ ok: true });

                    return;
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Report of winners match params
     * 
     * @return void
     */
    report() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'winner.report'),
            async (req, res, next) => {
                try {

                    const { wsConnection: connection } = req;

                    const Winner = connection.model('Winner');

                    const args = req.query;

                    let search = {
                        //
                    }

                    if (args && args.query && args.query !== '') {
                        search = {
                            ...search,
                            name: { $regex: args.query + '.*' }
                        }
                    }

                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const populationInjections = await req.inject('populate');

                    const query = Winner.find(search)
                        .select('-__v')
                        .populate([
                            { path: 'person' },
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Winner.find(search).count();

                    if (args && args.page > -1) {
                        const perPage = args.perPage || 25;
                        query.skip(args.page * perPage)
                            .limit(perPage)
                    }

                    let data = await query.lean({ virtuals: true });

                    data = Lang.translate(data);

                    return res.json({ ok: true, data, total })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = WinnerController;