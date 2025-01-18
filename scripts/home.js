const movie_list = document.querySelector(".movies-wrapper");
const dropdown_type = document.querySelector(".dropdown-type-span");
const search_btn = document.querySelector(".search-btn");

const API = 'http://www.omdbapi.com/?apikey=d551c863&';

let top250 = []; // 3 years ago
fetch("../top.json")
    .then((res) => res.json())
    .then((data) => { return data.slice(0, 25); })
    .then(async (movieIds) => {
        for (let id of movieIds) {
            const movie_data = await fetch(`${API}i=${id}`).then(res => res.json());
            addMovie(movie_data);
        }
    }) 
    .catch((err) => console.error(err));



function addRating(movie, movie_data) {
    let rating = movie_data.Ratings[0].Value.split("/")[0];
    for (let i = 1; i <= 5 ; i++ ) {
        if (rating - 2 * i > 0) {
            movie.querySelector(`.star${i}`).classList.add("full-star");
        }
        else if (rating - ((2 * i) - 1) > 0) {
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
    movie.setAttribute("movie-id", `${movie_data.imdbID}`)
    movie.innerHTML = `
            <img class="movie-poster" src=${movie_data.Poster} alt="img">
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
    addRating(movie, movie_data);
    movie_list.appendChild(movie);
}

document.querySelectorAll(".dropdown-type-option").forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        const selected_value = item.innerText;
        dropdown_type.innerText = selected_value;
        
    })
})

search_btn.addEventListener("click", () => {
    const search_value = document.querySelector(".search").value;
    if(!search_value) {
        alert("Input movie name")
        return;
    }
    const type = dropdown_type.innerText.toLowerCase();
    movie_list.innerHTML = "";

    fetch(`${API}s=${search_value}${type == "all" ? "" : "&type=" + type}`)
    .then((res) => res.json())
        .then((data) => data.Search.forEach(async (movie_info) => {
            const movie_data = await fetch(`${API}i=${movie_info.imdbID}`).then(res => res.json());
            addMovie(movie_data);
        }))
        .catch((err) => console.error(err));

})  

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
}




