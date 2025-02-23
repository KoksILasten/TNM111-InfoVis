var swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull;

window.onload = async function() {
    await loadJSON();

    console.log("Loaded Data:");
    console.log("Episode 1:", swep1);
    console.log("Episode 2:", swep2);
    console.log("Episode 3:", swep3);
    console.log("Episode 4:", swep4);
    console.log("Episode 5:", swep5);
    console.log("Episode 6:", swep6);
    console.log("Episode 7:", swep7);
    console.log("Full:", swfull);
};

async function loadJSON() {
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

    try {
        const dataArray = await Promise.all(links.map(link => d3.json(link)));
        [swep1, swep2, swep3, swep4, swep5, swep6, swep7, swfull] = dataArray;
    } catch (error) {
        console.error('Error loading JSON files:', error);
    }
}





