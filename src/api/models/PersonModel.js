import { getPastHoursByTimestamp } from '@src/helpers/DateHelper';
import { generateInitialsHelper } from '@src/helpers/Helpers';
import { parseIntSafely } from '@src/helpers/IntegerHelper';

class PersonModel {
	constructor(data) {
		const payload = data.waba_payload;

		this.waId = data.wa_id;

		this.setName(payload?.profile?.name);

		this.lastMessageTimestamp =
			parseIntSafely(data.last_message_timestamp) ?? -1;
		this.isExpired = this.checkIfExpired();
	}

	setName(name) {
		this.name = name;
		this.initials = this.generateInitials(); //data.initials;
	}

	getPastHoursAfterLastMessage() {
		return getPastHoursByTimestamp(this.lastMessageTimestamp);
	}

	checkIfExpired() {
		return this.getPastHoursAfterLastMessage() >= 24;
	}

	generateInitials = () => {
		return generateInitialsHelper(this.name);
	};

	static newInstance() {
		return new PersonModel({});
	}
}

export default PersonModel;
