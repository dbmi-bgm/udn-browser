import React from "react";
import CircularProgress from "react-cssfx-loading/lib/CircularProgress";
import { TabixIndexedFile } from "@gmod/tabix";
import VCF from "@gmod/vcf";
import { RemoteFile } from "generic-filehandle";
//import fetch from 'node-fetch'
import { CHROMS } from "./chrom-utils";
import { format } from "d3-format";
import {
  VCF_URL,
  TBI_URL,
  vcfRecordToJson,
  parseLocation,
  infoFieldMapping,
  infoFieldMap,
  availablePopulations,
  availablePopulationValues,
} from "./gene-data-utils";

const PAGE_SIZE = 50;

class GeneTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFilter: false,
      loading: true,
      variants: [],
      displayedVariants: [],
      tablePage: 0,
      filter: {},
    };
    this.variants = [];
    this.loadingVariantsCalled = false;
  }

  componentDidMount() {
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
    this.filterChange = this.filterChange.bind(this);
    this.toggleDetails = this.toggleDetails.bind(this);

    this.loadVariants();
  }

  // componentDidUpdate() {
  //   ReactTooltip.rebuild();
  //   console.log("ss")
  // }

  nextPage() {
    this.setState((prevState) => ({
      tablePage: prevState.tablePage + 1,
    }));
  }

  previousPage() {
    this.setState((prevState) => ({
      tablePage: prevState.tablePage - 1,
    }));
  }

  toggleFilter() {
    this.setState((prevState) => ({
      showFilter: !prevState.showFilter,
    }));
  }

  toggleDetails(event) {
    event.preventDefault();
    const variantId = event.target.dataset.id;
    const variants = this.state.displayedVariants;
    variants.forEach((v) => {
      if (v["id"] === variantId) {
        v["showDetails"] = !v["showDetails"];
      }
    });

    this.setState((prevState) => ({
      displayedVariants: variants,
    }));
  }

  filterChange(event) {
    const filtertype = event.target.dataset.filtertype;
    const filter = this.state.filter;

    filter[filtertype] = event.target.value;
    if (event.target.value === "") {
      delete filter[filtertype];
    }
    this.applyFilter(filter);
  }

  applyFilter(filter) {
    let variants = this.state.variants;
    if (filter["gene"] !== undefined) {
      variants = variants.filter((v) =>
        v["gene_info"].includes(filter["gene"].toLowerCase())
      );
    }
    if (filter["region"] !== undefined && filter["region"] !== "all") {
      variants = variants.filter((v) =>
        v["genomic_regions"].includes(filter["region"])
      );
    }
    if (filter["from"] !== undefined) {
      const locFrom = parseLocation(filter["from"]);
      if (locFrom) {
        variants = variants.filter((v) => {
          return v["posAbs"] >= locFrom["posAbs"];
        });
      }
    }
    if (filter["to"] !== undefined) {
      const locTo = parseLocation(filter["to"]);
      if (locTo) {
        variants = variants.filter((v) => {
          return v["posAbs"] <= locTo["posAbs"];
        });
      }
    }

    this.setState((prevState) => ({
      filter: filter,
      displayedVariants: variants,
      tablePage: 0,
    }));
  }

  loadVariants() {
    if (this.loadingVariantsCalled) {
      return;
    }
    this.loadingVariantsCalled = true;

    this.vcfFile = new TabixIndexedFile({
      filehandle: new RemoteFile(VCF_URL),
      tbiFilehandle: new RemoteFile(TBI_URL),
    });
    const vcfHeader = this.vcfFile.getHeader(); // Promise

    vcfHeader.then((header) => {
      const tbiVCFParser = new VCF({ header: header });
      const dataPromises = [];
      CHROMS.forEach((chrom) => {
        const dataPromise = this.vcfFile.getLines(
          chrom["name"],
          0,
          chrom["length"],
          (line) => {
            const vcfRecord = tbiVCFParser.parseLine(line);
            //console.log(vcfRecord);
            this.variants.push(vcfRecordToJson(vcfRecord, chrom));
          }
        );
        dataPromises.push(dataPromise);
      });

      Promise.all(dataPromises).then((values) => {
        this.setState((prevState) => ({
          loading: false,
          variants: this.variants,
          displayedVariants: this.variants,
        }));
        //console.log(this.variants);
      });
    });
  }

  populationTableRow(variantInfos, key) {
    const cols = [];
    availablePopulations.forEach((pop) => {
      const property = pop + "_" + key;
      const info = variantInfos[property];

      if (info !== undefined) {
        let val = info[0];
        if (
          infoFieldMapping(property) &&
          infoFieldMapping(property)["format"] &&
          val !== 0
        ) {
          val = format(infoFieldMapping(property)["format"])(val);
        }
        cols.push(<td>{val}</td>);
      } else {
        cols.push(<td>-</td>);
      }
    });

    return (
      <tr>
        <td>{availablePopulationValues[key]["title"]}</td>
        {cols}
      </tr>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="text-center">
          <CircularProgress color="#999999" width="50px" height="50px" />
          <div className="mt-2 mb-5 small text-muted">Loading variants...</div>
        </div>
      );
    }

    const variantRows = [];
    const variantsToDisplay = this.state.displayedVariants.sort(
      (a, b) => a.posAbs - b.posAbs
    );
    const variantsToDisplaySliced = variantsToDisplay.slice(
      this.state.tablePage * PAGE_SIZE,
      (this.state.tablePage + 1) * PAGE_SIZE
    );

    variantsToDisplaySliced.forEach((variant, index) => {
      const gene_info = [];
      variant.gene_info_disp.forEach((gene) => {
        gene_info.push(
          <span className="badge bg-light text-muted d-inline-block me-1">
            {gene}
          </span>
        );
      });

      variantRows.push(
        <tr className={variant.showDetails ? "table-secondary" : ""}>
          <td>{variant.chrom}</td>
          <td>{format(",.0f")(variant.start)}</td>
          <td>{format(",.0f")(variant.end)}</td>
          <td>{variant.length}</td>
          <td>{variant.af}</td>
          <td>{gene_info}</td>
          <td>
            <a
              href="#"
              className="link-primary"
              data-id={variant.id}
              onClick={this.toggleDetails}
            >
              Details
            </a>
          </td>
        </tr>
      );
      if (variant.showDetails) {
        const generalInfos = [];
        const properties = [];
        for (const property in variant.info) {
          properties.push(property);
        }
        //properties.sort();
        properties.forEach((property) => {
          if (
            infoFieldMapping(property) &&
            infoFieldMapping(property)["cat"] !== "general"
          ) {
            return;
          }
          const title = infoFieldMapping(property)
            ? infoFieldMapping(property)["title"]
            : property;
          const desc = infoFieldMapping(property)
            ? infoFieldMapping(property)["desc"]
            : property;
          let val = variant.info[property][0];
          if (
            infoFieldMapping(property) &&
            infoFieldMapping(property)["format"] &&
            val !== 0
          ) {
            val = format(infoFieldMapping(property)["format"])(val);
          }
          generalInfos.push(
            <div className="col-md-6">
              <strong>{title}:</strong> {val}
            </div>
          );
        });

        let populationFreqTable = (
          <table className="table table-sm">
            <thead>
              <tr>
                <th></th>
                {availablePopulations.map((pop) => (
                  <th>{pop}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(availablePopulationValues).map((key) => {
                return this.populationTableRow(variant.info, key);
              })}
            </tbody>
          </table>
        );

        variantRows.push(
          <tr className="details-row">
            <td colSpan={7} className="p-3">
              <div className="row">{generalInfos}</div>
              {/* <ReactTooltip place="top" type="dark" effect="solid" /> */}
              <div className="mt-4 mb-2 fs-5">Population frequencies</div>

              {populationFreqTable}
            </td>
          </tr>
        );
      }
    });

    const navButtons = [];
    if (this.state.tablePage > 0) {
      navButtons.push(
        <button
          className="btn btn-primary btn-sm mx-2"
          onClick={this.previousPage}
        >
          Previous
        </button>
      );
    }

    if (
      variantsToDisplay.length > PAGE_SIZE &&
      (this.state.tablePage + 1) * PAGE_SIZE <= variantsToDisplay.length
    ) {
      navButtons.push(
        <button className="btn btn-primary btn-sm" onClick={this.nextPage}>
          Next
        </button>
      );
    }

    let message = "No variants found";
    if (variantsToDisplay.length > 0) {
      message = `Displaying variants ${
        this.state.tablePage * PAGE_SIZE + 1
      }-${Math.min(
        (this.state.tablePage + 1) * PAGE_SIZE,
        variantsToDisplay.length
      )} of ${variantsToDisplay.length}`;
    }

    // let legend = "";
    // if(this.state.showLegend){
    //   const legendItems = [];
    //   Object.keys(infoFieldMap).forEach(key => {
    //     legendItems.push(<div>
    //       <div>{key}</div>
    //       <div>{infoFieldMap[key]["desc"]}</div>
    //     </div>);
    //   })

    //   legend = (
    //     <div className="p-2">
    //       {legendItems}
    //     </div>
    //   );
    // }

    return (
      <div>
        <h3 className="py-4">Browse variants</h3>

        <div className="d-flex mb-2">
          <div className="me-auto"></div>
          <button
            className="btn btn-primary me-auto btn-sm collapse"
            onClick={this.toggleFilter}
          >
            Filter
          </button>

          <div className="pt-1 mx-2">{message}</div>
          {navButtons}
        </div>

        <div className="row pb-5">
          <div className="col-md-3 col-xl-2">
            <div className="small pt-1 text-muted">FILTER</div>
            <div className="mt-1 p-3 bg-light">
              <div className="mb-2">
                <label
                  htmlFor="filter-from"
                  className="form-label small fw-bold"
                >
                  From
                </label>
                <input
                  className="form-control form-control-sm"
                  id="filter-from"
                  placeholder="e.g. chr1:1000000"
                  data-filtertype="from"
                  onChange={this.filterChange}
                />
              </div>
              <div className="mb-2">
                <label htmlFor="filter-to" className="form-label small fw-bold">
                  To
                </label>
                <input
                  className="form-control form-control-sm"
                  id="filter-to"
                  placeholder="e.g. chr3:20000000"
                  data-filtertype="to"
                  onChange={this.filterChange}
                />
              </div>
              <div className="mb-2">
                <label
                  htmlFor="filter-gene"
                  className="form-label small fw-bold"
                >
                  Gene
                </label>
                <input
                  className="form-control form-control-sm"
                  id="filter-gene"
                  data-filtertype="gene"
                  placeholder="e.g. TNFRSF8"
                  onChange={this.filterChange}
                />
              </div>
              <div className="mb-2">
                <label
                  htmlFor="filter-region"
                  className="form-label small fw-bold"
                >
                  Genomic region
                </label>
                <select
                  className="form-select form-select-sm"
                  id="filter-region"
                  onChange={this.filterChange}
                  data-filtertype="region"
                  defaultValue={"all"}
                >
                  <option value="all">All</option>
                  <option value="exon">exon</option>
                  <option value="intron">intron</option>
                  <option value="intergenic">intergenic</option>
                </select>
              </div>
            </div>
          </div>
          <div className="col-md-9 col-xl-10">
            <div className="table-responsive-lg">
              <table className="table table-hover table-sm">
                <thead className="sticky-table-header bg-white">
                  <tr>
                    <th scope="col">Chrom.</th>
                    <th scope="col">Start</th>
                    <th scope="col">End</th>
                    <th scope="col">Length</th>
                    <th scope="col">Allele Frequency</th>
                    <th scope="col">Gene info</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>{variantRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GeneTable;
