"use strict";

import React from "react";
import _ from "underscore";
import axios from "axios";

export class GeneSearchBox extends React.PureComponent {
  constructor(props) {
    super(props);
    this.higlassContainer = window.hgc;
    //console.log(this.higlassContainerCohort.current.getHiGlassComponent());

    this.state = {
      results: [],
      currentTextValue: props.value || "",
      loading: false, // starts out by loading base RequestURL
      error: null,
      info: null,
    };

    this.currentRequest = null;
    this.onLoadData = _.debounce(this.onLoadData.bind(this), 500, false);
    this.handleResultClick = this.handleResultClick.bind(this);
  }

  updateCurrentSearchTerm(evt) {
    const val = evt.target.value;
    this.setState(
      {
        currentTextValue: val,
      },
      () => {
        this.onLoadData();
      }
    );
  }

  constructFetchURL() {
    const { currentTextValue } = this.state;
    const url =
      "https://cgap-higlass.com/api/v1/suggest/?d=gene_annotation_hg38&ac=" +
      encodeURIComponent(currentTextValue);
    return url;
  }

  onLoadData() {
    // Don't load anything, if there is only one letter
    if (this.state.currentTextValue.length <= 1) {
      this.setState({
        currentTextValue: this.state.currentTextValue,
        loading: false,
        results: [],
        error: null,
        info: null,
      });
      return;
    }
    this.setState({
      loading: true,
    });

    // TYR is not retrieved correctly - handle it explicitely
    if(this.state.currentTextValue.toLowerCase() === "tyr"){
      const search_result = {
        "chr": "chr11",
        "geneName": "TYR",
        "score": 100,
        "txStart": 89177871,
        "txEnd": 89295759
      };
      this.setState({
        loading: false,
        results: [search_result],
        error: null,
        info: null,
      });
      return;
    }

    axios.get(this.constructFetchURL()).then((response) => {
      let searchResults = null;
      if (response && response.data && response.data.length === 0) {
        searchResults = [];
      } else if (response && response.data && response.data.length > 0) {
        searchResults = response.data;
      }
      console.log(searchResults);

      if (searchResults === null) {
        this.setState({
          loading: false,
          results: [],
          error:
            "Could not get a response from server. Check network and try again.",
          info: null,
        });
      } else if (searchResults.length === 0) {
        this.setState({
          loading: false,
          results: [],
          error: null,
          info: "We could not find any matching genes.",
        });
      } else if (searchResults.length > 0) {
        this.setState({
          loading: false,
          results: searchResults,
          error: null,
          info: null,
        });
      }
    });
  }

  handleResultClick(evt, geneName) {
    evt.preventDefault();
    if (window.hgc && window.hgc.current) {
      const hgc = window.hgc.current;
      const viewconf = hgc.api.getViewConfig();
      const viewId0 = viewconf.views[0].uid;
      const viewId1 = viewconf.views[1].uid;
      if(geneName === "TYR"){
        hgc.api.zoomTo(viewId0, 1897850000, 1897990000, 0, 100, 2000);
        hgc.api.zoomTo(viewId1, 1897850000, 1897990000, 0, 100, 2000);
      }else{
        hgc.api.zoomToGene(viewId0, geneName, 10000, 2000);
        hgc.api.zoomToGene(viewId1, geneName, 5000, 2000);
      }
      
    }
  }

  render() {
    const { results = [], loading, error, info } = this.state;

    const icon = loading ? "fa fa-spinner fa-spin fas" : "fa fa-search fas";

    return (
      <React.Fragment>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text" id="search-for-gene-addon">
              <i className={icon} />
            </span>
          </div>
          <input
            type="text"
            onChange={(evt) => this.updateCurrentSearchTerm(evt)}
            className="form-control"
            placeholder="Search for gene"
            aria-label="Search for gene"
            aria-describedby="search-for-gene-addon"
          />
        </div>
        <GeneSearchResult
          results={results}
          error={error}
          info={info}
          handleResultClick={this.handleResultClick}
        />
      </React.Fragment>
    );
  }
}

const GeneSearchResult = React.memo(function GeneSearchResult(props) {
  const { results, error, info, handleResultClick } = props;

  if (error) {
    return (
      <div className="text-smaller">
        <i className="icon icon-exclamation-triangle fas text-warning ml-05 mr-05"></i>
        {error}
      </div>
    );
  } else if (info) {
    return (
      <div className="text-smaller">
        <i className="icon icon-info-circle fas text-secondary ml-05 mr-05"></i>
        {info}
      </div>
    );
  }

  const resultsFormatted = results.map((result, i) => {
    if (i >= 6) {
      return;
    }

    return (
      <div className="mr-1" key={result.geneName}>
        <small>
          <a
            href="#"
            onClick={(evt) => handleResultClick(evt, result.geneName)}
          >
            {result.geneName}
          </a>
        </small>
      </div>
    );
  });

  return (
    <div className="d-flex flex-row flex-wrap bd-highlight">
      {resultsFormatted}
    </div>
  );
});
