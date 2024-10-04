/**
 * Get data out of a Sync Map, using the From number as the key.
 */
exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();
    
    try {
      const mapEntry = await client.sync.v1
      .services(context.SYNC_SERVICE_SID)
      .syncMaps(context.SYNC_MAP_SID)
      .syncMapItems(event.From)
      .fetch();
      await client.sync.v1      // Delete after use
      .services(context.SYNC_SERVICE_SID)
      .syncMaps(context.SYNC_MAP_SID)
      .syncMapItems(event.From)
      .remove();
      return callback(null, mapEntry.data)
    }
    catch (err) {
      console.error(err.message);
      return callback(err)
    }
  }