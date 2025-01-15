const API = "http://www.omdbapi.com/?apikey=d551c863&";

fetch(`http://www.omdbapi.com/?apikey=d551c863&t=Dune`)
    .then((res) => res.json())
    .then((data) => {
        let list = [];
        for (let i = 0; i < 250; i++) {
            console.log(data[i]);
            
        }
    })
    .catch((err) => console.error(err));


