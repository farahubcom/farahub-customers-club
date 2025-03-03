const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace, Lang, Doc } = require('@farahub/framework/facades');
const CampaignListValidator = require('../validators/CampaignListValidator');
const CreateOrUpdateCampaignValidator = require('../validators/CreateOrUpdateCampaignValidator');
const RunCampaignValidator = require('../validators/RunCampaignValidator');
const map = require('lodash/map');
const CampaignDeleteValidator = require('../validators/CampaignDeleteValidator');


class CampaignsController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Campaigns';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/campaigns';

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
            method: 'post',
            path: '/:campaignId/run',
            handler: 'run',
        },
        {
            type: 'api',
            method: 'get',
            path: '/:campaignId/options',
            handler: 'getOptions',
        },
        {
            type: 'api',
            method: 'delete',
            path: '/:campaignId',
            handler: 'delete',
        }
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
            Injection.register(this.module, 'campaings.list'),
            Validator.validate(new CampaignListValidator()),
            async (req, res, next) => {
                try {

                    const { wsConnection: connection } = req;

                    const Campaign = connection.model('Campaign');

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

                    const query = Campaign.find(search)
                        .select('-__v')
                        .populate([
                            { path: 'message' },
                            { path: 'targets.target' },
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Campaign.find(search).count();

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
            Injection.register(this.module, 'campaings.createOrUpdate'),
            Validator.validate(new CreateOrUpdateCampaignValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const { inject, wsConnection: connection, workspace, user } = req;

                    const Campaign = connection.model('Campaign');

                    const campaign = await Campaign.createOrUpdate(data, data.id, { inject, connection });

                    // inject post response hooks
                    await inject('postResponse', { data, workspace, connection, inject, campaign, user });

                    return res.json({ ok: true });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Run the campaign
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    run() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'campaings.createOrUpdate'),
            Validator.validate(new RunCampaignValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const { campaignId } = req.params;

                    const data = req.body;

                    const { inject, wsConnection: connection, workspace, user } = req;

                    const Campaign = connection.model('Campaign');

                    const campaign = await Doc.resolve(campaignId, Campaign);

                    campaign.shouldRunAt = new Date();

                    await campaign.save();

                    // inject post response hooks
                    await inject('postResponse', { data, workspace, connection, inject, campaign, user });

                    return res.json({ ok: true });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Get campaign details
     * 
     * @param {*} req request
     * @param {*} res response
     */
    getOptions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'campaigns.details'),
            async function (req, res, next) {
                try {

                    const { campaignId } = req.params;
                    const { wsConnection: connection, inject } = req;

                    const Campaign = connection.model('Campaign');

                    const campaign = await Doc.resolve(campaignId, Campaign);

                    const data = {
                        ...pick(campaign, ['id', 'name', 'constraints']),
                        message: pick(campaign.message, ['id', 'content', 'latestStatus']),
                        targets: map(campaign.targets, 'target'),
                    }

                    return res.json({ ok: true, data })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Delete an existing campaign from db
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    delete() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.delete'),
            Validator.validate(new CampaignDeleteValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const { campaignId } = req.params;
                    const { wsConnection: connection, inject } = req;

                    const Campaign = connection.model('Campaign');
                    const Message = connection.model('Message');

                    // get campaign document
                    const campaign = await Campaign.findById(campaignId).populate({ path: 'message' });

                    // inject delete pre hook
                    await inject('preDelete', { campaign });

                    // delete campaign message
                    await Message.deleteOne({ _id: campaign.message.id });

                    // delete the campaign
                    await Campaign.deleteOne({ _id: campaign.id });

                    // inject delete post hook
                    await inject('postDelete');

                    // dispatch event
                    // req.event(new PersonDeleted(campaign, req.wsConnection, req.user));

                    // return response
                    return res.json({ ok: true })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = CampaignsController;