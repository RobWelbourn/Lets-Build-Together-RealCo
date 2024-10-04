/**
 * Disconnect the inbound call.
 */
exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();
    try {
        await client.calls(event.CallSid).update({ status: 'completed' });
        return callback(null, { result: 'success' })
    }
    catch (err) {
        console.error(err.message);
        return callback(err)
    }
}