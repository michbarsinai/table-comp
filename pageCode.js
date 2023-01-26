
let theTable;

function setup() {
    console.log("setup started");
    setupTable();
    setupFilterField();
    console.log("setup done");
}

function setupTable(){
    theTable = document.getElementById("sampleTable");
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
            title: "Age",
            fieldName: "age"
        },
        {
            title: "Email",
            viewFn: (ent)=>{
                let r = Math.random()*200;
                let email = `${ent.firstName}@${ent.lastName}.com`;
                return `(${r}) <a href="mailto:${email}">${email}</a>`;
            },
            valueFn: (ent)=>ent.firstName
        }
    ];
    
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

function setupFilterField() {
    const fld = document.getElementById("filterField");
    fld.addEventListener("keyup", (e)=>{
        const data = fld.value.trim();
        if ( data.length === 0 ) {
            theTable.filter = null;
        } else {
            theTable.filter = data;
        }
    });
}

if ( document.readyState!=='loading' ){
    // document loaded; execute now
    setup();
} else {
    document.addEventListener('DOMContentLoaded', setup);
}