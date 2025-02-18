import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

// this is trash, every client will try to delete the inactive players
const cleanupInactivePlayers = async () => {
  const playersSnapshot = await getDocs(collection(db, "players"));
  const now = Date.now();

  playersSnapshot.forEach(async (playerDoc) => {
    const playerData = playerDoc.data();
    if (now - playerData.lastActive > 30000) {
      // If player hasn't updated in 30s, remove them
      try {
        await deleteDoc(doc(db, "players", playerDoc.id));
      } catch (error) {
        console.error(`Failed to delete player ${playerDoc.id}:`, error);
      }
    }
  });
};

// Run cleanup every 60 seconds
setInterval(cleanupInactivePlayers, 60000);
