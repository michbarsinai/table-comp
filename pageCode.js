/**
 * Page-level variable holding a reference to the table
 */
let theTable;

/**
 * Called when the window is loaded.
 */
function setup() {
    console.log("setup started");
    setupTable();
    setupFilterField();
    console.log("setup done");
}

/**
 * Sets the table up - columns and data.
 */
function setupTable(){
    // locate the table in the page, put in a variable
    theTable = document.getElementById("sampleTable");

    // Set the columns up. Note that some descriptions use shorthand fieldName and some use
    // the explicit viewFn and valueFn.
    theTable.columns = [
        {
            title: "First Name",
            fieldName: "firstName"
        },
        {
            title: "Last Name",
            fieldName: "lastName"
        },
        {
            title: "Full Name",
            valueFn: (ent)=>ent.firstName + " " + ent.lastName
        },
        {
            title: "Age (verbatim)",
            fieldName: "age"
        },
        {
            title: "Age (progress)",
            fieldName: "age",
            viewFn: (ent)=>{
                return `<progress max="120" value="${ent.age}"></progress>`;
            }
        },
        {
            title: "Email (generated)",
            viewFn: (ent)=>{
                let email = `${ent.firstName}@${ent.lastName}.com`;
                return `<a href="mailto:${email}">${email}</a>`;
            },
            valueFn: (ent)=>ent.firstName
        }
    ];
    
    // Add some data
    theTable.data = [
        {firstName:"Arthur", lastName:"Dent", age:37 },
        {firstName:"Ford", lastName:"Prefect", age:42 },
        {firstName:"Milosh", lastName:"Kozmo", age:99 },
        {firstName:"Giovanni", lastName:"Scalante", age:17 },
        {firstName:"Jane", lastName:"Doe", age:43 },
        {firstName:"Dane", lastName:"Joe", age:34 },
        {firstName:"T", lastName:"Rex", age:112 },
        {firstName:"Baby", lastName:"Bonk", age:4 }
    ];
}

/**
 * Find and connect the text field to the table's filter function.
 */
function setupFilterField() {
    const fld = document.getElementById("filterField");
    theTable.adoptFilterField(fld);
}

if ( document.readyState!=='loading' ){
    // document loaded; execute now
    setup();
} else {
    document.addEventListener('DOMContentLoaded', setup);
}