/**
 * Test script for getting a Forwarding table entry from an Airtable base.
 */
import 'dotenv/config';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_ACCESS_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

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

const args = process.argv.slice(2);
const result = await getForwardingEntry(args[0])

if (result) {
    const twilioNumber   = result.fields['Twilio Number'];
    const customerNumber = result.fields['Customer Number'];
    const businessName   = result.fields['Business Name'];
    const contactName    = result.fields['Contact Name'];
    console.log(`Twilio number: ${twilioNumber}  Customer number: ${customerNumber}  Business name: ${businessName}  Contact name: ${contactName}`);
} else {
    console.log(`${args[0]} not found`)
}