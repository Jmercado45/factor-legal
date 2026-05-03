import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyDk1q5q5ATVnN4lbETwXG8hSgG69DgopdI",
  authDomain:        "factor-legal.firebaseapp.com",
  projectId:         "factor-legal",
  storageBucket:     "factor-legal.firebasestorage.app",
  messagingSenderId: "399818050871",
  appId:             "1:399818050871:web:5aceb9f9527c46421f5eb2"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
