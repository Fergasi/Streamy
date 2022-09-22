// Establishing variables for existing Elements in the base HTML.
const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

//API URL for fetching specific titles from the search bar in the header of the page.
const searchUrl = "https://ott-details.p.rapidapi.com/search?title=";

//API URL for fetching additional details on titles.
const titleDetailsUrl =
  "https://ott-details.p.rapidapi.com/gettitleDetails?imdbid=";

function initialLoad() {
  //API URL, for fetching 'recent titles' (including a string interpolated random number to randomize the page number) to display randomized titles each time the landing page is refreshed.
  const loadUrl = `https://ott-details.p.rapidapi.com/advancedsearch?min_imdb=7&language=english&type=movie&page=${Math.ceil(
    Math.random() * 3
  )}`;

  //Call 'getSearchTitles' function to load titles for landing page, using URL for 'latests titles'.
  getSearchTitle(loadUrl);
}

initialLoad();

/////////////////API HOST & KEY INFO
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Host": "ott-details.p.rapidapi.com",
    "X-RapidAPI-Key": "1b6fff16demsh3c344606fca7e27p10d4f0jsn907aae9d6ece", //<--- PLEASE DON'T FORGET TO REPLACE 'key' with the API key provided in the comments of the Populi submission. Or alternatively leave the 'key' here and add the key as a variable on line 1 eg. "const key = 1b6fff16......".
  },
};

//click-active tracker var
var clickActive = 1;

// Event listener for submitting search in the header of the page.
form.addEventListener("submit", (e) => {
  e.preventDefault();

  //Grabbing search value from input.
  const searchTerm = search.value;

  //Prevent the Form from submitting if the search bar is empty and prevent rapid inputs from overloading API with setTimeout.
  if (searchTerm && clickActive === 1) {
    clickActive = 0;

    getSearchTitle(searchUrl + searchTerm);
    search.value = "";

    setTimeout(function () {
      clickActive = 1;
    }, 2000);
  }
  // manages blank searches by loading landing page and prevent rapid inputs from overloading API with setTimeout.
  else if (clickActive === 1) {
    clickActive = 0;

    initialLoad();

    setTimeout(function () {
      clickActive = 1;
    }, 2000);
  }
});

