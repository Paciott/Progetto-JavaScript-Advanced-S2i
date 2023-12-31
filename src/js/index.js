// axios setup
const axios = require('axios');
import styles from "../css/style.css";

// target elements from the DOM
const input = document.querySelector("#site-search");
let errorP = document.createElement("p");
const loader = document.querySelector(".loader");
errorP.classList.add("error-paragraph");

// set the input value to empty
input.value = "";

// make the first API call and fetch the books matching the keyword inserted by the user
const getData = async () => {

  // we take the keyword inserted by the user and adjust it for use it into the query
  let inputValue = input.value.trim().toLowerCase().split(" ").join("");

  if(inputValue === "") {                           // if the user starts research without a keyword
    errorP.innerText = "Please insert a keyword.";  // notify the user
    document.body.appendChild(errorP);
    input.value = "";              
    return;
  };

  //start the loader animation
  loader.classList.toggle("hidden");

  try {
    // send a get request to open library
    const res = await axios.get(
      `https://openlibrary.org/subjects/${inputValue}.json`
    );

    if (res.data.work_count !== 0) {        // if the request gives us back some works
      loader.classList.toggle("hidden");    // we stop the loader animation
      const works = res.data.works;
      for (let work of works) {                 // we create a card for every work given to us by the api call
        createCard(work);
      }
    } else {                                // if the request gives us back no works
      loader.classList.toggle("hidden");    // we stop the loader animation
      errorP.innerText = "No match found."; // we send a message to the user 
      document.body.appendChild(errorP);
    }
  } catch (e) {
    loader.classList.toggle("hidden");
    errorP.innerText = "No match found.";
    document.body.appendChild(errorP);
    console.log("ERROR!", e);
  }
  input.value = "";
};

// make the second API call and fetch the description of the selected book
const getDescription = async (key) => {
  try {
    // we use the work key to fetch the description
    const res = await axios.get(`https://openlibrary.org${key}.json`);
    if (res.data && res.data.description && res.data.description.value) {
      return res.data.description.value;
    } else if (res.data && res.data.description) {
      return res.data.description;
    } else {
      return "No description avaliable.";
    }
  } catch (e) {
    console.log("ERROR!", e);
  }
};

// target the list from the DOM
const list = document.querySelector(".list");


const createCard = async (work) => {
  //create a new list item for every work and append it to the existing list in the DOM, then we style it by adding classes
  let newLi = document.createElement("li");
  list.appendChild(newLi);
  newLi.classList.add("list-item");

  // create an h3 element for every work title and append it in it's list item, then we style it by adding classes
  let h3 = document.createElement("h3");
  h3.innerText = work.title;
  h3.classList.add("h3");
  newLi.appendChild(h3);

  // create a span for every author name and append it in it's list item, then we style it by adding classes
  let author = document.createElement("span");
  author.innerText = work.authors[0].name;
  author.classList.add("author");
  newLi.appendChild(author);

  // create a "read more" button for every card and append it in it's list item, then we style it by adding classes
  const readMore = document.createElement("button");
  readMore.innerText = "Show More";
  readMore.classList.add("read-more");
  newLi.appendChild(readMore);

  // create a paragraph for every description, then we control it's content by manipulating the behavior of the "read more" button
  const descriptionP = document.createElement("p");
  descriptionP.classList.add("description-paragraph");

  readMore.addEventListener("click", async () => {
    if (readMore.innerText === "Show More") { // if the button shows "show more", we search for the book description by using the given method
      let description = await getDescription(work.key);
      descriptionP.innerText = description;  // we set the paragraph content with the description we got from the given method
      newLi.appendChild(descriptionP);       // then we append the paragraph to it's card
      readMore.innerText = "Show Less";      // and change the button inner text to "show less"
    } else {
      descriptionP.remove();                 // if the button shows "show less", we remove the description paragraph and chang ethe button inner text
      readMore.innerText = "Show More";
    }
  });
};

// target the search button from the DOM
const searchBtn = document.querySelector(".search-btn");

// manipulate search button behavior
searchBtn.addEventListener("click", (event) => {
  // prevent the default behavior of the button, then we empty the list, the error paragraph and launch a request
  event.preventDefault();
  list.innerText = "";
  errorP.innerText = "";
  getData();
});