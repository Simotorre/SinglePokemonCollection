
// ======================================================
// CONFIGURAZIONE POKÉMON
// ======================================================

// Per aggiungere un Pokémon, inserisci un nuovo elemento
// seguendo questo schema:
//
// {
//     id: "quagsire",
//     name: "Quagsire",
//     file: "./quagsire.js",
//     exportName: "quagsire",
//     imageFolder: "./quagsire/"
// }

const POKEMON = [
    {
        id: "wooper",
        name: "Wooper",
        file: "./pokemon/wooper.js",
        exportName: "wooper",
        imageFolder: "./pokemon/wooper/"
    },
    {
        id: "wooper-paldean",
        name: "Wooper di Paldea",
        file: "./pokemon/wooper-paldean.js",
        exportName: "wooperPaldean",
        imageFolder: "./pokemon/wooper-paldean/"
    },
    {
        id: "quagsire",
        name: "Quagsire",
        file: "./pokemon/quagsire.js",
        exportName: "quagsire",
        imageFolder: "./pokemon/quagsire/"
    },
    {
        id: "clodsire",
        name: "Clodsire",
        file: "./pokemon/clodsire.js",
        exportName: "clodsire",
        imageFolder: "./pokemon/clodsire/"
    }
];


// ======================================================
// CONFIGURAZIONE IMMAGINI
// ======================================================

const IMAGE_EXTENSIONS = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif"
];


// ======================================================
// ELEMENTI HTML
// ======================================================

const $ = id => document.getElementById(id);

const pokemonSelection = $("pokemonSelection");
const pokemonSelect = $("pokemonSelect");
const loadButton = $("loadButton");
const backButton = $("backButton");

const cardSection = $("cardSection");
const pokemonTitle = $("pokemonTitle");
const cardCount = $("cardCount");

const cardTableBody = $("cardTableBody");
const tableSearch = $("tableSearch");
const statusMessage = $("statusMessage");


// ======================================================
// VARIABILI GLOBALI
// ======================================================

let currentRows = [];


// ======================================================
// INIZIALIZZAZIONE SELETTORE POKÉMON
// ======================================================

function initialisePokemonSelector() {

    POKEMON.forEach(pokemon => {

        const option = document.createElement("option");

        option.value = pokemon.id;
        option.textContent = pokemon.name;

        pokemonSelect.appendChild(option);

    });

}


// ======================================================
// RICERCA IMMAGINI
// ======================================================

function findImage(folder, key, imgElement) {

    let extensionIndex = 0;

    function tryNextExtension() {

        // Se abbiamo provato tutte le estensioni
        if (extensionIndex >= IMAGE_EXTENSIONS.length) {

            const placeholder = document.createElement("div");

            placeholder.className = "image-placeholder";
            placeholder.textContent = "Immagine non trovata";

            imgElement.replaceWith(placeholder);

            return;
        }

        const imagePath =
            folder +
            encodeURIComponent(key) +
            IMAGE_EXTENSIONS[extensionIndex];

        extensionIndex++;

        const probe = new Image();

        probe.onload = function () {

            imgElement.src = imagePath;
            imgElement.alt = `Carta ${key}`;

        };

        probe.onerror = tryNextExtension;

        probe.src = imagePath;

    }

    tryNextExtension();

}


// ======================================================
// CREAZIONE RIGA TABELLA
// ======================================================

function createCardRow(key, card, imageFolder) {

    const row = document.createElement("tr");


    // ------------------------------
    // IMMAGINE
    // ------------------------------

    const imageCell = document.createElement("td");

    const image = document.createElement("img");

    image.className = "card-image";
    image.alt = `Carta ${key}`;
    image.loading = "lazy";

    imageCell.appendChild(image);

    findImage(imageFolder, key, image);


    // ------------------------------
    // NOME SET
    // ------------------------------

    const setCell = document.createElement("td");

    setCell.textContent = card.setname ?? "";


    // ------------------------------
    // NUMERO CARTA
    // ------------------------------

    const numberCell = document.createElement("td");

    numberCell.className = "text-nowrap";
    numberCell.textContent = card.number || "—";


    // ------------------------------
    // VARIANTI
    // ------------------------------

    const variantsCell = document.createElement("td");

    const variants = Array.isArray(card.variants)
        ? card.variants
        : (card.variants ? [card.variants] : []);

    if (variants.length > 0) {

        const list = document.createElement("ul");

        list.className = "variant-list";

        variants.forEach(variant => {

            const item = document.createElement("li");

            item.textContent = variant;

            list.appendChild(item);

        });

        variantsCell.appendChild(list);

    } else {

        variantsCell.textContent = "—";

    }


    // ------------------------------
    // ASSEMBLAGGIO RIGA
    // ------------------------------

    row.append(
        imageCell,
        setCell,
        numberCell,
        variantsCell
    );


    // Testo utilizzato dalla ricerca
    row.dataset.search = [
        key,
        card.set,
        card.setname,
        card.number,
        ...variants
    ].join(" ").toLowerCase();


    return row;

}


