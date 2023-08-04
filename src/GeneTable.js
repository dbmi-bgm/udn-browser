import React from "react";
import CircularProgress from "react-cssfx-loading/lib/CircularProgress";
import { TabixIndexedFile } from "@gmod/tabix";
import VCF from "@gmod/vcf";
import { RemoteFile } from "generic-filehandle";
//import fetch from 'node-fetch'
import { CHROMS } from "./chrom-utils";
import { format } from "d3-format";
import { vcfRecordToJson, parseLocation } from "./gene-data-utils";

import { GENE_VCF_URL, GENE_TBI_URL } from "./config";

const PAGE_SIZE = 30;

export class GeneTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFilter: false,
      loading: true,
      variants: [],
      displayedVariants: [],
      tablePage: 0,
      filter: {},
      showGoTerms: false,
    };
    this.variants = [];
    this.loadingVariantsCalled = false;
  }

  componentDidMount() {
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.filterChange = this.filterChange.bind(this);
    this.toggleGoTerms = this.toggleGoTerms.bind(this);

    this.loadVariants();
  }

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

  toggleGoTerms() {
    this.setState((prevState) => ({
      showGoTerms: !prevState.showGoTerms,
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
        v["symbol"].toLowerCase().includes(filter["gene"].toLowerCase())
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
      filehandle: new RemoteFile(GENE_VCF_URL),
      tbiFilehandle: new RemoteFile(GENE_TBI_URL),
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
            const vcfRecordJson = vcfRecordToJson(vcfRecord, chrom);
            //console.log(vcfRecord, vcfRecordJson);
            this.variants.push(vcfRecordJson);
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
      });
    });
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
      const goTerms = [];
      variant.goTerms.forEach((goTerm) => {
        goTerms.push(
          <div>
            <span className="badge bg-light text-muted me-1">{goTerm}</span>
          </div>
        );
      });

      const kegg = [];
      variant.keggCategory.forEach((k) => {
        kegg.push(
          <div>
            <span className="badge bg-light text-muted me-1">{k}</span>
          </div>
        );
      });

      const deNovoWestPvalue =
        variant.deNovoWestPvalue === 0 ? "-" : variant.deNovoWestPvalue;
      const biallelicPvalue =
        variant.biallelicPvalue === 0 ? "-" : variant.biallelicPvalue;

      variantRows.push(
        <tr>
          <td>{variant.symbol}</td>
          <td>{variant.chrom}</td>
          <td>{deNovoWestPvalue}</td>
          <td>{biallelicPvalue}</td>
          <td>{kegg}</td>
          <td className={this.state.showGoTerms ? "" : "collapse"}>
            {goTerms}
          </td>
        </tr>
      );
    });

    const navButtons = [];

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

    let message = "No genes found";
    if (variantsToDisplay.length > 0) {
      message = `Displaying genes ${
        this.state.tablePage * PAGE_SIZE + 1
      }-${Math.min(
        (this.state.tablePage + 1) * PAGE_SIZE,
        variantsToDisplay.length
      )} of ${variantsToDisplay.length}`;
    }

    return (
      <div>
        <div className="d-flex flex-row-reverse">
          {navButtons}
          <div className="pt-1 mx-2 ">{message}</div>
        </div>

        <div className="row pb-5 pt-4">
          <div className="col-md-3">
            <div className="small pt-1">FILTER</div>
            <div className="mt-1 p-3 border">
            <div >Gene</div>
              <input
                className="form-control"
                id="filter-gene"
                data-filtertype="gene"
                placeholder="e.g. TNFRSF8"
                onChange={this.filterChange}
              />
              <div className="mt-2">From</div>
              <input
                className="form-control"
                id="filter-from"
                placeholder="e.g. chr1:1000000"
                data-filtertype="from"
                onChange={this.filterChange}
              />
              <div className="mt-2">To</div>
              <input
                className="form-control"
                id="filter-to"
                placeholder="e.g. chr3:20000000"
                data-filtertype="to"
                onChange={this.filterChange}
              />
              
              <div className="custom-control custom-checkbox mt-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="customCheck1"
                  onChange={this.toggleGoTerms}
                />
                <label className="custom-control-label" htmlFor="customCheck1">
                  Show GO terms
                </label>
              </div>
            </div>
          </div>
          <div className="col-md-9">
            <div className="table-responsive-lg">
              <table className="table table-hover table-sm">
                <thead className="sticky-table-header bg-white">
                  <tr>
                    <th scope="col">Gene</th>
                    <th scope="col">Chromosome</th>
                    <th scope="col">DeNovoWEST p-value</th>
                    <th scope="col">Biallelic p-value</th>
                    <th scope="col">KEGG category</th>
                    <th
                      scope="col"
                      className={this.state.showGoTerms ? "" : "collapse"}
                    >
                      GO terms
                    </th>
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
