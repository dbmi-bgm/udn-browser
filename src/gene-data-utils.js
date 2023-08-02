import { CHROMS, chr2Abs } from "./chrom-utils";
import { format } from "d3-format";

export const VCF_URL =
  "https://raw.githubusercontent.com/parklab/SVA_catalog/main/data/SVA_variants.gz";
export const TBI_URL =
  "https://raw.githubusercontent.com/parklab/SVA_catalog/main/data/SVA_variants.gz.tbi";

export const vcfRecordToJson = (vcfRecord, chrom) => {
  const info = vcfRecord["INFO"];
  const posAbs = chr2Abs(vcfRecord.CHROM, +vcfRecord.POS);
  const gene_info = info.GENE_INFO ? info.GENE_INFO[0].toLowerCase() : "";
  const gene_info_disp = [];
  if (info.GENE_INFO) {
    const gene_split = info.GENE_INFO[0].split("/");
    gene_split.forEach((gene) => {
      const info_split = gene.split(":");
      if (info_split.length > 1) {
        const first = info_split[0];
        const last = info_split[info_split.length - 1];
        gene_info_disp.push(first + ":" + last);
      } else {
        gene_info_disp.push(
          info_split[0].replace("not_gene_region", "intergenic")
        );
      }
    });
  }

  let genomic_regions = [];
  gene_info_disp.forEach((region) => {
    if (region.includes("exon")) {
      genomic_regions.push("exon");
    } else if (region.includes("intron")) {
      genomic_regions.push("intron");
    } else {
      genomic_regions.push("intergenic");
    }
  });

  const af = format(".2e")(info.AF[0]);

  return {
    id: vcfRecord.ID,
    chrom: vcfRecord.CHROM,
    chromOrder: chrom["order"],
    start: vcfRecord.POS,
    end: info.END[0],
    length: info.SVLEN[0] < 50 ? "NA" : info.SVLEN[0],
    type: info.SVTYPE[0],
    info: info,
    gene_info: gene_info,
    genomic_regions: genomic_regions,
    gene_info_disp: gene_info_disp,
    posAbs: posAbs,
    af: af,
    showDetails: false,
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

export const availablePopulations = [
  "AFR",
  "AMR",
  "CAS",
  "EAS",
  "EUR",
  "OCN",
  "SAS",
  "WAS",
];
export const availablePopulationValues = {
  AC: {
    title: "Allele Count",
    key: "AC",
  },
  AF: {
    title: "Allele Frequency",
    key: "AF",
  },
  AN: {
    title: "Allele Number",
    key: "AN",
  },
  FREQ_HET: {
    title: "Het. genotype frequency",
    key: "FREQ_HET",
  },
  FREQ_HOMALT: {
    title: "Hom. alt. genotype frequency",
    key: "FREQ_HOMALT",
  },
  N_BI_GENOS: {
    title: "Individuals with complete genotypes",
    key: "N_BI_GENOS",
  },
  N_HET: {
    title: "Individuals with het. genotypes",
    key: "N_HET",
  },
  N_HOMALT: {
    title: "Individuals with hom. alt. genotypes",
    key: "N_HOMALT",
  },
  N_HOMREF: {
    title: "Individuals with hom. ref. genotypes",
    key: "N_HOMREF",
  },
};

export const infoFieldMap = {
  AC: {
    title: "Allele Count",
    type: "int",
    cat: "general",
    desc: "Number of non-reference alleles observed.",
  },
  AF: {
    title: "Allele Frequency",
    type: "float",
    format: ".3e",
    cat: "general",
    desc: "Allele frequency.",
  },
  AN: {
    title: "Allele Number",
    type: "int",
    cat: "general",
    desc: "Total number of alleles genotyped.",
  },
  FREQ_HET: {
    title: "Het. genotype frequency",
    type: "float",
    format: ".3e",
    cat: "general",
    desc: "Heterozygous genotype frequency.",
  },
  FREQ_HOMALT: {
    title: "Hom. alt. genotype frequency",
    type: "float",
    format: ".3e",
    desc: "Homozygous alternate genotype frequency.",
  },
  FREQ_HOMREF: {
    title: "Hom. ref. genotype frequency",
    type: "float",
    format: ".3f",
    cat: "general",
    desc: "Homozygous reference genotype frequency.",
  },
  N_BI_GENOS: {
    title: "Individuals with complete genotypes",
    type: "int",
    desc: "Total number of individuals with complete genotypes.",
  },
  N_HET: {
    title: "Individuals with het. genotypes",
    type: "int",
    cat: "general",
    desc: "Number of individuals with het. genotypes.",
  },
  N_HOMALT: {
    title: "Individuals with hom. alt. genotypes",
    type: "int",
    cat: "general",
    desc: "Number of individuals with homozygous alternate genotypes.",
  },
  N_HOMREF: {
    title: "Individuals with hom. ref. genotypes",
    type: "int",
    cat: "general",
    desc: "Number of individuals with homozygous reference genotypes.",
  },

  OCN_AC: {
    title: "OCN_AC",
    type: "int",
    desc: "Number of non-reference OCN alleles observed.",
  },
  OCN_AF: {
    title: "OCN_AF",
    type: "float",
    format: ".3e",
    desc: "OCN allele frequency.",
  },
  OCN_AN: {
    title: "OCN_AN",
    type: "int",
    desc: "Total number of OCN alleles genotyped.",
  },
  OCN_FREQ_HET: {
    title: "OCN_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "OCN heterozygous genotype frequency.",
  },
  OCN_FREQ_HOMALT: {
    title: "OCN_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "OCN homozygous alternate genotype frequency.",
  },
  OCN_FREQ_HOMREF: {
    title: "OCN_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "OCN homozygous reference genotype frequency.",
  },
  OCN_N_BI_GENOS: {
    title: "OCN_N_BI_GENOS",
    type: "int",
    desc: "Total number of OCN individuals with complete genotypes.",
  },
  OCN_N_HET: {
    title: "OCN_N_HET",
    type: "int",
    desc: "Number of OCN individuals with heterozygous genotypes.",
  },
  OCN_N_HOMALT: {
    title: "OCN_N_HOMALT",
    type: "int",
    desc: "Number of OCN individuals with homozygous alternate genotypes.",
  },
  OCN_N_HOMREF: {
    title: "OCN_N_HOMREF",
    type: "int",
    desc: "Number of OCN individuals with homozygous reference genotypes.",
  },
  CAS_AC: {
    title: "CAS_AC",
    type: "int",
    desc: "Number of non-reference CAS alleles observed.",
  },
  CAS_AF: {
    title: "CAS_AF",
    type: "float",
    format: ".3e",
    desc: "CAS allele frequency.",
  },
  CAS_AN: {
    title: "CAS_AN",
    type: "int",
    desc: "Total number of CAS alleles genotyped.",
  },
  CAS_FREQ_HET: {
    title: "CAS_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "CAS heterozygous genotype frequency.",
  },
  CAS_FREQ_HOMALT: {
    title: "CAS_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "CAS homozygous alternate genotype frequency.",
  },
  CAS_FREQ_HOMREF: {
    title: "CAS_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "CAS homozygous reference genotype frequency.",
  },
  CAS_N_BI_GENOS: {
    title: "CAS_N_BI_GENOS",
    type: "int",
    desc: "Total number of CAS individuals with complete genotypes.",
  },
  CAS_N_HET: {
    title: "CAS_N_HET",
    type: "int",
    desc: "Number of CAS individuals with heterozygous genotypes.",
  },
  CAS_N_HOMALT: {
    title: "CAS_N_HOMALT",
    type: "int",
    desc: "Number of CAS individuals with homozygous alternate genotypes.",
  },
  CAS_N_HOMREF: {
    title: "CAS_N_HOMREF",
    type: "int",
    desc: "Number of CAS individuals with homozygous reference genotypes.",
  },
  SAS_AC: {
    title: "SAS_AC",
    type: "int",
    desc: "Number of non-reference SAS alleles observed.",
  },
  SAS_AF: {
    title: "SAS_AF",
    type: "float",
    format: ".3e",
    desc: "SAS allele frequency.",
  },
  SAS_AN: {
    title: "SAS_AN",
    type: "int",
    desc: "Total number of SAS alleles genotyped.",
  },
  SAS_FREQ_HET: {
    title: "SAS_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "SAS heterozygous genotype frequency.",
  },
  SAS_FREQ_HOMALT: {
    title: "SAS_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "SAS homozygous alternate genotype frequency.",
  },
  SAS_FREQ_HOMREF: {
    title: "SAS_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "SAS homozygous reference genotype frequency.",
  },
  SAS_N_BI_GENOS: {
    title: "SAS_N_BI_GENOS",
    type: "int",
    desc: "Total number of SAS individuals with complete genotypes.",
  },
  SAS_N_HET: {
    title: "SAS_N_HET",
    type: "int",
    desc: "Number of SAS individuals with heterozygous genotypes.",
  },
  SAS_N_HOMALT: {
    title: "SAS_N_HOMALT",
    type: "int",
    desc: "Number of SAS individuals with homozygous alternate genotypes.",
  },
  SAS_N_HOMREF: {
    title: "SAS_N_HOMREF",
    type: "int",
    desc: "Number of SAS individuals with homozygous reference genotypes.",
  },

  EAS_AC: {
    title: "EAS_AC",
    type: "int",
    desc: "Number of non-reference EAS alleles observed.",
  },
  EAS_AF: {
    title: "EAS_AF",
    type: "float",
    format: ".3e",
    desc: "EAS allele frequency.",
  },
  EAS_AN: {
    title: "EAS_AN",
    type: "int",
    desc: "Total number of EAS alleles genotyped.",
  },
  EAS_FREQ_HET: {
    title: "EAS_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "EAS heterozygous genotype frequency.",
  },
  EAS_FREQ_HOMALT: {
    title: "EAS_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "EAS homozygous alternate genotype frequency.",
  },
  EAS_FREQ_HOMREF: {
    title: "EAS_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "EAS homozygous reference genotype frequency.",
  },
  EAS_N_BI_GENOS: {
    title: "EAS_N_BI_GENOS",
    type: "int",
    desc: "Total number of EAS individuals with complete genotypes.",
  },
  EAS_N_HET: {
    title: "EAS_N_HET",
    type: "int",
    desc: "Number of EAS individuals with heterozygous genotypes.",
  },
  EAS_N_HOMALT: {
    title: "EAS_N_HOMALT",
    type: "int",
    desc: "Number of EAS individuals with homozygous alternate genotypes.",
  },
  EAS_N_HOMREF: {
    title: "EAS_N_HOMREF",
    type: "int",
    desc: "Number of EAS individuals with homozygous reference genotypes.",
  },
  AMR_AC: {
    title: "AMR_AC",
    type: "int",
    desc: "Number of non-reference AMR alleles observed.",
  },
  AMR_AF: {
    title: "AMR_AF",
    type: "float",
    format: ".3e",
    desc: "AMR allele frequency.",
  },
  AMR_AN: {
    title: "AMR_AN",
    type: "int",
    desc: "Total number of AMR alleles genotyped.",
  },
  AMR_FREQ_HET: {
    title: "AMR_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "AMR heterozygous genotype frequency.",
  },
  AMR_FREQ_HOMALT: {
    title: "AMR_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "AMR homozygous alternate genotype frequency.",
  },
  AMR_FREQ_HOMREF: {
    title: "AMR_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "AMR homozygous reference genotype frequency.",
  },
  AMR_N_BI_GENOS: {
    title: "AMR_N_BI_GENOS",
    type: "int",
    desc: "Total number of AMR individuals with complete genotypes.",
  },
  AMR_N_HET: {
    title: "AMR_N_HET",
    type: "int",
    desc: "Number of AMR individuals with heterozygous genotypes.",
  },
  AMR_N_HOMALT: {
    title: "AMR_N_HOMALT",
    type: "int",
    desc: "Number of AMR individuals with homozygous alternate genotypes.",
  },
  AMR_N_HOMREF: {
    title: "AMR_N_HOMREF",
    type: "int",
    desc: "Number of AMR individuals with homozygous reference genotypes.",
  },

  WAS_AC: {
    title: "WAS_AC",
    type: "int",
    desc: "Number of non-reference WAS alleles observed.",
  },
  WAS_AF: {
    title: "WAS_AF",
    type: "float",
    format: ".3e",
    desc: "WAS allele frequency.",
  },
  WAS_AN: {
    title: "WAS_AN",
    type: "int",
    desc: "Total number of WAS alleles genotyped.",
  },
  WAS_FREQ_HET: {
    title: "WAS_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "WAS heterozygous genotype frequency.",
  },
  WAS_FREQ_HOMALT: {
    title: "WAS_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "WAS homozygous alternate genotype frequency.",
  },
  WAS_FREQ_HOMREF: {
    title: "WAS_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "WAS homozygous reference genotype frequency.",
  },
  WAS_N_BI_GENOS: {
    title: "WAS_N_BI_GENOS",
    type: "int",
    desc: "Total number of WAS individuals with complete genotypes.",
  },
  WAS_N_HET: {
    title: "WAS_N_HET",
    type: "int",
    desc: "Number of WAS individuals with heterozygous genotypes.",
  },
  WAS_N_HOMALT: {
    title: "WAS_N_HOMALT",
    type: "int",
    desc: "Number of WAS individuals with homozygous alternate genotypes.",
  },
  WAS_N_HOMREF: {
    title: "WAS_N_HOMREF",
    type: "int",
    desc: "Number of WAS individuals with homozygous reference genotypes.",
  },

  AFR_AC: {
    title: "AFR_AC",
    type: "int",
    desc: "Number of non-reference AFR alleles observed.",
  },
  AFR_AF: {
    title: "AFR_AF",
    type: "float",
    format: ".3e",
    desc: "AFR allele frequency.",
  },
  AFR_AN: {
    title: "AFR_AN",
    type: "int",
    desc: "Total number of AFR alleles genotyped.",
  },
  AFR_FREQ_HET: {
    title: "AFR_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "AFR heterozygous genotype frequency.",
  },
  AFR_FREQ_HOMALT: {
    title: "AFR_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "AFR homozygous alternate genotype frequency.",
  },
  AFR_FREQ_HOMREF: {
    title: "AFR_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "AFR homozygous reference genotype frequency.",
  },
  AFR_N_BI_GENOS: {
    title: "AFR_N_BI_GENOS",
    type: "int",
    desc: "Total number of AFR individuals with complete genotypes.",
  },
  AFR_N_HET: {
    title: "AFR_N_HET",
    type: "int",
    desc: "Number of AFR individuals with heterozygous genotypes.",
  },
  AFR_N_HOMALT: {
    title: "AFR_N_HOMALT",
    type: "int",
    desc: "Number of AFR individuals with homozygous alternate genotypes.",
  },
  AFR_N_HOMREF: {
    title: "AFR_N_HOMREF",
    type: "int",
    desc: "Number of AFR individuals with homozygous reference genotypes.",
  },

  EUR_AC: {
    title: "EUR_AC",
    type: "int",
    desc: "Number of non-reference EUR alleles observed.",
  },
  EUR_AF: {
    title: "EUR_AF",
    type: "float",
    format: ".3e",
    desc: "EUR allele frequency.",
  },
  EUR_AN: {
    title: "EUR_AN",
    type: "int",
    desc: "Total number of EUR alleles genotyped.",
  },
  EUR_FREQ_HET: {
    title: "EUR_FREQ_HET",
    type: "float",
    format: ".3e",
    desc: "EUR heterozygous genotype frequency.",
  },
  EUR_FREQ_HOMALT: {
    title: "EUR_FREQ_HOMALT",
    type: "float",
    format: ".3e",
    desc: "EUR homozygous alternate genotype frequency.",
  },
  EUR_FREQ_HOMREF: {
    title: "EUR_FREQ_HOMREF",
    type: "float",
    format: ".3f",
    desc: "EUR homozygous reference genotype frequency.",
  },
  EUR_N_BI_GENOS: {
    title: "EUR_N_BI_GENOS",
    type: "int",
    desc: "Total number of EUR individuals with complete genotypes.",
  },
  EUR_N_HET: {
    title: "EUR_N_HET",
    type: "int",
    desc: "Number of EUR individuals with heterozygous genotypes.",
  },
  EUR_N_HOMALT: {
    title: "EUR_N_HOMALT",
    type: "int",
    desc: "Number of EUR individuals with homozygous alternate genotypes.",
  },
  EUR_N_HOMREF: {
    title: "EUR_N_HOMREF",
    type: "int",
    desc: "Number of EUR individuals with homozygous reference genotypes.",
  },
  SVTYPE: {
    title: "SV type",
    type: "string",
    cat: "general",
    desc: "Type of structural variant",
  },
  SVLEN: {
    title: "SVLEN",
    type: "int",
    cat: "ignore",
    desc: "Insertion length",
  },
  END: {
    title: "END",
    type: "int",
    cat: "ignore",
    desc: "End coordinate of this variant",
  },
  STRAND: {
    title: "Strand",
    type: "string",
    cat: "general",
    desc: "Insertion orientation (+/- for sense/antisense)",
  },
  REF_REP: {
    title: "REF_REP",
    type: "string",
    desc: "Fall in reference repeat copy or not",
  },
  GENE_INFO: {
    title: "Gene information",
    type: "string",
    cat: "general",
    desc: "Fall in gene region",
  },
};

export const infoFieldMapping = (str) => {
  return infoFieldMap[str];
};
