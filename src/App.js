import React, { useRef, useState } from 'react';
import './App.css';
import { format } from 'date-fns';  // Import date-fns for date formatting

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import avatarPic from './Images/avatar.svg';

const firebaseConfig = {
  apiKey: "AIzaSyCxdnyyN6s8gzISIhmEU9LpXLzeXh1cjHM",
  authDomain: "fb-june2024.firebaseapp.com",
  databaseURL: "https://fb-june2024-default-rtdb.firebaseio.com",
  projectId: "fb-june2024",
  storageBucket: "fb-june2024.appspot.com",
  messagingSenderId: "160080813553",
  appId: "1:160080813553:web:f7557c64b1e35a78267850",
  measurementId: "G-8KXWKMW1CT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className="appTitle"> Chat Room 💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p className="text homepageText">
        Comet Chat app, sign in with your google email to participate in the
        group chat
      </p>
      <p className="cometLogo">☄️</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();

  const recentMessagesQuery = query(
    collection(getFirestore(), 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const [messages] = useCollectionData(recentMessagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(collection(getFirestore(), 'messages'), {
      name: getAuth().currentUser.displayName,
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
  };

  return (
    <>
      <main>
      {messages &&
  messages.slice().reverse().map((msg) => (
    <ChatMessage key={msg.id} message={msg} />
  ))}


        <span ref={dummy} />
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type message"
        />

        <button type="submit" disabled={!formValue}>
          ☄️ 
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, name, createdAt, id } = message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received'; // Using optional chaining to handle null auth.currentUser

  // const handleDelete = async () => {
  //   try {
  //     console.log('Deleting message with ID:', id); // Debugging
  //     await deleteDoc(doc(db, "messages", id));
  //     console.log('Message deleted successfully');
  //   } catch (error) {
  //     console.error('Error deleting message:', error);
  //   }
  // };

  const date = createdAt ? createdAt.toDate() : new Date();
  const formattedDate = format(date, 'PPPpp'); // e.g., Jan 1, 2021 at 12:00 AM

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || avatarPic} alt="" />
      <p className="text messageBubble">
        <b className="nameTag">{`${name} Says:`}</b>
        <br /> {text}
        <br />
        <small className="timestamp">{formattedDate}</small> {/* Add this line */}
        {/* {uid === auth.currentUser?.uid && (
          <button onClick={handleDelete}>
            Delete
          </button>
        )} */}
      </p>
    </div>
  );
}

export default App;
