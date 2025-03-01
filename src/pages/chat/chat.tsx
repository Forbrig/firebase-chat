import { useEffect, useState } from "react";

import { useNetwork } from "../../hooks/useNetwork";

import { SigninModal } from "../../components/SigninModal";

import styles from "./chat.module.scss";

export const Chat = () => {
  const { joinChat, user, users } = useNetwork();

  const [isSigninModalOpen, setIsSigninModalOpen] = useState(false);

  const tryJoinGame = async (name: string) => {
    try {
      await joinChat(name);
    } catch (error) {
      alert((error as Error).message);
      setIsSigninModalOpen(true);
    }
  };

  const handleSigninClick = (name: string) => {
    tryJoinGame(name);
    setIsSigninModalOpen(false);
  };

  useEffect(() => {
    if (!user) {
      setIsSigninModalOpen(true);
    }
  }, []);

  return (
    <>
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
            {users.map((_user, index) => (
              <tr key={index} data-is-me={user?.uuid === _user.uuid}>
                <td>
                  {_user.name} {_user.uuid === user?.uuid && "(You)"}
                </td>
                <td>{new Date(_user.joinedAt).toLocaleString()}</td>
                <td>{new Date(_user.lastActive).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isSigninModalOpen && (
        <SigninModal handleSigninClick={handleSigninClick} />
      )}
    </>
  );
};
