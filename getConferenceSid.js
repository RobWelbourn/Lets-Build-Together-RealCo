/**
 * Get a conference SID from its friendly name.
 */
exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();
    try {
        const conferences = await client.conferences.list({
            friendlyName: event.ConfName,
            limit: 1,
        });
        if (conferences.length > 0) {
            return callback(null, { result: 'success', confSid: conferences[0].sid })
        } else {
            console.error(`Unable to find conference named ${event.ConfName}`);
            return callback(null, { result: 'failure' })
        }
    }
    catch (err) {
        console.error(err.message);
        return callback(err)
    }
}