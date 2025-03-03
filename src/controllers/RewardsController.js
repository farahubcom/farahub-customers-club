const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace, Doc } = require('@farahub/framework/facades');
const RewardListValidator = require('../validators/RewardListValidator');
const CreateOrUpdateRewardValidator = require('../validators/CreateOrUpdateRewardValidator');
const pick = require('lodash/pick');


class RewardsController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Rewards';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/rewards';

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
            method: 'get',
            path: '/options',
            handler: 'getOptions',
        },
        {
            type: 'api',
            method: 'post',
            path: '/',
            handler: 'createOrUpdate',
        },
    ]

    /**
     * List of rewards match params
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'rewards.list'),
            Validator.validate(new RewardListValidator()),
            async (req, res, next) => {
                try {

                    // const { wsConnection: connection } = req;

                    // const Reward = connection.model('Reward');

                    // const args = req.query;

                    // let search = {
                    //     //
                    // }

                    // if (args && args.query && args.query !== '') {
                    //     search = {
                    //         ...search,
                    //         name: { $regex: args.query + '.*' }
                    //     }
                    // }

                    // const sort = args && args.sort ? args.sort : "-createdAt";

                    // const populationInjections = await req.inject('populate');

                    // const query = Reward.find(search)
                    //     .select('-__v')
                    //     .populate([
                    //         { path: 'targets.target' },
                    //         ...(populationInjections || [])
                    //     ]);

                    // query.sort(sort);

                    // const total = await Reward.find(search).count();

                    // if (args && args.page > -1) {
                    //     const perPage = args.perPage || 25;
                    //     query.skip(args.page * perPage)
                    //         .limit(perPage)
                    // }

                    // let data = await query.lean({ virtuals: true });

                    // data = Lang.translate(data);

                    return res.json({ ok: true, data: [], total: 0 })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Create or upadte an existing reward
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
            Injection.register(this.module, 'rewards.getOptions'),
            Event.register(this.module),
            async function (req, res, next) {
                try {
                    const { workspace } = req;

                    const Message = req.wsConnection.model('Message');

                    const rewardsOption = workspace.getOption("customers-club:reward_rewards", []);
                    const rewards = await Promise.all(
                        rewardsOption.map(async function(reward) {
                            const message = await Doc.resolve(reward.message, Message);

                            return {
                                ...reward,
                                message: {
                                    ...pick(message, ['id', 'content']),
                                    ...(message.latestStatus ? {
                                        status: message.latestStatus.status,
                                        status_description: message.latestStatus.description,
                                    } : {})
                                }
                            };
                        })
                    )

                    const data = {
                        rewards,
                        active: workspace.getOption("customers-club:reward_active", false),
                    }

                    return res.json({ ok: true, data });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Create or upadte an existing reward
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
            Injection.register(this.module, 'rewards.createOrUpdate'),
            Validator.validate(new CreateOrUpdateRewardValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const Message = req.wsConnection.model('Message');

                    await Promise.all(
                        data.rewards.map(async function(reward) {

                            const message = reward.message.id ? await Doc.resolve(reward.message.id, Message) : new Message({ type: "reward" });
                            message.content = reward.message?.content;
                            await message.save();

                            reward.message = message.id;

                            return reward;
                        })
                    )

                    req.workspace.setOptions({
                        "customers-club:reward_rewards": data.rewards,
                        "customers-club:reward_active": data.active
                    })

                    return res.json({ ok: true });

                    return;
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = RewardsController;