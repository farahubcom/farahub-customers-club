const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class VisitStoreValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            phone: {
                in: ["body"],
                isString: true,
                matches: {
                    options: /(09)[0-9]{9}/i,
                    errorMessage: "فرمت شماره همراه اشتباه می باشد."
                },
            },
        }
    }
}

module.exports = VisitStoreValidator;