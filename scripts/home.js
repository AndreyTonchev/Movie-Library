import { getAuth, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { get, query, limitToFirst, onValue, push, getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

const movie_list = document.querySelector(".movies-wrapper");
const dropdown_type = document.querySelector(".dropdown-type-span");
const search_btn = document.querySelector(".search-btn");
const form = document.getElementById("add-movie-form");
const API = 'http://www.omdbapi.com/?apikey=d551c863&';

let url = new URL(window.location.href);
let params = new URLSearchParams(url.search);
const page = params.get("page");



onAuthStateChanged(auth, (user) => {
    if (user) { 
        document.querySelector(".profile-btn-span").textContent = user.displayName;     
        if(page === "watched") {
            loadWatchedMovies(user);
        }
        else if(page === "favourites") {
            loadFavouriteMovies(user);
        }
        else {
            loadPresetMovies(25);
            loadAddedMovies();
        }


    } else {
        window.location.href = "./login.html";
        alert("Please login to view this page");
    }

});


function loadPresetMovies(count) {
    const reference = ref(db, 'Movies/PresetMovies');
    const limited_query = query(reference, limitToFirst(count));

    onValue(limited_query, (snapshot) => {
        snapshot.forEach((childSnapshot) => addMovie(childSnapshot.val()));
    });
}

function loadAddedMovies() {
    const movies_ref = ref(db, 'Movies/AddedMovies');
    onValue(movies_ref, (snapshot) => {
        snapshot.forEach((child_snapshot) => addMovie(child_snapshot.val()));
    });
}
    
function loadWatchedMovies(user) {
    const movies_ref = ref(db, 'Users/' + `${user.displayName}/` + "Watched");
    onValue(movies_ref, (snapshot) => {
        snapshot.forEach((childSnapshot) => addMovie(childSnapshot.val()));
    });
}

function loadFavouriteMovies(user) {
    const movies_ref = ref(db, 'Users/' + `${user.displayName}/` + "Favourite");
    onValue(movies_ref, (snapshot) => {
        snapshot.forEach((childSnapshot) => addMovie(childSnapshot.val()));
    });
}

function addRating(movie, rating) {
    
    for (let i = 1; i <= 5 ; i++ ) {
        if (rating - 2 * i > 0) {
            movie.querySelector(`.star${i}`).classList.add("full-star");
        }
        else if (rating - ((2 * i) - 1) >= 0) {
            movie.querySelector(`.star${i}`).classList.add("half-star");
            return;
        }
        else {
            return;
        }
    }
}

function addMovie(movie_data) {    
    
    const movie = document.createElement("div");
    movie.classList.add("movie-wrapper");
    movie.classList.add("container");
    movie.setAttribute("movie-year", movie_data.Year);
    movie.setAttribute("movie-rating", movie_data.imdbRating);
    movie.innerHTML = `
            <img class="movie-poster" src=${movie_data.Poster} alt="No poster available">
            <div class="movie-info">
                <h2 class="movie-title">${movie_data.Title}</h2>
                <h3 class="movie-genre">${movie_data.Genre}</h3>
                <div class="movie-rating">
                    <span class="star star1">★</span>
                    <span class="star star2">★</span>
                    <span class="star star3">★</span>  
                    <span class="star star4">★</span>
                    <span class="star star5">★</span>            
                </div>
            </div>
    `
    
    addRating(movie, movie_data.imdbRating);
    movie.addEventListener("click", () => {
        window.location.href = `movie.html?title=${movie_data.Title}&year=${movie_data.Year}`;
    });
    movie_list.appendChild(movie);
}


// ###################################    SEARCH    #####################################################


document.querySelectorAll(".dropdown-type-option").forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        const selected_value = item.innerText;
        dropdown_type.innerText = selected_value;
        
    });
});

search_btn.addEventListener("click", () => {
    const search_value = document.querySelector(".search").value;
    if(!search_value) {
        alert("Input movie name");
        return;
    }
    const type = dropdown_type.innerText.toLowerCase();
    movie_list.innerHTML = "";

    fetch(`${API}s=${search_value}${type == "all" ? "" : "&type=" + type}`)
        .then((res) => res.json())
        .then((data) => {
            if (!data.Search) {
                alert("No movies found");
                return;
            }

            data.Search.forEach(async (movie_info) => { // Map, promise.all
            const movie_data = await fetch(`${API}i=${movie_info.imdbID}`).then(res => res.json());
            console.log(movie_data);
            
            addMovie(movie_data);
            });
        })
        .catch((err) => console.error(err));

});

