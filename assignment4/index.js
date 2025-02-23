
window.onload = function() {
    loadJSON();
};

function getJSONFile(path, callback) {
    
    fetch(path)
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => console.error('Error fetching JSON:', error));
}


function loadJSON(){

    let links = [
        "./data/starwars-episode-1-interactions-allCharacters.json",
        "./data/starwars-episode-2-interactions-allCharacters.json",
        "./data/starwars-episode-3-interactions-allCharacters.json",
        "./data/starwars-episode-4-interactions-allCharacters.json",
        "./data/starwars-episode-5-interactions-allCharacters.json",
        "./data/starwars-episode-6-interactions-allCharacters.json",
        "./data/starwars-episode-7-interactions-allCharacters.json",
        "./data/starwars-full-interactions-allCharacters.json"
    ];

    links.forEach(link => {
        getJSONFile(link, data => {
            console.log(data);
        });
    });


}

