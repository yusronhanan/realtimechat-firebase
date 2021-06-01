import React, { useRef, useState } from 'react';
import './App.css';

//FIREBASE SDK
import firebase from 'firebase/app';
import 'firebase/firestore'; // database
import 'firebase/auth'; // authentication

//HOOKS - to make it easier work with firebase and react
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

var firebaseConfig = {
  //FirebaseConfig is not for public
  apiKey: "AIzaSyDG-mdSo-Bur-HmVa5tX1wgcowE8qsQ02U",
  authDomain: "realtimechat-firebase-react.firebaseapp.com",
  projectId: "realtimechat-firebase-react",
  storageBucket: "realtimechat-firebase-react.appspot.com",
  messagingSenderId: "959077768405",
  appId: "1:959077768405:web:b6f9aa91cbad443bf7165c",
  measurementId: "G-XRNBNZQTBE"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  // deploy it: firebase deploy --only functions
  // but its error. since using firebase, it should be pay-as-you-go to be deployed
  // now just npm start
  const [user] = useAuthState(auth) // signed in user is and object, null otherwise (signed out)

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {/* if user signed in, show ChatRoom. SignIn otherwise  */}
        {user ? <ChatRoom /> : <SignIn />}

      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider); // pop up sign in w/ google
  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef()
  const messageRef = firestore.collection('messages') // reference a firestore collection
  const query = messageRef.orderBy('createdAt').limit(25)

  const [messages] = useCollectionData(query, { idField: 'id' }) // listen to data with hook

  const [formValue, setFormValue] = useState('')

  const sendMessage = async (e) => {
    e.preventDefault()
    const { uid, photoURL } = auth.currentUser

    //create new document in firestore, in this case is 'sendMessage'
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type="submit">🕊</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL}></img>
        <p>{text}</p>
      </div>
    </>
  )
}

export default App;
