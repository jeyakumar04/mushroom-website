require('dotenv').config();
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.log("URI NOT FOUND");
    process.exit(1);
}

const url = new URL(uri.replace('mongodb+srv://', 'http://'));
console.log("Protocol:", uri.startsWith('mongodb+srv://') ? 'SRV' : 'Direct');
console.log("Host:", url.host);
console.log("DB Name:", url.pathname.slice(1));
console.log("Query Params:", url.search);
