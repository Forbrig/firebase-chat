import { FC, useState } from "react";

import styles from "./SigninModal.module.scss";

interface ISigninModal {
  handleSigninClick: (name: string) => void;
}

export const SigninModal: FC<ISigninModal> = ({ handleSigninClick }) => {
  const [name, setName] = useState("");

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Sign in to Chat</h2>
        <form onSubmit={() => handleSigninClick(name)}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
};
