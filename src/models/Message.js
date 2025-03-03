const pick = require("lodash/pick");

class Message {
	/**
	 * Create new or update an exsiting message
	 *
	 * @param {Object} data data
	 * @param {string} messageId updating message
	 * @param {Object} request request object
	 * @returns modified product
	 */
	static async createOrUpdate(data, messageId, { connection, inject }) {
		try {
			const Message = this.model("Message");

			// create or get instance
			const message = messageId
				? await Message.findById(messageId)
				: new Message();

			// assign other fields
			Object.keys(
				pick(data, ["name", "content", "options"])
			).forEach((key) => {
				message[key] = data[key];
			});

			// inject pre save hooks
			await inject("preSave", { data, connection, inject, message });

			// save the changed
			await message.save();

			// inject post save hooks
			await inject("postSave", { data, connection, inject, message });

			// return modified message
			return message;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Get latest status
	 */
	get latestStatus() {
		return this.statuses[this.statuses.length - 1];
	}
}

module.exports = Message;
