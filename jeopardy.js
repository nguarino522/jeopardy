document.addEventListener('DOMContentLoaded', (event) => {

    // hide spinner after DOM load up
    hideLoadingView();

    // initialize categories array to house category and clue data
    let categories = [];

    /**  * Returns array of category ids, utilizing the random endpoint, we can just pull the category ID from NUM_CATEGORIES (6) random ones. 
     * This gets around not being able to pull a random category ID officially.
     */
    async function getCategoryIds() {
        let catIdArr = [];
        let { data } = await axios.get("https://jservice.io/api/random?count=6");
        for (let i = 0; i < data.length; i++) {
            catIdArr.push(data[i].category_id);
        }
        return catIdArr;
    }

    /** Returns an object with data about a category: Format => { title: "Math", clues: clue-array }
     and clue-array is formatted as such with the following fields:
     *   [
     *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
     *      {question: "Bell Jar Author", answer: "Plath", showing: null},
     *      ...
     *   ]
     */
    async function getCategory(catId) {
        let { data } = await axios.get(`https://jservice.io/api/category?id=${catId}`);
        let { title, clues } = data;
        let shuffledClues = clues.sort(() => 0.5 - Math.random());
        sizedClues = shuffledClues.slice(0, 6);
        clues = sizedClues.map(clue => ({ question: clue.question, answer: clue.answer, showing: null }));
        return { title, clues };
    }



    /** Fill the HTML table#jeopardy with the categories & cells for questions.
     * - The <thead> will be filled w/a <tr>, and a <td> for each category
     * - The <tbody> will be filled w/NUM_QUESTIONS_PER_CAT (5) <tr>s,
     *   each with a question for each category in a <td>
     *   (initally, just show a "?" where the question/answer would go.)
     */
    async function fillTable() {
        // empty table for new game start or restart
        $("#jeopardy thead").empty();
        $("#jeopardy tbody").empty();

        // sets the category title for each column
        $("#jeopardy thead").append(`<tr id="tablehead"></tr>`);
        for (let i = 0; i < 6; i++) {
            $("#tablehead").append(`<th>${categories[i].title}</th>`);
        }

        // loops through each column and creates a new tr element,
        // on each column pass through creates a td element with '?' text in each row
        for (let i = 0; i < 5; i++) {
            let newTr = $("<tr>");
            for (let j = 0; j < 6; j++) {
                newTr.append(`<td id=${j}-${i}>?</td>`);
            }
            $("#jeopardy tbody").append(newTr);
        }
    }



    /** Handle clicking on a clue: show the question or answer.
     *
     * Uses .showing property on clue to determine what to show:
     * - if currently null, show question & set .showing to "question"
     * - if currently "question", show answer & set .showing to "answer"
     * - if currently "answer", ignore click
     * */
    function handleClick(evt) {
        let [catId, clueId] = evt.target.id.split("-");
        let clue = categories[catId].clues[clueId];
        let text;
        if (!clue.showing) {
            clue.showing = "question";
            text = clue.question;
            $(`#${catId}-${clueId}`).addClass("td-question");
        } else if (clue.showing === "question") {
            clue.showing = "answer";
            text = clue.answer;
            $(`#${catId}-${clueId}`).removeClass("td-question");
            $(`#${catId}-${clueId}`).addClass("td-answer");
        } else { return }

        // set cell to what is in text to appear
        $(`#${catId}-${clueId}`).html(text);
    }


    // Show the loading spinner
    function showLoadingView() {
        $("#load").show();
    }


    // Hide the loading spinner
    function hideLoadingView() {
        $("#load").hide();
    }


    // Start game: get random category Ids, get data for each category, and create HTML table
    async function setupAndStart() {
        categories = [];
        showLoadingView();
        let categoryIds = await getCategoryIds();
        for (let id of categoryIds) {
            categories.push(await getCategory(id));
        }
        console.log(categories);
        hideLoadingView();
        await fillTable();
    }


    /** On click of start / restart button, set up game. */
    $("#start").on("click", async function (e) {
        $("#start").text("Restart Game!");
        $("#start").addClass("btn-info");
        $("#start").removeClass("btn-success");
        await setupAndStart();
    });


    /** On page load, add event handler for clicking clues */
    $('tbody').on('click', handleClick);


});