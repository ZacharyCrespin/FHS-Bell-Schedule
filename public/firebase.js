import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-analytics.js";
import { getPerformance } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-performance.js";
const firebaseConfig = {
    apiKey: "AIzaSyB73eoFDtFuZ1ZSZh2-bbd3cO8-h6m9ZP4",
    authDomain: "fhsbellschedule.firebaseapp.com",
    projectId: "fhsbellschedule",
    storageBucket: "fhsbellschedule.appspot.com",
    messagingSenderId: "852822167920",
    appId: "1:852822167920:web:808c39370f80b99f25bfb5",
    measurementId: "G-MD01DM4D40"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const perf = getPerformance(app);