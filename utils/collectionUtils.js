// utils/collectionUtils.js
const checkCollectionExists = async (db, collectionName) => {
    try {
      if (!db) throw new Error("Database not initialized");
      const collections = await db.listCollections({ name: collectionName }).toArray();
      return collections.length > 0;
    } catch (error) {
      console.error(`Error checking collection ${collectionName} existence:`, error);
      return false;
    }
  };
  
  module.exports = { checkCollectionExists };
  