"use strict";

import React from "react";
import { GeneSearchBox } from "./GeneSearchBox";

// VEP consequence levels
const CL_HIGH = "High";
const CL_MODERATE = "Moderate";
const CL_LOW = "Low";
const CL_MODIFIER = "Modifier";

export class Facets extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeConsequenceLevels: [CL_HIGH, CL_MODERATE, CL_LOW, CL_MODIFIER],
    };

    this.changeActiveConsequenceLevels =
      this.changeActiveConsequenceLevels.bind(this);
  }

  componentDidMount() {}

  applyCaddFilter(event, minMax) {
    const val = event.target.value;

    if (window.hgc) {
      const hgc = window.hgc.current;
      const viewconfCohort = hgc.api.getViewConfig();
      viewconfCohort.views[1].tracks.top.forEach((track) => {
        if (track.type === "cohort") {
          track.options["filter"].forEach((filter) => {
            if (filter["field"] === "cadd_phred") {
              if (minMax === "min") {
                filter["target"][0] = val === "" ? 0 : val;
              } else {
                filter["target"][1] = val === "" ? 200 : val;
              }
            }
          });
        }
      });
      hgc.api.setViewConfig(viewconfCohort);
    }
  }

  changeActiveConsequenceLevels(event) {
    const clickedConsequenceLevels = event.target.value;
    const activeConsequenceLevels = [...this.state.activeConsequenceLevels];
    const index = activeConsequenceLevels.indexOf(clickedConsequenceLevels);

    //If found then remove, if not found then add
    if (index > -1) {
      activeConsequenceLevels.splice(index, 1);
    } else {
      activeConsequenceLevels.push(clickedConsequenceLevels);
    }

    this.setState(
      (prevState) => ({
        activeConsequenceLevels: activeConsequenceLevels,
      }),
      () => {
        if (window.hgc) {
          const hgc = window.hgc.current;
          const viewconfCohort = hgc.api.getViewConfig();
          viewconfCohort.views[1].tracks.top.forEach((track) => {
            if (track.type === "cohort") {
              const acl = this.state.activeConsequenceLevels.map((cl) =>
                cl.toUpperCase()
              );
               track.options["filter"].forEach((filter) => {
                if (filter["field"] === "level_most_severe_consequence") {
                  filter["target"] = acl;
                }
              });
            }
          });

          hgc.api.setViewConfig(viewconfCohort);
        }
      }
    );
  }

  render() {
    const consequenceLevels = [CL_HIGH, CL_MODERATE, CL_LOW, CL_MODIFIER];

    return (
      <React.Fragment>
        <div className="row">
          <div className="col">
            <div className="d-block bg-light px-2 mb-2">
              <small>NAVIGATION & DISPLAY</small>
            </div>
            <GeneSearchBox />

            <div className="d-block bg-light px-2 mb-1 mt-3">
              <small>VARIANT LEVEL FILTERING</small>
            </div>
            <div className="mt-2">CADD Score</div>
            <div className="row">
              <div className="col-sm-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    onChange={(evt) => this.applyCaddFilter(evt, "min")}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Max"
                    onChange={(evt) => this.applyCaddFilter(evt, "max")}
                  />
                </div>
              </div>
            </div>

            <div className="">Consequence levels (VEP)</div>
            <div className="row">
              {consequenceLevels.map((cl) => (
                <div className="col-sm-6">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={"cb_" + cl}
                      value={cl}
                      onChange={this.changeActiveConsequenceLevels} 
                      checked={this.state.activeConsequenceLevels.includes(cl) ? "checked" : ""}
                    />
                    <label className="form-check-label" htmlFor={"cb_" + cl}>
                      {cl}
                    </label>
                  </div>

                 
                </div>
              ))}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
