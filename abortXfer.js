/**
 * Abort an attended transfer.
 */
exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();

    try {
        // Disconnect the customer call leg
        await client.calls(event.CustomerSid).update({ status: 'completed' });

        // Take the caller off hold.
        await client.conferences(event.ConfSid)
        .participants(event.CallerSid)
        .update({ hold: false });
        return callback(null, { result: 'success' })
    }
    catch (err) {
        console.error(err.message);
        return callback(err)
    }
}