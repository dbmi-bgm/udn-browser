import { CHROMS, chr2Abs } from "./chrom-utils";
import { format } from "d3-format";

export const vcfRecordToJson = (vcfRecord, chrom) => {
  const info = vcfRecord["INFO"];
  const posAbs = chr2Abs(vcfRecord.CHROM, +vcfRecord.POS);

  //DeNovoWEST_pvalue, biallelic_pvalue, go_terms, and kegg_category

  const deNovoWestPvalue = info["DeNovoWEST_pvalue"]
    ? format(",.2f")(info["DeNovoWEST_pvalue"][0])
    : 0;
  const biallelicPvalue = info["biallelic_pvalue"]
    ? format(",.2f")(info["biallelic_pvalue"][0])
    : 0;
  const goTerms = info["go_terms"]
    ? info["go_terms"][0].split("|").map((k) => k.replaceAll("_", " "))
    : [];
  const keggCategory = info["kegg_category"]
    ? info["kegg_category"][0].split("|").map((k) => k.replaceAll("_", " "))
    : [];

  return {
    id: vcfRecord.ID,
    chrom: vcfRecord.CHROM,
    chromOrder: chrom["order"],
    start: vcfRecord.POS,
    end: info.END[0],
    posAbs: posAbs,
    symbol: info.SYMBOL[0],
    deNovoWestPvalue: deNovoWestPvalue,
    biallelicPvalue: biallelicPvalue,
    goTerms: goTerms,
    keggCategory: keggCategory,
  };
};

export const parseLocation = (str) => {
  const chromNames = CHROMS.map((c) => c.name);
  if (str.includes(":")) {
    const ss = str.split(":").filter((n) => n); // remove empty elements
    if (ss.length === 1 && chromNames.includes(ss[0])) {
      const chrName = ss[0];
      return {
        posAbs: chr2Abs(chrName, 0),
      };
    } else if (
      ss.length > 1 &&
      chromNames.includes(ss[0]) &&
      parseInt(ss[1], 10)
    ) {
      const chrName = ss[0];
      const pos = parseInt(ss[1], 10);
      return {
        posAbs: chr2Abs(chrName, pos),
      };
    }
  } else if (chromNames.includes(str)) {
    return {
      posAbs: chr2Abs(str, 0),
    };
  }

  return null;
};
