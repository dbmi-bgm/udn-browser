# Undiagnosed Diseases Network Cohort Browser

Explore significantly mutated genes and rare SNV/indel variants uncovered from jointly calling whole genome sequences from ~4500 affected and unaffected individuals enrolled in the Undiagnosed Diseases Network.

The deployed version can be found here: https://dbmi-bgm.github.io/udn-browser

![image](https://github.com/dbmi-bgm/udn-browser/assets/53857412/a8962910-0a16-4be4-8e42-8c44f9d15545)

## Development

Clone the repository and run the `npm install` in the `udn-browser` folder. `npm start` will start a local webserver and the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes. You may also see any lint errors in the console.

`npm run build` will build the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified and the filenames include the hashes.

`npm run deploy` deploys the app to Gihub Pages (in this case https://dbmi-bgm.github.io/udn-browser/)

## Notes

The UDN browser is a React app and is mostly a wrapper for the Higlass browser, in particular the `GeneList` and `Cohort` track which can be found [here](https://github.com/dbmi-bgm/higlass-cohort). It adds external controls, e.g. navigation and filtering capabilities, to the interactive visualization by directly modifying the view configurations of the Higlass component. We refer to the documation of the Higlass plugin tracks for details.

There are 3 main data sources for the UDN browser.
- a VCF file containing gene-level data
- a VCF file containing variant-level data
- a BigWig file containing aggregated variant number

These files must be stored on webservers that can be access by the browser. The VCF files must be compressed (`bgzip`) and tabix-indexed. in the code the files are referenced in `src/config.js` and `src/viewConfig.json`.

### Gene-level VCF

The gene-level VCF must have the following form:
```
#CHROM  POS     ID      REF     ALT     QUAL    FILTER  INFO
chr1    685716  ENSG00000284662 .       .       0       PASS    END=686654;SYMBOL=OR4F16;go_terms=protein_binding;
chr1    923923  ENSG00000187634 .       .       0       PASS    END=944575;SYMBOL=SAMD11;go_terms=protein_binding;
chr1    944203  ENSG00000188976 .       .       0       PASS    END=959309;SYMBOL=NOC2L;go_terms=dna-binding_transcription_factor_binding|cellular_response_to_uv|chromatin_binding|histone_binding|negative_regulation_of_b_cell_apoptotic_process|negative_regulation_of_intrinsic_apoptotic_signaling_pathway|negative_regulation_of_transcription_by_rna_polymerase_ii|nucleosome_binding|protein_binding|transcription_corepressor_activity|transcription_initiation-coupled_chromatin_remodeling;
```
`POS` refers to the start position of the gene, `INFO.END` to its end. The expected info fields are `END`,`SYMBOL`,`go_terms`,`kegg_category`, `DeNovoWEST_pvalue`, `biallelic_pvalue`. Only `END`,`SYMBOL` are required.

### Variant-level VCF
The variant-level VCF must have the following form:
```
#CHROM  POS     ID      REF     ALT     QUAL    FILTER  INFO
chr1    13053   chr1_13053_G_C  G       C       .       PASS    cadd_phred=21.9;cadd_raw=2.358508;gnomADpopmax_AF=0.00118337;most_severe_consequence=splice_donor_variant;level_most_severe_consequence=HIGH;SYMBOL=DDX11L1;gene=ENSG00000223972;tran
script=ENST00000450305;cdna_change=n.260+1G>C;case_AC=0;case_AN=1385;case_AF=0.0;control_AC=1;control_AN=2112;control_AF=0.0004734848484848485
chr1    13054   chr1_13054_C_A  C       A       .       PASS    cadd_phred=16.43;cadd_raw=1.608658;gnomADpopmax_AF=0.000679612;most_severe_consequence=splice_donor_variant;level_most_severe_consequence=HIGH;SYMBOL=DDX11L1;gene=ENSG00000223972;tr
anscript=ENST00000450305;cdna_change=n.260+2C>A;case_AC=1;case_AN=1385;case_AF=0.0007220216606498195;control_AC=1;control_AN=2112;control_AF=0.0004734848484848485
chr1    13453   chr1_13453_T_C  T       C       .       PASS    cadd_phred=12.41;cadd_raw=1.065405;gnomADpopmax_AF=0.000812719;most_severe_consequence=splice_region_variant;level_most_severe_consequence=LOW;SYMBOL=DDX11L1;gene=ENSG00000223972;tr
anscript=ENST00000450305;cdna_change=n.415T>C;case_AC=1;case_AN=1384;case_AF=0.000722543352601156;control_AC=0;control_AN=2130;control_AF=0.0
```
`POS` refers to the start position of the variant. The currently expected values can be extraced from the cohort track definition `src/viewConfig.json`.

It is important to note, that a VCF of this form will not be compatible with the Cohort track within the UDN browser. The track expect a **multiresolution version** of this file to enable genome wide browser without the need to load the entire file into memory. The [Higlass Data](https://github.com/dbmi-bgm/higlass-data) package can be used to create a Cohort track compatible VCF.

## BigWig file

The required BigWig file can be created by executing the commands `create-coverage-bed` and `convert-bed-to-bw` in the [Higlass Data](https://github.com/dbmi-bgm/higlass-data) package for the non-multiresolution version of the variant-level VCF file.
