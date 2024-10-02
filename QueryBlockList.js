/**
 * Test script for checking whether a phone number is on a block list, using an Airtable base.
 */
import 'dotenv/config';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_ACCESS_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

async function isOnBlockList(number) {
    try {
        const records = await base('Block List').select({
            maxRecords: 1,
            fields: ['Phone Number'],
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

const args = process.argv.slice(2);
const result = await isOnBlockList(args[0])

if (result) {
    console.log(`${args[0]} is on the block list`)
} else {
    console.log(`${args[0]} is NOT on the block list`)
}