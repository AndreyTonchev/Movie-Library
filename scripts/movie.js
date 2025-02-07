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


// We are saving the name of the user who watched/liked the movie in the movie's json, bcs when we delete a movie we need to remove that movie from
// the list of all the user that have watched/liked it. Another way is to go trough every user and check but if we have a lot of user thats going to be very slow


async function setWatchedBtn(movie_data) {
    const user = auth.currentUser;
    const user_path = 'Users/' + `${user.displayName}/Watched/` + movie_data.Title;

    const segment = movie_data.isAdded === true ? "AddedMovies" : "PresetMovies";
    const movie_path = "Movies/" + segment + "/" + movie_data.Title + "/Watched/" + user.displayName;

    const res = await exist(user_path);

    if (res === true) {
        watched_btn.setAttribute("selected","");
    }

    watched_btn.addEventListener('click',async () => {
        const user_watched_ref = ref(db, user_path);
        const movie_watched_ref = ref(db, movie_path);

        if (await exist(user_path)) {
            // Remove movie form user list
            set(user_watched_ref, null);
            watched_btn.removeAttribute("selected");

             // Remove user from movie list
             set(movie_watched_ref, null)

        } else {
            // Add movie to user list
            set(user_watched_ref, movie_data);
            watched_btn.setAttribute("selected","");

            // Add user to movie list
            set(movie_watched_ref, user.displayName);
        }
    });
}

async function setFavouriteBtn(movie_data) {
    const user = auth.currentUser;
    const user_path = 'Users/' + `${user.displayName}/Favourite/` + movie_data.Title;

    const segment = movie_data.isAdded === true ? "AddedMovies" : "PresetMovies";
    const movie_path = "Movies/" + segment + "/" + movie_data.Title + "/Favourite/" + user.displayName;
     

    const res = await exist(user_path);

    if (res === true) {
        fav_btn.setAttribute("selected","");
    }

    fav_btn.addEventListener('click',async () => {
        const user_favourite_ref = ref(db, user_path);
        const movie_favourite_ref = ref(db, movie_path);

        if (await exist(user_path)) {
            // Remove movie form user list
            set(user_favourite_ref, null);
            fav_btn.removeAttribute("selected");

            // Remove user from movie list
            set(movie_favourite_ref, null)

        } else {
            // Add movie to user list
            set(user_favourite_ref, movie_data);
            fav_btn.setAttribute("selected","");

            // Add user to movie list
            set(movie_favourite_ref, user.displayName);
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

