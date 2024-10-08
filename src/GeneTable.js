import React from "react";
import CircularProgress from "react-cssfx-loading/lib/CircularProgress";
import { TabixIndexedFile } from "@gmod/tabix";
import VCF from "@gmod/vcf";
import { RemoteFile } from "generic-filehandle";
//import fetch from 'node-fetch'
import { CHROMS } from "./chrom-utils";
import Select from "react-select";
import { Tooltip } from "react-tooltip";
import { format } from "d3-format";
import { vcfRecordToJson, parseLocation } from "./gene-data-utils";

import { GENE_VCF_URL, GENE_TBI_URL, KEGG_CATEGORY_OPTIONS } from "./config";

const PAGE_SIZE = 30;
const DE_NOVO_WEST_P = "deNovoWestPvalue";
const RAMEDIES_P = "ramediesPvalue";
const RAMEDIES_COMPH_P = "ramediescomphPvalue";

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
      sortBy: RAMEDIES_P,
      showGoTerms: false,
      selectedKeggCategory: null,
    };
    this.variants = [];
    this.loadingVariantsCalled = false;
  }

  componentDidMount() {
    this.loadVariants();
  }

  nextPage = () => {
    this.setState((prevState) => ({
      tablePage: prevState.tablePage + 1,
    }));
  };

  previousPage = () => {
    this.setState((prevState) => ({
      tablePage: prevState.tablePage - 1,
    }));
  };

  handleKeggChange = (selectedKeggCategory) => {
    this.setState((prevState) => ({
      selectedKeggCategory: selectedKeggCategory,
    }));
  };

  toggleGoTerms = () => {
    this.setState((prevState) => ({
      showGoTerms: !prevState.showGoTerms,
    }));
  };

  sortTable = (event) => {
    this.setState((prevState) => ({
      sortBy: event.target.dataset.col,
    }));
  };

  filterChange = (event) => {
    const filtertype = event.target.dataset.filtertype;
    const filter = this.state.filter;

    filter[filtertype] = event.target.value;
    if (event.target.value === "") {
      delete filter[filtertype];
    }
    this.applyFilter(filter);
  };

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
    const selectedKeggCategories = this.state.selectedKeggCategory
      ? this.state.selectedKeggCategory.map((c) => c.value)
      : [];
    const variantsToDisplay = this.state.displayedVariants
      .filter((v) => {
        if (selectedKeggCategories.length === 0) {
          return true;
        }
        const keggIntersect = v.keggCategory.filter((c) =>
          selectedKeggCategories.includes(c)
        );
        return keggIntersect.length > 0;
      })
      .sort((a, b) => b[this.state.sortBy] - a[this.state.sortBy]);
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
      variant.keggCategoryFormatted.forEach((k) => {
        kegg.push(
          <div>
            <span className="badge bg-light text-muted me-1">{k}</span>
          </div>
        );
      });

      const deNovoWestPvalue =
        variant.deNovoWestPvalue === 0 ? "-" : variant.deNovoWestPvalue;
      const ramediesPvalue =
        variant.ramediesPvalue === 0 ? "-" : variant.ramediesPvalue;
      const ramediescomphPvalue =
        variant.ramediescomphPvalue === 0 ? "-" : variant.ramediescomphPvalue;

      variantRows.push(
        <tr>
          <td>{variant.symbol}</td>
          <td>{variant.chrom}</td>
          <td>{ramediesPvalue}</td>
          <td>{deNovoWestPvalue}</td>
          <td>{ramediescomphPvalue}</td>
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

    let sortSymbolClassDeNovo =
      "fa fa-sort-amount-desc pointer gene-table-sort-symbol pl-1";
    sortSymbolClassDeNovo =
      this.state.sortBy === DE_NOVO_WEST_P
        ? sortSymbolClassDeNovo + " active"
        : sortSymbolClassDeNovo;

    let sortSymbolClassRamediesPvalue =
      "fa fa-sort-amount-desc pointer gene-table-sort-symbol pl-1";
    sortSymbolClassRamediesPvalue =
      this.state.sortBy === RAMEDIES_P
        ? sortSymbolClassRamediesPvalue + " active"
        : sortSymbolClassRamediesPvalue;

    let sortSymbolClassRamediesComphPvalue =
      "fa fa-sort-amount-desc pointer gene-table-sort-symbol pl-1";
    sortSymbolClassRamediesComphPvalue =
      this.state.sortBy === RAMEDIES_COMPH_P
        ? sortSymbolClassRamediesComphPvalue + " active"
        : sortSymbolClassRamediesComphPvalue;

    return (
      <div>
        <Tooltip id="denovo_tooltip" style={{ zIndex: "2000" }} />
        <Tooltip id="RaMeDiES_tooltip_1" style={{ zIndex: "2000" }} />
        <Tooltip id="RaMeDiES_tooltip_2" style={{ zIndex: "2000" }} />
        <div className="d-flex flex-row-reverse">
          {navButtons}
          <div className="pt-1 mx-2 ">{message}</div>
        </div>

        <div className="row pb-5 pt-4">
          <div className="col-md-3">
            <div className="small pt-1">FILTER</div>
            <div className="mt-1 p-3 border">
              <div>Gene</div>
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

              <div className="mt-2">KEGG category</div>
              <Select
                value={this.state.selectedKeggCategory}
                onChange={this.handleKeggChange}
                options={KEGG_CATEGORY_OPTIONS}
                closeMenuOnSelect={false}
                isMulti
                placeholder="Select multiple..."
              />
            </div>
          </div>
          <div className="col-md-9">
            <div className="table-responsive-lg">
              <table className="table table-hover table-sm">
                <thead className="sticky-table-header bg-white">
                  <tr>
                    <th scope="col" className="align-middle">
                      Gene
                    </th>
                    <th scope="col" className="align-middle">
                      Chrom.
                    </th>
                    <th scope="col">
                      <div className="d-flex flex-row bd-highlight">
                        <div className="align-self-center">
                          <span
                            data-tooltip-id="RaMeDiES_tooltip_1"
                            data-tooltip-html="-log10 of the unadjusted GeneBayes-weighted <br/>
                            Q-values computed by RaMeDiES-DN, the<br/>
                            closed-form statistic for assessing the<br/>
                            significance of de novo variant cohort-level<br/>
                            recurrence. Coding SNVs and indel<br/>
                            variants scored by AlphaMissense, <br/>
                            PrimateAI-3D, CADD & REVEL are considered."
                            className="underline-dotted"
                          >
                            RaMeDiES denovos{" "}
                            <span className="text-nowrap">p-value</span>
                          </span>
                          
                        </div>
                        <div className="pl-1 pr-2 align-self-center">
                          <i
                            className={sortSymbolClassRamediesPvalue}
                            onClick={this.sortTable}
                            data-col={RAMEDIES_P}
                          ></i>
                        </div>
                      </div>
                    </th>
                    <th scope="col">
                      <div className="d-flex flex-row bd-highlight">
                        <div className="align-self-center">
                        <span
                            data-tooltip-id="denovo_tooltip"
                            data-tooltip-html="-log10 of the unadjusted pvalue computed <br/>
                             by DeNovoWEST on the set of de novo <br/>
                              SNV/indels across all affected individuals; <br/>
                               gain-of-function (missense clustering <br/>
                                and enrichment) and loss-of-function <br/>
                                 (all mutational enrichment) models are applied."
                            className="underline-dotted"
                          >
                            DeNovoWEST{" "}
                            <span className="text-nowrap">p-value</span>
                          </span>
                          
                        </div>
                        <div className="pl-1 pr-2 align-self-center">
                          <i
                            className={sortSymbolClassDeNovo}
                            onClick={this.sortTable}
                            data-col={DE_NOVO_WEST_P}
                          ></i>
                        </div>
                      </div>
                    </th>
                    <th scope="col">
                      <div className="d-flex flex-row bd-highlight">
                        <div className="align-self-center">
                          <span
                            data-tooltip-id="RaMeDiES_tooltip_2"
                            data-tooltip-html="-log10 of the unadjusted p-values computed <br/>
                            by RaMeDiES-IND, the closed-form statistic <br/>
                            for assessing the significance of individual-level <br/>
                            compound heterozygous variants. Coding SNVs and <br/>
                            indel variants scored by AlphaMissense, <br/>
                            PrimateAI-3D, CADD & REVEL are considered <br/>
                            alongside intronic SNVs and indels scored by SpliceAI."
                            className="underline-dotted"
                          >
                            RaMeDiES comphet{" "}
                            <span className="text-nowrap">p-value</span>
                          </span>
                        </div>
                        <div className="pl-1 pr-2 align-self-center">
                          <i
                            className={sortSymbolClassRamediesComphPvalue}
                            onClick={this.sortTable}
                            data-col={RAMEDIES_COMPH_P}
                          ></i>
                        </div>
                      </div>
                    </th>
                    <th scope="col" className="align-middle">
                      KEGG category
                    </th>
                    <th
                      scope="col"
                      className={
                        this.state.showGoTerms
                          ? "align-middle"
                          : "align-middle collapse"
                      }
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
