/**
 * Process an inbound call to a forwarding number.
 * V1 -- Reject blocked numbers, otherwise add the call to a conference.
 */
exports.handler = async function(context, event, callback) {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: context.AIRTABLE_ACCESS_TOKEN }).base(context.AIRTABLE_BASE_ID);
    const client = context.getTwilioClient();
  
    async function isOnBlockList(number) {
        try {
            const records = await base('Block List').select({
                maxRecords: 1,
                filterByFormula: `({Phone Number} = '${number}')`
            })
            .firstPage();
            return records.length > 0
        }
        catch(err) { 
            console.error(err.message); 
            return false 
        }
    }
  
    const twiml = new Twilio.twiml.VoiceResponse();
    if (await isOnBlockList(event.From)) {
      twiml.reject()
    } else {
      twiml.dial().conference({ endConferenceOnExit: true }, event.CallSid)
    }
    return callback(null, twiml)
}