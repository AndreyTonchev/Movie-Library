import { getAuth, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { get, getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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


const API = "http://www.omdbapi.com/?apikey=d551c863&";
let url = new URL(window.location.href);
let params = new URLSearchParams(url.search);

const title = params.get("title");
const year = params.get("year");
const fav_btn = document.getElementById('favourite-btn');
const watched_btn = document.getElementById('watched-btn');


onAuthStateChanged(auth, (user) => {
    if (user) { 
        console.log(user.displayName);
        loadMovie(title);

    } else {
        window.location.href = "./login.html";
        alert("Please login to view this page");
    }
});


async function loadMovie(title) {
    const user = auth.currentUser;
    try {
        const res = await fetch(`${API}t=${title}&y=${year}`);
        const data = await res.json();

        const movie_data = data.Response === "True" ? getDataFromAPI(data) : await getDataFromDB(title);

        if (movie_data.isAdded && movie_data.addedBy === user.displayName) {
            const remove_btn = document.getElementById('remove-btn');
            remove_btn.style.display = "block";
            remove_btn.addEventListener("click", () => removeAddedMovie(title));
        }

        if (movie_data) {
            setValues(movie_data);  
        } else {
            alert("Movie data not available.");
        }

        setWatchedBtn(movie_data);
        setFavouriteBtn(movie_data);

    } catch (err) {
        console.error(err);
    }
}

function getDataFromAPI(data) {
    const movie_data = {
        Title: data.Title,
        Year: data.Year,
        Genre: data.Genre,
        Plot: data.Plot,
        Director: data.Director,
        Actors: data.Actors,
        imdbRating: data.imdbRating,
        Poster: data.Poster,
    }

    return movie_data;
}

async function getDataFromDB(title) {
    const refrence = ref(db, 'Movies/AddedMovies/' + title);
    const snapshot = await get(refrence);

        if (snapshot.exists()) {
            console.log(snapshot.val());
            return snapshot.val();
        }
        else {
            alert("Movie not found");
        }
}

function setValues(data) {
    document.title = data.Title;
    document.getElementById("movie-poster").setAttribute("src", data.Poster);
    document.getElementById('movie-title').textContent = data.Title ?? "N/a";   
    document.getElementById('movie-year').textContent = data.Year ?? "N/a";
    document.getElementById('movie-genre').textContent = data.Genre ?? "N/a";
    document.getElementById('movie-plot').textContent = data.Plot ?? "N/a";
    document.getElementById('movie-director').textContent = data.Director ?? "N/a";
    document.getElementById('movie-actors').textContent = data.Actors ?? "N/a";
    document.getElementById('movie-rating').textContent = data.imdbRating ?? "N/a";
}

function removeAddedMovie(title) {
    const refrence = ref(db, 'Movies/AddedMovies/' + title);
    set(refrence, null);
    window.location.href = "./index.html";
}


async function setWatchedBtn(movie_data) {
    const user = auth.currentUser;
    const path = 'Users/' + `${user.displayName}/Watched/` + movie_data.Title;

    const res = await exist(path);

    if (res === true) {
        watched_btn.setAttribute("selected","");
    }

    watched_btn.addEventListener('click',async () => {
        const watched_ref = ref(db, path);
        if (await exist(path)) {
            set(watched_ref, null);
            watched_btn.removeAttribute("selected");

        } else {
            set(watched_ref, movie_data);
            watched_btn.setAttribute("selected","");
        }
    });
}

async function setFavouriteBtn(movie_data) {
    const user = auth.currentUser;
    const path = 'Users/' + `${user.displayName}/Favourite/` + movie_data.Title;

    const res = await exist(path);

    if (res === true) {
        fav_btn.setAttribute("selected","");
    }


    fav_btn.addEventListener('click',async () => {
        const favourite_ref = ref(db, path);
        if (await exist(path)) {
            set(favourite_ref, null);
            fav_btn.removeAttribute("selected");

        } else {
            set(favourite_ref, movie_data);
            fav_btn.setAttribute("selected","");
        }
    });
}

async function exist(path) {
    const reference = ref(db, path);
    try {
        const snapshot = await get(reference);      
        return snapshot.exists();                    
    } catch (error) {
        console.error("Error checking existence:", error);
        return false;                                
    }
}

