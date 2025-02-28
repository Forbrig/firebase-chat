import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase"; // Firestore collection for players
import { v4 as uuidv4 } from "uuid";

const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const peerConnection = new RTCPeerConnection(servers);
const roomId = "chat-room";
const roomRef = doc(collection(db, "rooms"), roomId);
const playersRef = collection(db, "players");

export const startChat = async () => {
  onSnapshot(roomRef, async (snapshot) => {
    const data = snapshot.data();
    if (data?.offer && !peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      await setDoc(roomRef, { answer }, { merge: true });
    }
  });

  onSnapshot(roomRef, async (snapshot) => {
    const data = snapshot.data();
    if (data?.answer && !peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(data.answer);
    }
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  await setDoc(roomRef, { offer });
};

export const joinChat = async (playerName: string): Promise<string> => {
  // Check if the name is already taken
  const playersSnapshot = await getDocs(playersRef);
  const nameTaken = playersSnapshot.docs.some(
    (doc) => doc.data().name === playerName
  );

  if (nameTaken) {
    throw new Error("Name is already taken");
  }

  const playerId = uuidv4(); // Generate unique player ID
  const playerDocRef = doc(playersRef, playerId);

  // Add player with lastActive timestamp
  await setDoc(playerDocRef, {
    name: playerName,
    uuid: playerId,
    joinedAt: Date.now(),
    lastActive: Date.now(),
  });

  // Update "lastActive" every 10 seconds
  setInterval(async () => {
    await updateDoc(playerDocRef, { lastActive: Date.now() });
  }, 10000);

  return playerId;
};

peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    setDoc(roomRef, { candidate: event.candidate }, { merge: true });
  }
};

onSnapshot(roomRef, async (snapshot) => {
  const data = snapshot.data();
  if (data?.candidate) {
    await peerConnection.addIceCandidate(data.candidate);
  }
});

window.addEventListener("beforeunload", async () => {
  await deleteDoc(roomRef);
});
