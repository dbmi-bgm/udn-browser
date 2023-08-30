"use strict";

import React from "react";
import { GeneSearchBox } from "./GeneSearchBox";
import Select from "react-select";
import {
  KEGG_CATEGORY_OPTIONS,
  STATISTICAL_TEST_OPTIONS,
  SELECTED_STATISTICAL_TEST,
} from "./config";
//import makeAnimated from 'react-select/animated';
import viewConfigClinvar from "./viewConfig.clinvar.json";
import viewConfigTranscripts from "./viewConfig.transcripts.json";
import viewConfigGnomad from "./viewConfig.gnomad.json";
import viewConfigOrthologs from "./viewConfig.orthologs.json";

const VIEW_CONFIGS = {
  clinvar: viewConfigClinvar.viewConfigClinvar,
  transcripts: viewConfigTranscripts.viewConfigTranscripts,
  gnomad: viewConfigGnomad.viewConfigGnomad,
  orthologs: viewConfigOrthologs.viewConfigOrthologs,
};

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
      selectedKeggCategory: null,
      selectedStatisticalTest: SELECTED_STATISTICAL_TEST,
      isTranscriptsTrackVisible: false,
      isClinvarTrackVisible: false,
      isGnomadTrackVisible: false,
      isOrthologsTrackVisible: false,
    };
  }

  componentDidMount() {}

  handleStatTestChange = (selectedStatisticalTest) => {
    this.setState({ selectedStatisticalTest }, () => {
      if (!window.hgc) {
        return;
      }
      const hgc = window.hgc.current;
      const viewconfCohort = hgc.api.getViewConfig();
      viewconfCohort.views[1].tracks.top.forEach((track) => {
        if (track.type === "geneList") {
          track.options["yValue"]["field"] = selectedStatisticalTest.value;
        }
      });
      hgc.api.setViewConfig(viewconfCohort);
    });
  };

  handleKeggChange = (selectedKeggCategory) => {
    this.setState({ selectedKeggCategory }, () => {
      if (!window.hgc) {
        return;
      }
      const hgc = window.hgc.current;
      const viewconfCohort = hgc.api.getViewConfig();
      viewconfCohort.views[1].tracks.top.forEach((track) => {
        if (track.type === "cohort" || track.type === "geneList") {
          const newFilter = [];
          track.options["filter"].forEach((filter) => {
            if (filter["field"] !== "kegg_category") {
              newFilter.push(filter);
            }
          });
          if (
            this.state.selectedKeggCategory &&
            this.state.selectedKeggCategory.length > 0
          ) {
            const keggFilter = {
              field: "kegg_category",
              operator: "has_one_of",
              target: this.state.selectedKeggCategory.map((c) => c.value),
            };
            newFilter.push(keggFilter);
          }
          track.options["filter"] = newFilter;
        }
      });
      hgc.api.setViewConfig(viewconfCohort);
    });
  };

  togglePluginTrack = (event) => {
    const clickedTrackType = event.target.value;
    const isTrackAdded = event.target.checked;

    this.setState(
      {
        isTranscriptsTrackVisible:
          clickedTrackType === "transcripts"
            ? !this.state.isTranscriptsTrackVisible
            : this.state.isTranscriptsTrackVisible,
        isClinvarTrackVisible:
          clickedTrackType === "clinvar"
            ? !this.state.isClinvarTrackVisible
            : this.state.isClinvarTrackVisible,
        isGnomadTrackVisible:
          clickedTrackType === "gnomad"
            ? !this.state.isGnomadTrackVisible
            : this.state.isGnomadTrackVisible,
        isOrthologsTrackVisible:
          clickedTrackType === "orthologs"
            ? !this.state.isOrthologsTrackVisible
            : this.state.isOrthologsTrackVisible,
      },
      () => {
        if (!window.hgc) {
          return;
        }
        const hgc = window.hgc.current;
        const viewconfCohort = hgc.api.getViewConfig();
        const existingTracks = viewconfCohort.views[1].tracks.top;
        if (isTrackAdded) {
          const relevantViewConf = VIEW_CONFIGS[clickedTrackType];
          const newTracks = relevantViewConf.views[0].tracks.top;
          existingTracks.push.apply(existingTracks, newTracks);
        } else {
          const newTracks = [];
          existingTracks.forEach((track) => {
            if (!track.uid.includes(clickedTrackType)) {
              newTracks.push(track);
            }
          });
          viewconfCohort.views[1].tracks.top = newTracks;
        }
        // hgc.api.setViewConfig(viewconfCohort).then(() => {
        //   viewconfCohort.views[1].tracks.top.forEach((track) =>{
        //     if (track.uid === "transcripts_annotation") {
        //       track["height"] = 90;
        //       console.log(track, track["height"]);
        //     }
        //   });
        //   console.log(viewconfCohort);
        //   hgc.api.setViewConfig(viewconfCohort);
        // });
        hgc.api.setViewConfig(viewconfCohort);
        hgc.adjustLayoutToTrackSizes(viewconfCohort.views[1]);
      }
    );
  };

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

  changeActiveConsequenceLevels = (event) => {
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
  };

  exportDisplay = () => {
    const hgc = window.hgc.current;
    if (!hgc) {
      console.warn("Higlass component not found.");
      return;
    }
    const svg = hgc.api.exportAsSvg();

    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
    );
    element.setAttribute("download", "cohort.svg");
    element.click();
  };

  render() {
    const consequenceLevels = [CL_HIGH, CL_MODERATE, CL_LOW, CL_MODIFIER];

    const { selectedKeggCategory, selectedStatisticalTest } = this.state;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col">
            <div className="d-block bg-light px-2 mb-2">
              <small>NAVIGATION & DISPLAY</small>
            </div>
            <GeneSearchBox />
            <div className="form-check mt-3">
              <input
                type="checkbox"
                id="toggle-transcripts-check"
                className="form-check-input"
                value="transcripts"
                onChange={this.togglePluginTrack}
                checked={this.state.isTranscriptsTrackVisible ? "checked" : ""}
              />
              <label
                className="form-check-label"
                htmlFor="toggle-transcripts-check"
              >
                Show gene transcripts
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="checkbox"
                id="toggle-clinvar-check"
                className="form-check-input"
                value="clinvar"
                onChange={this.togglePluginTrack}
                checked={this.state.isClinvarTrackVisible ? "checked" : ""}
              />
              <label
                className="form-check-label"
                htmlFor="toggle-clinvar-check"
              >
                Show Clinvar annotations
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="checkbox"
                id="toggle-gnomad-check"
                className="form-check-input"
                value="gnomad"
                onChange={this.togglePluginTrack}
                checked={this.state.isGnomadTrackVisible ? "checked" : ""}
              />
              <label className="form-check-label" htmlFor="toggle-gnomad-check">
                Show GnomAD allele frequencies
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                type="checkbox"
                id="toggle-orthologs-check"
                className="form-check-input"
                value="orthologs"
                onChange={this.togglePluginTrack}
                checked={this.state.isOrthologsTrackVisible ? "checked" : ""}
              />
              <label
                className="form-check-label"
                htmlFor="toggle-orthologs-check"
              >
                Show orthologs
              </label>
            </div>

            <div className="d-block bg-light px-2 mb-1 mt-3">
              <small>GENE LEVEL FILTERING</small>
            </div>

            <div className="mt-2">KEGG category</div>
            <Select
              value={selectedKeggCategory}
              onChange={this.handleKeggChange}
              options={KEGG_CATEGORY_OPTIONS}
              closeMenuOnSelect={false}
              isMulti
              placeholder="Select multiple..."
            />

            <div className="mt-2">Statistical test</div>
            <Select
              value={selectedStatisticalTest}
              onChange={this.handleStatTestChange}
              options={STATISTICAL_TEST_OPTIONS}
            />

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

            <div className="mt-1">Consequence levels (VEP)</div>
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
                      checked={
                        this.state.activeConsequenceLevels.includes(cl)
                          ? "checked"
                          : ""
                      }
                    />
                    <label className="form-check-label" htmlFor={"cb_" + cl}>
                      {cl}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-block mb-1 mt-3">
              <button
                type="button"
                className="btn btn-primary btn-sm btn-block"
                onClick={this.exportDisplay}
              >
                <i className="icon icon-download icon-sm fas mr-1"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
