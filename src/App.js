import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { GeneTable } from "./GeneTable";
import { HiglassBrowser } from "./HiglassBrowser";
import { Facets } from "./Facets";

function App() {
  return (
    <React.Fragment>
      <div className="container">
        <h1 className="pt-5 py-4 text-center">
          Undiagnosed Diseases Network Cohort Browser
        </h1>
        <div className="row justify-content-md-center">
          <div className="col col-lg-8">
            <p className="text-center lead">
              Explore significantly mutated genes and rare SNV/indel variants
              uncovered from jointly calling whole genome sequences from ~4500
              affected and unaffected individuals enrolled in the Undiagnosed
              Diseases Network.
            </p>
          </div>
        </div>

        <div className="row justify-content-lg-center mt-3">
          <div className="col col-lg-2">
            <a className="btn btn-primary d-inline-block btn-block smooth-scroll" href="#gene-view">Gene View</a>
          </div>
          <div className="col col-lg-2">
            <a className="btn btn-primary d-inline-block btn-block" href="#variant-view">Variant View</a>
          </div>
        </div>
      </div>

      <div className="container mt-5">
        <h2 id="gene-view" className="pt-3">Gene-level statistical analysis</h2>
        <GeneTable />
      </div>

      <div className="container mt-5">
        <h2 id="variant-view">Variant-level browser</h2>
        <div className="row mt-4">
          <div className="col-md-3 ">
            <div className="border p-2 mt-3">
              <Facets />
            </div>
          </div>
          <div className="col-md-9">
            <div className="fixedHeight">
              <HiglassBrowser />
            </div>
            {/* <HiglassBrowser /> */}
          </div>
        </div>
      </div>

      <div className="container-fluid bg-light mt-5 py-4 text-center">
        <div className="mb-1">
          If you have any questions please contact us:
        </div>
        <div>
          <strong>Shilpa Kobren:</strong> shilpa_kobren at hms.harvard.edu
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;
