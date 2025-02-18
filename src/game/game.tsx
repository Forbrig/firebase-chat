import { useEffect, useState } from "react";
import { joinGame } from "./network";
import { db } from "../firebase/firebase";
import { collection, DocumentData, onSnapshot } from "firebase/firestore";

import "./cleanup";

import styles from "./game.module.scss";

const Game = () => {
  const [players, setPlayers] = useState<DocumentData[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const tryJoinGame = async (name: string) => {
    try {
      const playerId = await joinGame(name);
      setPlayerId(playerId);
    } catch (error) {
      alert((error as Error).message);
      const name = prompt("Enter your name:");
      name && tryJoinGame(name);
    }
  };

  useEffect(() => {
    const name = prompt("Enter your name:");

    name && tryJoinGame(name);

    // Listen for player updates
    const unsubscribe = onSnapshot(collection(db, "players"), (snapshot) => {
      const playersList = snapshot.docs.map((doc) => doc.data());
      setPlayers(playersList);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  return (
    <div>
      <h2>Players in Chat:</h2>

      <table className={styles.players}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Joined At</th>
            <th>Last Active</th>
          </tr>
        </thead>

        <tbody>
          {players.map((player, index) => (
            <tr key={index} data-is-me={player.uuid === playerId}>
              <td>{player.name}</td>
              <td>{new Date(player.joinedAt).toLocaleString()}</td>
              <td>{new Date(player.lastActive).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Game;
