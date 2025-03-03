const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace, Lang } = require('@farahub/framework/facades');
const LoyaltyListValidator = require('../validators/LoyaltyListValidator');
const CreateOrUpdateLoyaltyValidator = require('../validators/CreateOrUpdateLoyaltyValidator');


class LoyaltiesController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Loyalties';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/loyalties';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/',
            handler: 'list',
        },
        {
            type: 'api',
            method: 'post',
            path: '/',
            handler: 'createOrUpdate',
        },
    ]

    /**
     * List of loyalties match params
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'loyalties.list'),
            Validator.validate(new LoyaltyListValidator()),
            async (req, res, next) => {
                try {

                    const { wsConnection: connection } = req;

                    const Loyalty = connection.model('Loyalty');

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

                    const query = Loyalty.find(search)
                        .select('-__v')
                        .populate([
                            { path: 'targets.target' },
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Loyalty.find(search).count();

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

    /**
     * Create or upadte an existing loyalty
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    createOrUpdate() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'loyalties.createOrUpdate'),
            Validator.validate(new CreateOrUpdateLoyaltyValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const { inject, wsConnection: connection, workspace, user } = req;

                    const Loyalty = connection.model('Loyalty');

                    const loyalty = await Loyalty.createOrUpdate(data, data.id, { inject, connection });

                    res.json({ ok: true, loyalty });

                    // inject post response hooks
                    await inject('postResponse', { data, workspace, connection, inject, loyalty, user });

                    return;
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = LoyaltiesController;