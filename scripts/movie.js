const API = "http://www.omdbapi.com/?apikey=d551c863&";

let url = new URL(window.location.href);
let params = new URLSearchParams(url.search);
const title = params.get("title");

fetch(`${API}t=${title}`)
    .then((res) => res.json())
    .then((data) => {
        console.log(data)
        document.title = title;
    })
    .catch((err) => console.error(err))