// Fetches all the data and then outputs it
// search_btn.addEventListener("click", () => {
//     const search_value = document.querySelector(".search").value;
//     if (!search_value) {
//         alert("Input movie name");
//         return;
//     }
//     const type = dropdown_type.innerText.toLowerCase();
//     movie_list.innerHTML = "";

//     fetch(`${API}s=${search_value}${type === "all" ? "" : "&type=" + type}`)
//         .then((res) => res.json())
//         .then((data) => {
//             if (!data.Search) {
//                 alert("No movies found");
//                 return;
//             }

//             const moviePromises = data.Search.map((movie_info) =>
//                 fetch(`${API}i=${movie_info.imdbID}`)
//                     .then((res) => res.json())
//             );

//             return Promise.all(moviePromises);
//         })
//         .then((movies) => {
//             movies.forEach(addMovie);
//         })
//         .catch((err) => console.error(err));
// });


// ###################################    NAVIGATION    #####################################################


document.getElementById("home-btn").addEventListener("click", () => {
    window.location.href = "./index.html";
});


document.getElementById("watched-btn").addEventListener("click", () => {
    window.location = "./index.html?page=watched";
});


document.getElementById("favourites-btn").addEventListener("click", () => {
    window.location.href = "./index.html?page=favourites";
});

document.querySelector(".log-out-btn-wrapper").addEventListener("click", e=> {
    signOut(auth)
    .then(() => window.location="./login.html")
    .catch((err) => console.error(err));  
});


// ###################################    ADD MOVIE    #####################################################


const modal = document.getElementById("modal-overlay");

document.getElementById("add-movie-btn").addEventListener("click", () => {
    modal.style.display = "flex";
    document.getElementById("add-movie-cancel-btn").addEventListener("click", () => modal.style.display = "none");
});

document.getElementById('add-movie-form').addEventListener('submit', function(event) {
    const user = auth.currentUser;

    event.preventDefault();
    const movie_data = {
        Title: document.getElementById('movie-name').value,
        Genre: document.getElementById('movie-genre').value,
        Year: document.getElementById('movie-year').value,
        Length: document.getElementById('movie-length').value,
        imdbRating: document.getElementById('movie-rating').value,
        Director: document.getElementById('movie-director').value,
        Plot: document.getElementById('movie-plot').value,
        Poster: "../media/EmptyBanner.jpg",
        isAdded: true,
        addedBy: user.displayName
    };

    saveMovieData(movie_data);
    modal.style.display = "none";
});

function saveMovieData(movie_data) {
    const refrence = ref(db, 'Movies/AddedMovies/' + movie_data.Title);
    get(refrence).then((snapshot) => {
        if (snapshot.exists()) {
            alert("Movie with that name Already exist");
        } else {
            set(refrence, movie_data);
        }
    });
}


// ###################################    SORT    #####################################################


document.querySelectorAll(".dropdown-sort-option").forEach(option => {
    option.addEventListener("click", () => {
        const sort_by = option.getAttribute("data-sort");
        const sort_order = option.getAttribute("data-order");
        sortMovies(sort_by, sort_order);
    });
});
    
function sortMovies(criteria, order) {
    const movies = Array.from(document.querySelectorAll(".movie-wrapper"));
    movies.sort((a, b) => {
        const titleA = a.querySelector(".movie-title").innerText.toUpperCase();
        const titleB = b.querySelector(".movie-title").innerText.toUpperCase();
        const yearA = parseInt(a.getAttribute("movie-year")) || 0;
        const yearB = parseInt(b.getAttribute("movie-year")) || 0;
        const ratingA = parseFloat(a.getAttribute("movie-rating")) || 0;
        const ratingB = parseFloat(b.getAttribute("movie-rating")) || 0;

        let comparison = 0;
        if (criteria === "name") {
            comparison = titleA.localeCompare(titleB);
        } else if (criteria === "year") {
            comparison = yearA - yearB;
        } else if (criteria === "rating") {
            comparison = ratingA - ratingB;
        }

        return order === "asc" ? comparison : -comparison;
    });

    const movie_list = document.querySelector(".movies-wrapper");
    movie_list.innerHTML = "";
    movies.forEach(movie => movie_list.appendChild(movie));
}
