import { getAuth, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { push, getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const firebase_config = {
    apiKey: "AIzaSyC43WNubF79aEGwdOR1TTE1q04dLLnbx6I",
    authDomain: "movie-library-459ac.firebaseapp.com",
    projectId: "movie-library-459ac",
    storageBucket: "movie-library-459ac.firebasestorage.app",
    messagingSenderId: "872591315249",
    appId: "1:872591315249:web:88c076573b5bcf70166010",
    measurementId: "G-BKKMTYLCKJ",
    databaseURL: "https://movie-library-459ac-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebase_config);
const auth = getAuth();
const db = getDatabase();

// ########################################################################################
// TODO: CHECK IF MOVIE IS ADDED AND IF SO, ADD DELETE MOVIE BUTTON

const API = "http://www.omdbapi.com/?apikey=d551c863&";
let url = new URL(window.location.href);
let params = new URLSearchParams(url.search);
const title = params.get("title");


onAuthStateChanged(auth, (user) => {
    if (user) { 
        console.log(user.displayName);
        loadMovie(title);

    } else {
        window.location.href = "./login.html";
        alert("Please login to view this page");
    }

    function loadMovie(title) {
        fetch(`${API}t=${title}`)
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            document.title = data.Title;
            document.getElementById("movie-poster").setAttribute("src", `${data.Poster}`);
            document.getElementById('movie-title').textContent = data.Title;
            document.getElementById('movie-year').textContent = `Year: ${data.Year}`;
            document.getElementById('movie-genre').textContent = `Genre: ${data.Genre}`;
            document.getElementById('movie-plot').textContent = `Plot: ${data.Plot}`;
            document.getElementById('movie-director').textContent = `Director: ${data.Director}`;
            document.getElementById('movie-actors').textContent = `Actors: ${data.Actors}`;
            document.getElementById('movie-rating').textContent = `Rating: ${data.imdbRating}`;

            const movie_data = {
                Title: data.Title,
                Year: data.Year,
                Genre: data.Genre,
                Plot: data.Plot,
                Director: data.Director,
                Actors: data.Actors,
                Rating: data.imdbRating,
                Poster: data.Poster,
            }
            
            document.getElementById('watched-btn').addEventListener('click', () => {
                const refrence = ref(db, 'Users/' + `${user.displayName}/`+ "Watched/" + title);
                set(refrence, movie_data);
            });

            document.getElementById('like-btn').addEventListener('click', () => {
                const refrence = ref(db, 'Users/' + `${user.displayName}/`+ "Favourite/" + title);
                set(refrence, movie_data);
            
            });
        })
        .catch((err) => console.error(err));
    }
});