//Helper function to set a time-out in my async function below. This is arbitrary but done to resolve an issue with overloading my API, as the API has a maximum call volume of 1 pull per second.
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//Helper function to execute the SEARCH for titles.
async function getSearchTitle(url) {
  //Create and insert loading icon, to display while api fetch is occuring, before API fetch content is appended to the Main section.
  let loader = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
  main.innerHTML = loader;

  //1 second delay
  await delay(1000);

  //SEARCH PULL - will fetch all search result data.
  fetch(url, options)
    .then((response) => response.json())
    .then(function (data) {
      //Clear main section content (loading icon, error message, or any existing titles from previous loads or searches)
      main.innerHTML = "";

      //For Each loop through all search results to create thumbnails for each, which will display relevent data regarding the title.
      data.results.forEach((element) => {
        //Condition for if the searched title matched has a synopsis, if so, then proceed.
        if (element.synopsis) {
          // Creating elements to house our data that is to be inserted inside the main section.
          // 'thumbnail' will house all other elements below, and then be appended to the 'main' tag / section to display results.
          const thumbnail = document.createElement("div");
          const image = document.createElement("img");
          const text = document.createElement("h2");
          const info = document.createElement("footer");
          const blurb = document.createElement("details");
          const details = document.createElement("details");

          //final element is to house 'additional details' which will be added in the event of a 'click'.
          const p = document.createElement("p");

          //Here we will assign specific data from the SEARCH PULL to the newly created elements, using string interpolation to write neccesary HTML tags and formatting, such as:
          //Title
          text.innerHTML = `${element.title}`;

          //Title poster
          image.src = element.imageurl;

          //Default title poster in the case no poster exists.
          image.setAttribute(
            "onerror",
            "this.onerror=null;this.src='https://m.media-amazon.com/images/G/01/imdb/images/nopicture/180x268/film-173410679._CB468515592_.png'"
          );

          //Release date
          info.innerHTML = `<h3>${element.released}</h3>`;

          //Here an IF statement to include the Title's genre, only if Genre data exists, and is not equal to API default null value '\N'.
          if (element.genre && element.genre[0] !== "\\N") {
            info.innerHTML += `<h3>${element.genre[0]}</h3>`;
          }

          //Summary/blurb of the title
          blurb.innerHTML = `<summary class="fa-1x">Synopsis&nbsp;<i class="fa-solid fa-circle-plus"></i></summary><p class="syn">${element.synopsis}</p>`;

          //Here we create the 'More Details' expandable dropdown container, using FontAwesome syntax.
          details.innerHTML = `<summary class="fa-1x">More details&nbsp;<i class="fa-solid fa-circle-plus"></i></summary>`;

          //We assign a class to the thumbnail for CSS styling purposes.
          thumbnail.className = "thumbnail";

          //Here we append all newly created elements as children to the 'thumbnail' element (div), and then append the 'thumbnail' element as a child to the main section of the HTML page.
          thumbnail.appendChild(image);
          thumbnail.appendChild(text);
          thumbnail.appendChild(info);
          thumbnail.appendChild(blurb);
          details.appendChild(p);
          thumbnail.appendChild(details);
          main.appendChild(thumbnail);

          //Here we establish a variable that will combine the default API search URL with the specific ID code associated with the title being looped through and added above.
          const detailsSearchTerm = titleDetailsUrl + element.imdbid;

          //We then add a 'click' event listener to the 'More Details' expandable container than we added above using the 'p' tag.
          details.addEventListener(
            "click",
            (e) => {
              //MORE DETAILS PULL - will sit within the event listener ascociated with each specific title/thumbnail in the event the user wants to see further details of the title. The fetch below will then fetch the additional details from a seperate API URL defined by variable: 'detailsSearchterm'.
              fetch(detailsSearchTerm, options)
                .then((response) => response.json())
                .then(function (data) {
                  // Creating elements to house our data that is to be inserted inside the 'More Details' container.
                  const extraDets1 = document.createElement("div");
                  const extraDets2 = document.createElement("div");
                  const extraDets3 = document.createElement("section");
                  const extraDets4 = document.createElement("div");

                  //Below we will assign the specific 'additional data' from 'SEARCH PULL 2' to the newly created elements, using string interpolation to write neccesary HTML tags and formatting.

                  //If statement to check if 'IMDB Rating' data is present, if valid, insert into element. Finally append element to 'p' tag.
                  if (data.imdbrating) {
                    extraDets3.innerHTML = `<p><a href="https://www.imdb.com/title/${data.imdbid}"><img class="imdb" src="https://images-na.ssl-images-amazon.com/images/I/31R77jB-ICL.jpg"></img></a></p>&nbsp;&nbsp;<h3>${data.imdbrating}</h3>`;
                    p.appendChild(extraDets3);
                  }

                  //If statement to check if 'Runtime' data is present and does not equal the API's default null value of '\N', if valid, insert into element. Finally append element to 'p' tag.
                  if (data.runtime && data.runtime !== "\\N min") {
                    extraDets1.innerHTML = `<h3>${data.runtime} (${element.type})</h3>`;
                    p.appendChild(extraDets1);
                  }

                  //If statement to check if 'Language' data is present, by checking if array of languages is not equal to 0, if valid, insert first language (Primary language of the film/title) into element. Finally append element to 'p' tag.
                  if (data.language.length !== 0) {
                    extraDets2.innerHTML = `<h3>${data.language[0]}</h3>`;
                    p.appendChild(extraDets2);
                  }

                  //Assign ID to last element (housing links to streaming services), for CSS styling purposes.
                  extraDets4.id = "links";

                  //For loop to loop through all streaming providers (array) for this title.
                  for (
                    let i = 0;
                    i < data.streamingAvailability.country.US.length;
                    i++
                  ) {
                    //If statement to check if 'Streaming Availability' data is present and not equal to 'null'.
                    if (
                      data.streamingAvailability.country.US[i].platform &&
                      data.streamingAvailability.country.US[i].platform !== null
                    ) {
                      //If valid, create 'li' tags and insert streaming provider name and associated URL as an 'href', then append to newly element.
                      const z = document.createElement("li");
                      z.innerHTML = `<a href=${data.streamingAvailability.country.US[i].url}>${data.streamingAvailability.country.US[i].platform}</a>`;
                      extraDets4.appendChild(z);
                    }
                  }
                  //Finally append element to 'p' tag.
                  p.appendChild(extraDets4);
                });
              //Set 'once' option to 'true' in the EventListeners options object, to prevent event listener from being run more than once. This is to prevent uneccesary API pulls once the More Details section has already been fetched and populated.
            },
            { once: true }
          );
        }
      });
      // handle unfindable search attempts, using data.results of length < 1, by displaying error message as seen below.
      if (data.results.length < 1) {
        const noneFound = document.createElement("h1");
        noneFound.innerText = "Sorry No Titles Found 🎞 \n Please Try Again...";
        main.appendChild(noneFound);
      }
    });
}
