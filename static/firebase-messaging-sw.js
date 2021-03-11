/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// firebase.initializeApp({
//   messagingSenderId: 'your sender id',
// });
//
// firebase.messaging();

var firebaseConfig = {
  apiKey: "AIzaSyCP-hp9tsCG3tfcF90P7_7K5CprLkWjwUI",
  authDomain: "cristmasapp-1d61d.firebaseapp.com",
  databaseURL: "https://cristmasapp-1d61d.firebaseio.com",
  projectId: "cristmasapp-1d61d",
  storageBucket: "cristmasapp-1d61d.appspot.com",
  messagingSenderId: "243739833086",
  appId: "1:243739833086:web:db0253c66b7949df63ebaf"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);