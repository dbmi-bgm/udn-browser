export const GENE_VCF_URL =
  "https://aveit-tibanna-wolf.s3.amazonaws.com/data/udn/udn.genes.20230417.vcf.gz";
export const GENE_TBI_URL =
  "https://aveit-tibanna-wolf.s3.amazonaws.com/data/udn/udn.genes.20230417.vcf.gz.tbi";

export const SELECTED_STATISTICAL_TEST = {
  value: "DeNovoWEST_pvalue",
  label: "DeNovoWEST",
};

export const STATISTICAL_TEST_OPTIONS = [
  { value: "DeNovoWEST_pvalue", label: "DeNovoWEST p" },
  { value: "biallelic_pvalue", label: "Biallelic p" },
];

export const KEGG_CATEGORY_OPTIONS = [
  { value: "amino_acid_metabolism", label: "Amino acid metabolism" },
  { value: "cancer", label: "Cancer" },
  {
    value: "carbohydrate_energy_metabolism",
    label: "Carbohydrate energy metabolism",
  },
  { value: "cell_cell_interaction", label: "Cell-cell interaction" },
  { value: "cell_cycle", label: "Cell cycle" },
  { value: "cell_motility", label: "Cell motility" },
  { value: "circadian_rhythm", label: "Circadian rhythm" },
  {
    value: "cofactor_and_vitamin_metabolism",
    label: "Cofactor and vitamin metabolism",
  },
  {
    value: "development_and_regeneration",
    label: "Development and regeneration",
  },
  { value: "dna_replication_repair", label: "DNA replication repair" },
  {
    value: "drug_targets_nuclear_receptors",
    label: "Drug targets nuclear receptors",
  },
  {
    value: "endocrine_and_metabolic_disease",
    label: "Endocrine and metabolic disease",
  },
  { value: "endocrine_system", label: "Endocrine system" },
  { value: "immune_process", label: "Immune process" },
  { value: "lipid_metabolism", label: "Lipid metabolism" },
  { value: "membrane_transport", label: "Membrane transport" },
  { value: "nervous_system", label: "Nervous system" },
  { value: "neurodegenerative_disease", label: "Neurodegenerative disease" },
  { value: "nucleotide_metabolism", label: "Nucleotide metabolism" },
  { value: "other_metabolism", label: "Other metabolism" },
  {
    value: "protein_folding_sorting_degradation",
    label: "Protein folding sorting degradation",
  },
  { value: "sensory_system", label: "Sensory system" },
  { value: "signal_transduction", label: "Signal transduction" },
  { value: "substance_dependence", label: "Substance dependence" },
  { value: "transcription", label: "Transcription" },
  { value: "translation", label: "Translation" },
  { value: "transport_and_catabolism", label: "Transport and catabolism" },
];
