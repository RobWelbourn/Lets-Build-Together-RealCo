/**
 * Complete an attended transfer.
 */
exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();

    try {
        // Take the caller off hold.
        await client.conferences(event.ConfSid)
        .participants(event.CallSid)
        .update({ hold: false });
        return callback(null, { result: 'success' })
    }
    catch (err) {
        console.error(err.message);
        return callback(err)
    }
}