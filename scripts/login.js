import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


const firebase_config = {
    apiKey: "AIzaSyC43WNubF79aEGwdOR1TTE1q04dLLnbx6I",
    authDomain: "movie-library-459ac.firebaseapp.com",
    projectId: "movie-library-459ac",
    storageBucket: "movie-library-459ac.firebasestorage.app",
    messagingSenderId: "872591315249",
    appId: "1:872591315249:web:88c076573b5bcf70166010",
    measurementId: "G-BKKMTYLCKJ"
};

const app = initializeApp(firebase_config);
const auth = getAuth();

const user_name_field = document.getElementById("username-field");
const password_field = document.getElementById("password-field");
const confirm_password_filed = document.getElementById("confirm-password-field");

const sign_up_btn = document.getElementById("sign-up-btn");
const log_in_btn = document.getElementById("log-in-btn");

const sign_up_link = document.querySelector(".sign-up-link");
const log_in_link = document.querySelector(".log-in-link");

const operation_type = document.querySelector(".operation-type");
const info_span = document.querySelector(".info-span");

const showErrorMsg = (message) => {
    document.getElementById("validation-container").style.display = "flex";
    document.getElementById("validation-container").textContent = message;
}

sign_up_link.addEventListener("click", (e) => {
    e.preventDefault();

    operation_type.textContent = "Sign up";
    log_in_btn.style.display = "none";
    sign_up_btn.style.display = "flex";
    user_name_field.style.display = "inline-block";
    confirm_password_filed.style.display = "inline-block";

    log_in_link.style.display = "flex";
    sign_up_link.style.display = "none";
    info_span.textContent = "You have an accout?";
});

log_in_link.addEventListener("click", (e) => {
    e.preventDefault();

    operation_type.textContent = "Log in";
    log_in_btn.style.display = "flex";
    sign_up_btn.style.display = "none";
    user_name_field.style.display = "none";
    confirm_password_filed.style.display = "none";

    log_in_link.style.display = "none";
    sign_up_link.style.display = "flex";
    info_span.textContent = "You don't have an accout?";
});

sign_up_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    
    const fields = document.querySelectorAll(".authhenticator-field");

    const email = fields[0].value;
    const username = fields[1].value;
    const password = fields[2].value;
    const confirm_password = fields[3].value;

    if (password !== confirm_password) {
        showErrorMsg("The passwords do not match");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;

        updateProfile(auth.currentUser, {
            displayName: username,
            photoURL: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fad%2F0d%2F24%2Fad0d24cc5fd5909e1a68e7d9c38f34aa.png&f=1&nofb=1&ipt=1da3f6c787a3f428b93abf2b84232a610a8ac11f2f50741f7d39dc5e8a3f2c67&ipo=images",
          }).then(() => {
            window.location="./index.html"
          }).catch((error) => {
            console.log("Error:" + error);
          });
          
    })
    .catch((error) => {
        const error_code = error.code;

        switch (error_code) {
            case "auth/email-already-in-use": {
                showErrorMsg("The email is already in use");
                break;
            }
            case "auth/invalid-email": {
                showErrorMsg("The email is invalid");
                break;
            }
            case "auth/missing-email": {
                showErrorMsg("Missing email");
                break;
            }
            case "auth/missing-password": {
                showErrorMsg("Missing password");
                break;
            }
        }
    });
});

log_in_btn.addEventListener("click", e => {
    e.preventDefault();

    const fields = document.querySelectorAll(".authhenticator-field");

    const email = fields[0].value;
    const password = fields[2].value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        window.location="./index.html";
    })
    .catch((error) => {
        const error_code = error.code;
        

        switch (error_code) {
            case "auth/email-already-in-use": {
                showErrorMsg("The email is already in use");
                break;
            }
            case "auth/invalid-credential": {
                showErrorMsg("The email or the password is incorrect");
                break;
            }
            case "auth/missing-password": {
                showErrorMsg("Missing password");
                break;
            }
        }
    });
});