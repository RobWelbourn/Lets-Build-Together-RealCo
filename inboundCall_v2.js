/**
 * Process an inbound call to a forwarding number.
 * V2 -- Adds getting forwarding number details from Airtable, putting call info into a Sync Map.
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

    async function getForwardingEntry(number) {
        try {
            const records = await base('Forwarding').select({
                maxRecords: 1,
                filterByFormula: `({Twilio Number} = '${number}')`
            })
            .firstPage();
            return records.length > 0 ? records[0] : null
        }
        catch(err) { 
            console.error(err.message); 
            return null 
        }
    }

    async function addSyncMapEntry(key, data) {
        try {
            await client.sync.v1
            .services(context.SYNC_SERVICE_SID)
            .syncMaps(context.SYNC_MAP_SID)
            .syncMapItems.create({ key, data, ttl: 3600 });
            return true
        }
        catch (err) {
            console.error(err.message);
            return false
        }
    }
  
    const twiml = new Twilio.twiml.VoiceResponse();
    if (await isOnBlockList(event.From)) {
        twiml.reject();
        return callback(null, twiml)
    }

    if (event.From === 'anonymous') {
        twiml.say("Sorry, we don't accept calls with blocked numbers. Please unblock your number and try again.");
        return callback(null, twiml)
    }

    const forwardingEntry = await getForwardingEntry(event.To);
    if (!forwardingEntry) {
        twiml.say('Sorry, this number is not currently in service.');
        return callback(null, twiml)
    }

    // If we fail to add the call info to the Sync Map, or if there's no operator number available.
    // Simply forward the call to the customer number.
    const customerNumber = forwardingEntry.fields['Customer Number'];
    const operatorNumber = event.Operator;
    const synced = addSyncMapEntry(event.From, { callerSid: event.CallSid, customerNumber, operatorNumber });
    if (!synced || !operatorNumber) {
        twiml.dial(customerNumber);
        return callback(null, twiml)
    }

    twiml.dial().conference({ endConferenceOnExit: true }, event.CallSid)
    return callback(null, twiml)
}