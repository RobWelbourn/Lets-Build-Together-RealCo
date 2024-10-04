/**
 * Start an attended transfer.
 */
exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();

    try {
        // Put the caller on hold.
        await client.conferences(event.ConfSid)
        .participants(event.CallSid)
        .update({ hold: true });

        // Dial out to the customer.
        const participant = await client.conferences(event.ConfSid)
        .participants.create({
            to: event.To,
            from: event.From,
            beep: false,
            earlyMedia: true
        });
        return callback(null, { result: 'success', callSid: participant.callSid })
    }
    catch (err) {
        console.error(err.message);
        return callback(err)
    }
}