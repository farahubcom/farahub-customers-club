const { toLower } = require("lodash");
const pick = require("lodash/pick");

class Loyalty {
	/**
	 * Create new or update an exsiting loyalty
	 *
	 * @param {Object} data data
	 * @param {string} loyaltyId updating loyalty
	 * @param {Object} request request object
	 * @returns modified product
	 */
	static async createOrUpdate(data, loyaltyId, { connection, inject }) {
		try {
			const Loyalty = this.model("Loyalty");

			// create or get instance
			const loyalty = loyaltyId
				? await Loyalty.findById(loyaltyId)
				: new Loyalty();

			// assign other fields
			Object.keys(
				pick(data, ["name"])
			).forEach((key) => {
				loyalty[key] = data[key];
			});

			// assign steps
			data.steps.forEach((step, index) => {
				loyalty['steps'][index] = pick(step, ["content", "active", "consecutiveVisitNumber"])
			})

			// inject pre save hooks
			await inject("preSave", { data, connection, inject, loyalty });

			// save the changed
			await loyalty.save();

			// inject post save hooks
			await inject("postSave", { data, connection, inject, loyalty });

			// return modified loyalty
			return loyalty;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Loyalty;
