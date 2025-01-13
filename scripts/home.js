const movie_list = document.querySelector(".movies-wrapper");
const API = 'http://www.omdbapi.com/?apikey=d551c863&';

let top250 = []; // 3 years ago
fetch("../top.json")
    .then((res) => res.json())
    .then((data) => {
        for (let i = 0; i <= 25; i++) {
            console.log(data[i]);
            fetch(`${API}i=${data[i]}`)
                .then((res) => res.json())
                .then((movie_data) => {
                    console.log(movie_data);
                    
                    const movie = document.createElement("div");
                    movie.classList.add("movie-wrapper");
                    movie.innerHTML = `
                            <img class="movie-poster" src=${movie_data.Poster} alt="img">
                            <div class="movie-info">
                                <h2 class="movie-title">${movie_data.Title}</h2>
                                <h3 class="movie-genre">Adventure</h3>
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
                })
                .catch((err) => console.error(err));
        }
    })
    .catch((err) => console.error(err));


function addRating(movie, movie_data) {
    let rating = movie_data.Ratings[0].Value.split("/")[0];
    console.log(rating);
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
    

