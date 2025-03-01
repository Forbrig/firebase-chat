import { useEffect, useState } from "react";
import {
  collection,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

import "../../utils/cleanup"; // call this to trigger a loop for cleanup of inactive users

import { db } from "../../firebase/firebase"; // Firestore collection for players

const usersRef = collection(db, "users");

export const useNetwork = () => {
  const [user, setUser] = useState<DocumentData | null>(null);
  const [users, setUsers] = useState<DocumentData[]>([]);

  const joinChat = async (playerName: string): Promise<void> => {
    // Check if the name is already taken
    const playersSnapshot = await getDocs(usersRef);
    const nameTaken = playersSnapshot.docs.some(
      (doc) => doc.data().name === playerName
    );

    if (nameTaken) {
      throw new Error("Name is already taken");
    }

    const userId = uuidv4(); // Generate unique player ID
    const usersDocRef = doc(usersRef, userId);

    const userData = {
      name: playerName,
      uuid: userId,
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };

    // Add player with lastActive timestamp
    await setDoc(usersDocRef, userData);
    setUser(userData);

    // Update "lastActive" every 10 seconds
    setInterval(async () => {
      await updateDoc(usersDocRef, { lastActive: Date.now() });
    }, 10000);
  };

  useEffect(() => {
    // Listen for player updates
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => doc.data());
      setUsers(usersList);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return {
    user,
    users,
    // startChat,
    joinChat,
  };
};
