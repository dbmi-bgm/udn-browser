import logo from "./logo.svg";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
//import { HiGlassAjaxLoadContainer } from './HiGlassAjaxLoadContainer';
import { HiglassBrowser } from "./HiglassBrowser";
import { GeneTable } from "./GeneTable";
import { Facets } from "./Facets";

function App() {
  return (
    <React.Fragment>
      <div className="container">
        <h1 className="pt-5 py-4 text-center">UDN Cohort Browser</h1>
        <h6 className="text-center">
          Description of the data set and link to the publication.
        </h6>
      </div>

      <div className="container mt-5">
        <h2 >Gene-level statistical analysis</h2>
        <GeneTable />
      </div>

      {/* <div className="container mt-5">
        <h2 >Variant-level browser</h2>
        <div className="row mt-4">
          <div className="col-md-3 ">
            <div className="border p-2 mt-3">
              <Facets />
            </div>
            
          </div>
          <div className="col-md-9">
            <HiglassBrowser />
          </div>
        </div>
      </div> */}

      <div className="container-fluid bg-light mt-2 py-4 text-center">
        <div className="mb-1">
          If you have any questions or suggestions please contact us:
        </div>
        <div>
          <strong>Shilpa:</strong> shilpa at hms.harvard.edu
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;
