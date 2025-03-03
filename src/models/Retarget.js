const pick = require("lodash/pick");

class Retarget {
	/**
	 * Create new or update an exsiting retarget
	 *
	 * @param {Object} data data
	 * @param {string} retargetId updating retarget
	 * @param {Object} request request object
	 * @returns modified retarget
	 */
	static async createOrUpdate(data, retargetId, { connection, inject }) {
		try {
			const Retarget = this.model("Retarget");

			// create or get instance
			const retarget = retargetId
				? await Retarget.findById(retargetId).poulate('message')
				: new Retarget();

			// assign other fields
			Object.keys(
				pick(data, ["name", "consecutiveNonReferralCount", "active"])
			).forEach((key) => {
				retarget[key] = data[key];
			});

            // assign message
			const Message = this.model('Message');
			const message = retarget.message ?? new Message({ type: "retarget" });
			message.content = data.message?.content;
			await message.save();
			
			// set retarget message
			retarget.message = message.id;

			// inject pre save hooks
			await inject("preSave", { data, connection, inject, retarget });

			// save the changed
			await retarget.save();

			// inject post save hooks
			await inject("postSave", { data, connection, inject, retarget });

			// return modified retarget
			return retarget;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = Retarget;
