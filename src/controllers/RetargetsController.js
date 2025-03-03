const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace, Lang, Doc } = require('@farahub/framework/facades');
const CampaignListValidator = require('../validators/CampaignListValidator');
const CreateOrUpdateRetargetValidator = require('../validators/CreateOrUpdateRetargetValidator');
const pick = require('lodash/pick')


class RetargetsController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Retargets';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/retargets';

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
        {
            type: 'api',
            method: 'get',
            path: '/:retargetId/options',
            handler: 'getOptions',
        },
    ]

    /**
     * List of campaigns match params
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'retargets.list'),
            Validator.validate(new CampaignListValidator()),
            async (req, res, next) => {
                try {

                    const { wsConnection: connection } = req;

                    const Retarget = connection.model('Retarget');

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

                    const query = Retarget.find(search)
                        .select('-__v')
                        .populate([
                            { path: 'targets.target' },
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Retarget.find(search).count();

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
     * Create or upadte an existing campaign
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
            Injection.register(this.module, 'retargets.createOrUpdate'),
            Validator.validate(new CreateOrUpdateRetargetValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const { inject, wsConnection: connection, workspace, user } = req;

                    const Retarget = connection.model('Retarget');

                    const campaign = await Retarget.createOrUpdate(data, data.id, { inject, connection });

                    // inject post response hooks
                    await inject('postResponse', { data, workspace, connection, inject, campaign, user });

                    return;
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get retarget details
     * 
     * @param {*} req request
     * @param {*} res response
     */
    getOptions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'retargets.details'),
            async function (req, res, next) {
                try {

                    const { retargetId } = req.params;
                    const { wsConnection: connection, inject } = req;

                    const Retarget = connection.model('Retarget');

                    const retarget = await Doc.resolve(retargetId, Retarget);

                    const data = {
                        ...pick(retarget, ['id', 'name', 'consecutiveNonReferralCount', 'active']),
                        message: pick(retarget.message, ['id', 'content', 'latestStatus'])
                    }

                    return res.json({ ok: true, data })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = RetargetsController;