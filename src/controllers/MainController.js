const { Controller } = require('@farahub/framework/foundation');
const { Injection, Auth, Workspace, Crypt } = require('@farahub/framework/facades');


class MainController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Main';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/dashboard/options',
            handler: 'getDashboardOptions',
        },
        {
            type: 'api',
            method: 'post',
            path: '/add-credit',
            handler: 'addCredit',
        },
        {
            type: 'api',
            method: 'post',
            path: '/add-credit/verify',
            handler: 'addCreditVerify',
        },
    ]

    /**
     * Payment request token key name
     * 
     * @var string
     */
    _paymentRequestTokenKeyName = "PAYMENT-REQUEST-TOKEN";

    /**
     * Payment result token key name
     * 
     * @var string
     */
    _paymentResultTokenKeyName = "PAYMENT-RESULT-TOKEN";

    /**
     * Get dashboard options
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    getDashboardOptions() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app, true),
            Injection.register(this.module, 'main.getDashboardOptions'),
            async function (req, res, next) {
                try {
                    const Person = req.wsConnection.model('Person');

                    const data = {
                        total_customers: await Person.find().count(),
                        total_revisited_customers: await Person.find({ "references.1": { $exists: true }}).count(),
                        total_customers_with_birthday: await Person.find({ bornAt: { $exists: true, $ne: null }}).count(),
                    }

                    return res.json({ ok: true, data });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Add sms credit of the workspace
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    addCredit() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.addCredit'),
            // Validator.validate(new SubscribeValidator(this.app)),
            async function (req, res, next) {
                try {
                    const { creditAmount, giftAmount, returnUrl } = req.body;

                    const creditAmountInRials = creditAmount * 10;
                    const taxAmountInRials = creditAmountInRials / 10;
                    const toPayInRials = creditAmountInRials + taxAmountInRials;

                    const Payment = this.app.connection.model('Payment');

                    const requestToken = Crypt.encryptJson({ creditAmount, giftAmount, returnUrl }, this._paymentRequestTokenKeyName);

                    const data = {
                        Amount: toPayInRials,
                        CallbackURL: `http://api.farahub.local/customers-club/add-credit/verify?token=${requestToken}&workspace-id=${req.workspace.id}&auth-token=${req.headers.authorization.split(' ')[1]}`,
                        Description: 'افزایش اعتبار پیامکی',
                        // Email: '',
                        // Mobile: ''
                    }

                    const response = await Payment.request(data);

                    if (response.status === 100) {

                        await Payment.create({
                            amount: toPayInRials,
                            authority: response.authority,
                            createdAt: new Date()
                        });

                        return res.json({
                            ok: true,
                            redirectUrl: response.url
                        });
                    }

                    return res.json({ ok: false });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Verify add credit payment
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    addCreditVerify() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'main.addCreditVerify'),
            // Validator.validate(new VerifySubscriptionValidator(this.app)),
            async function (req, res, next) {
                try {
                    const { Authority, Status, token: requestToken } = req.query;

                    const { creditAmount, giftAmount, returnUrl } = Crypt.decryptJson(requestToken, this._paymentRequestTokenKeyName);

                    const Payment = this.app.connection.model('Payment');
                    const payment = await Payment.findOne({ authority: Authority });

                    if (!payment || !Authority || !Status) {
                        // const resultToken = Crypt.encryptJson({
                        //     ok: false,
                        //     result: 'عملیات پرداخت ناموفق',
                        //     message: 'متاسفانه عملیات پرداخت انجام نشد',
                        //     returnUrl
                        // }, this._paymentResultTokenKeyName);
                        return res.redirect(301, returnUrl);
                        // return res.redirect(`/payment/result?token=${resultToken}&workspace-id=${req.workspace.id}`);
                    }

                    const response = await Payment.verify({
                        Amount: payment.amount,
                        Authority: payment.authority,
                    });

                    if (response.status >= 100 && response.RefID) {

                        let credit = req.workspace.getOption("customers-club:credit", 0);
                        credit += Number(creditAmount) + Number(giftAmount);
                        await req.workspace.setOption("customers-club:credit", credit);

                        payment.refID = response.RefID;
                        payment.paidAt = new Date();
                        await payment.save();

                        // const resultToken = Crypt.encryptJson({
                        //     ok: true,
                        //     result: 'عملیات پرداخت موفق',
                        //     message: 'عملیات پرداخت با موفقیت انجام شد',
                        //     returnUrl,
                        //     extra: { 'شماره پیگیری': response.RefID }
                        // }, this._paymentResultTokenKeyName);
                        // return res.redirect(`/payment/result?token=${resultToken}&workspace-id=${req.workspace.id}`);
                        return res.redirect(301, returnUrl);

                    }

                    // const resultToken = Crypt.encryptJson({
                    //     ok: false,
                    //     result: 'عملیات پرداخت ناموفق',
                    //     message: 'متاسفانه عملیات پرداخت انجام نشد',
                    //     returnUrl,
                    // }, this._paymentResultTokenKeyName);
                    // return res.redirect(`/payment/result?token=${resultToken}&workspace-id=${req.workspace.id}`);
                    return res.redirect(301, returnUrl);
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = MainController;