// ======================================================
// CARICAMENTO POKÉMON SELEZIONATO
// ======================================================

async function loadSelectedPokemon() {

    const pokemon = POKEMON.find(
        item => item.id === pokemonSelect.value
    );

    if (!pokemon) return;


    loadButton.disabled = true;
    loadButton.textContent = "Caricamento...";

    statusMessage.classList.add("d-none");


    try {

        // Import dinamico del file JavaScript
        const module = await import(pokemon.file);

        // Recupera l'oggetto esportato
        const cards = module[pokemon.exportName];


        if (!cards || typeof cards !== "object") {

            throw new Error(
                `Export "${pokemon.exportName}" non trovato in ${pokemon.file}`
            );

        }


        // Ordina le carte in base alla key
        const sortedCards = Object.entries(cards).sort(
            ([keyA], [keyB]) =>
                keyA.localeCompare(
                    keyB,
                    undefined,
                    { numeric: true }
                )
        );


        // Crea le righe della tabella
        currentRows = sortedCards.map(([key, card]) => {

            return createCardRow(
                key,
                card,
                pokemon.imageFolder
            );

        });


        // Inserisce tutte le righe nella tabella
        cardTableBody.replaceChildren(...currentRows);


        // Aggiorna intestazione
        pokemonTitle.textContent = pokemon.name;

        cardCount.textContent =
            `${currentRows.length} carte / illustrazioni`;


        // Mostra la tabella e nasconde la selezione
        pokemonSelection.classList.add("d-none");

        cardSection.classList.remove("d-none");

        backButton.classList.remove("d-none");


        // Reset ricerca
        tableSearch.value = "";


    } catch (error) {

        console.error(error);

        statusMessage.textContent =
            `Errore nel caricamento: ${error.message}. ` +
            `Controlla il percorso del file, il nome dell'export ` +
            `e la console del browser.`;

        statusMessage.classList.remove("d-none");


    } finally {

        loadButton.disabled = false;

        loadButton.textContent = "Mostra carte";

    }

}


// ======================================================
// RITORNO ALLA SELEZIONE POKÉMON
// ======================================================

function returnToSelection() {

    cardSection.classList.add("d-none");

    backButton.classList.add("d-none");

    pokemonSelection.classList.remove("d-none");

    cardTableBody.replaceChildren();

    currentRows = [];

    tableSearch.value = "";

    statusMessage.classList.add("d-none");

}


// ======================================================
// RICERCA NELLA TABELLA
// ======================================================

function filterTable() {

    const query = tableSearch.value
        .trim()
        .toLowerCase();

    currentRows.forEach(row => {

        const matches = row.dataset.search.includes(query);

        row.classList.toggle("d-none", !matches);

    });

}


// ======================================================
// EVENT LISTENERS
// ======================================================

pokemonSelect.addEventListener("change", () => {

    loadButton.disabled = pokemonSelect.value === "";

});


loadButton.addEventListener(
    "click",
    loadSelectedPokemon
);


backButton.addEventListener(
    "click",
    returnToSelection
);


tableSearch.addEventListener(
    "input",
    filterTable
);


// ======================================================
// ZOOM IMMAGINI CARTE
// ======================================================

const imageModal = $("imageModal");
const modalImage = $("modalImage");
const closeModal = $("closeModal");

// Click su un'immagine della tabella
cardTableBody.addEventListener("click", function (event) {

    if (event.target.classList.contains("card-image")) {

        modalImage.src = event.target.src;

        imageModal.classList.add("active");

    }

});

// Chiusura tramite X
closeModal.addEventListener("click", function () {

    imageModal.classList.remove("active");

});

// Chiusura cliccando sullo sfondo
imageModal.addEventListener("click", function (event) {

    if (event.target === imageModal) {

        imageModal.classList.remove("active");

    }

});

// Chiusura tramite ESC
document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        imageModal.classList.remove("active");

    }

});


// ======================================================
// AVVIO
// ======================================================

initialisePokemonSelector();
