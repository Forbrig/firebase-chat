import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

// this is trash, every client will try to delete the inactive users
const cleanupInactiveUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const now = Date.now();

  usersSnapshot.forEach(async (userDoc) => {
    const playerData = userDoc.data();
    if (now - playerData.lastActive > 30000) {
      // If player hasn't updated in 30s, remove them
      try {
        await deleteDoc(doc(db, "users", userDoc.id));
      } catch (error) {
        console.error(`Failed to delete user ${userDoc.id}:`, error);
      }
    }
  });
};

// Run cleanup every 60 seconds
setInterval(cleanupInactiveUsers, 60000);
