const mongoose = require('mongoose');
const checkCollections = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/tjp_mushroom_local');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections in tjp_mushroom_local:');
        collections.forEach(c => console.log(`- ${c.name}`));

        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`  Count for ${col.name}: ${count}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
checkCollections();
