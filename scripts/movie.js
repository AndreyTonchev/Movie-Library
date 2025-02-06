const API = "http://www.omdbapi.com/?apikey=d551c863&";

let url = new URL(window.location.href);
let params = new URLSearchParams(url.search);
const title = params.get("title");

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
    })
    .catch((err) => console.error(err));

document.getElementById('watched-btn').addEventListener('click', () => {
    alert('Added to Watched list!');

});

document.getElementById('like-btn').addEventListener('click', () => {
    alert('Added to Liked list!');

});