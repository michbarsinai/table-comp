class TableComp extends HTMLElement {
    constructor() {
        super();
        // read atts
        this.sortOrderFactor = 1;
    }

    connectedCallback() {
        this.attachShadow({mode:"open"});
        const css = this.getAttribute("css");
        const cssEmt = document.createElement("link");
        cssEmt.rel="stylesheet";
        if ( (!css) || css.trim().length===0 ) {
            cssEmt.href = TableComp.DEFAULT_CSS_HREF;
        }
        this.shadowRoot.appendChild( cssEmt );
        
        this.tableEmt = document.createElement("table");
        this.tableHeader = document.createElement("thead");
        this.tableEmt.appendChild(this.tableHeader);
        this.tableBody = document.createElement("tbody");
        this.tableEmt.appendChild(this.tableBody);
        this.shadowRoot.appendChild(this.tableEmt);
        this.headerRow = document.createElement("tr");
        this.tableHeader.appendChild(this.headerRow);

        const cssClasses = this.getAttribute("cssClasses");
        for ( let cssClass of cssClasses.split(",")) {
            this.tableEmt.classList.add(cssClass.trim());
        }
        
        this.shadowRoot.appendChild(this.tableEmt);

    }

    prepareRows() {
        this.rows = [];
        if ( ! this.model ) return;
        if ( ! this.filterFn ) { // default filter allows all rows.
            this.filterFn = (row)=>true;
        }
        this.model
            .filter( r => this.filterFn(r) )
            .forEach( r => this.rows.push(r) );

        if ( this.sortOrder && this.sortOrder.trim().length>0 ) {
            this.sortOrderColIdx = this._columns.map(c=>c.title).indexOf(this._sortOrder);
            const sorterFn = this._columns[this.sortOrderColIdx].extractorFn;
            this.rows.sort( (a,b)=> {
                const aVal = sorterFn(a);
                const bVal = sorterFn(b);
                const numericDiff = ( (typeof aVal === "number") && (typeof bVal === "number") );
                const diff = numericDiff ? (aVal - bVal) : (String(aVal).localeCompare(bVal));
                return this.sortOrderFactor*diff;
            } );

        }
    }

    refreshRows(){
        // clear, set headers
        if ( this.columnsChanged ) {            
            while ( this.headerRow.childElementCount > 0 ) {
                this.headerRow.childNodes[0].remove();
            }
            this._columns.forEach( col => {
                let th = document.createElement("th");
                th.innerHTML = col.title;
                th.onclick = (e)=>this.sortOrder=col.title;
                th.style.cursor = "pointer";
                th.style.userSelect = "none";

                this.headerRow.appendChild(th);
            });
            this.columnsChanged=false;
        }
        while ( this.tableBody.childElementCount > 0 ) {
            this.tableBody.childNodes[0].remove();
        }

        if ( (!this._columns) || this.columns.length===0 ) {
            this.addNoDataRow();
            return;
        }

        this.prepareRows();

        // add table rows
        if ( this.rows && this.rows.length > 0 ) {
            this.updateSortArrow();
            this.rows.forEach( row => {
                let tr = document.createElement("tr");
                this._columns.forEach( col => {
                    let td = document.createElement("td");
                    const value = col.extractorFn(row);
                    td.innerHTML = value;
                    if ( typeof value === "number") {
                        td.style.textAlign = "right";
                    }
                    tr.appendChild(td);
                });
                this.tableBody.appendChild(tr);
            });
        } else {
            this.addNoDataRow();
        }
    }

    addNoDataRow() {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.innerText = this.hasAttribute("noDataText") ? this.getAttribute("noDataText") : TableComp.DEFAULT_NO_DATA_TEXT;
        td.colSpan = this.columnCount;
        tr.appendChild(td);
        this.tableBody.appendChild(tr);
    }

    updateSortArrow() {
        if ( this.sortOrderColIdx === undefined ) return;
        if ( this.sortOrderColIdx === null ) return;
        if ( this.sortOrderColIdx < 0 ) return;

        this.tableHeader.querySelectorAll("span").forEach(e=>e.remove());
        let th = this.headerRow.querySelectorAll("th")[this.sortOrderColIdx];
        let arrow = document.createElement("span");
        arrow.innerHTML = (this.sortOrderFactor===1) ? "&uparrow;" : "&downarrow;";
        arrow.style.display="inline-block";
        arrow.style.margin="0 1em";
        th.appendChild(arrow);
    }

    /**
     * @param colData: Array of objects {title, fieldName[, extractorFn]}
     */
    set columns(colData) {
        this._columns = colData;
        this._columns.forEach( c => {
            if ( !c.extractorFn ) {
                c.extractorFn = (obj)=>obj[c.fieldName];
            }
        });
        this.columnCount = Math.max(1, colData.length);
        this.columnsChanged = true;
        this.refreshRows();
    }

    get columns() {
        return this._columns;
    }

    set data(elements) {
        this.model = elements;
        this.refreshRows();
    }

    get data() {
        return this.model;
    }

    set sortOrder( columnTitle ) {
        if ( this._sortOrder === columnTitle ) {
            this.sortOrderFactor = -1*this.sortOrderFactor;
        } else {
            this._sortOrder = columnTitle;
            this.sortOrderFactor = 1;
        }
        this.refreshRows();
    }

    get sortOrder() {
        return this._sortOrder;
    }

    set filter( aFilter ) {
        this._filter = aFilter;
        // make a filter function s.t. we're always operating on the same thing.
        if ( ! aFilter ) {
            this.filterFn = (e)=>true;
        }
        else if ( typeof aFilter === "function" ) {
            // User supplied an explicit filter.
            this.filterFn = aFilter;
        
        } else if ( typeof aFilter.test === "function" ) {
            // User provided a RegExp
            this.filterFn = function(row){
                for ( let col of this._columns ){
                    let shown = col.extractorFn(row);
                    if ( aFilter.test(shown) ) {
                        return true;
                    }
                }
                return false;
            };
        } else if ( typeof aFilter === "string" ) {
            this.filter = new RegExp(aFilter);
        }
        this.refreshRows();
    }

    get filter() {
        return this._filter;
    }

}

/** Use Bootstrap as a default css link */
TableComp.DEFAULT_CSS_HREF="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
TableComp.DEFAULT_NO_DATA_TEXT="NO DATA";
