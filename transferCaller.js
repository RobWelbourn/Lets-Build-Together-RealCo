/**
 * Transfer the inbound call.
 */
exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();
    try {
        await client.calls(event.CallSid).update({ twiml: `<Response><Dial>${event.To}</Dial></Response>` });
        return callback(null, { result: 'success' })
    }
    catch (err) {
        console.error(err.message);
        return callback(err)
    }
}